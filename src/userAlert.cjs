// Decides whether a source-verified bulletin covers the user's own position.
// Inputs are limited to P2PQuake/JMA report fields and JMA-published area
// geometry. No shaking field, tsunami travel or inundation is simulated.
const {parseReportTime}=require("./dateTime.cjs");
const {validShindo,shindoFromLabel,INTENSITY}=require("./hazardSeverity.cjs");

const EARTH_RADIUS_KM=6371;
// Shindo 4 and above: most people are startled (JMA intensity scale).
const MIN_ALARM_SHINDO=40;
// Fallback when no verified area geometry matches: epicenter proximity.
const NEAR_EPICENTER_KM=50;
// Distance from a JMA tsunami forecast coastline treated as "on that coast".
const NEAR_COAST_KM=10;
// Ignore history replayed at launch; bulletins older than this never alarm.
const QUAKE_WINDOW_MS=10*60*1000;
const TSUNAMI_WINDOW_MS=60*60*1000;

const finite=(v)=>typeof v==="number" && Number.isFinite(v);
function validPoint(p) {
  return !!p && finite(Number(p.latitude)) && finite(Number(p.longitude)) &&
    Math.abs(Number(p.latitude))<=90 && Math.abs(Number(p.longitude))<=180;
}
const rad=(d)=>d*Math.PI/180;
function distanceKm(a,b) {
  if(!validPoint(a) || !validPoint(b))return null;
  const dLat=rad(b.latitude-a.latitude),dLon=rad(b.longitude-a.longitude);
  const h=Math.sin(dLat/2)**2+
    Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLon/2)**2;
  return 2*EARTH_RADIUS_KM*Math.asin(Math.min(1,Math.sqrt(h)));
}
// GeoJSON rings are [longitude, latitude].
function ringContains(point,ring) {
  if(!Array.isArray(ring) || ring.length<4)return false;
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const [xi,yi]=ring[i]||[],[xj,yj]=ring[j]||[];
    if(!finite(xi)||!finite(yi)||!finite(xj)||!finite(yj))continue;
    if((yi>point.latitude)!==(yj>point.latitude) &&
      point.longitude<(xj-xi)*(point.latitude-yi)/(yj-yi)+xi) inside=!inside;
  }
  return inside;
}
function polygonContains(point,rings) {
  if(!Array.isArray(rings) || !ringContains(point,rings[0]))return false;
  return !rings.slice(1).some((hole)=>ringContains(point,hole));
}
function geometryContains(point,geometry) {
  if(!validPoint(point) || !geometry)return false;
  if(geometry.type==="Polygon")return polygonContains(point,geometry.coordinates);
  if(geometry.type==="MultiPolygon" && Array.isArray(geometry.coordinates))
    return geometry.coordinates.some((rings)=>polygonContains(point,rings));
  return false;
}
// Equirectangular projection is accurate enough at the 10 km scale.
function segmentDistanceKm(p,a,b) {
  const k=Math.cos(rad(p.latitude));
  const ax=(a[0]-p.longitude)*k,ay=a[1]-p.latitude;
  const bx=(b[0]-p.longitude)*k,by=b[1]-p.latitude;
  const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
  const t=len>0?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/len)):0;
  const x=ax+t*dx,y=ay+t*dy;
  return Math.sqrt(x*x+y*y)*rad(1)*EARTH_RADIUS_KM;
}
function lineDistanceKm(point,line) {
  if(!validPoint(point) || !Array.isArray(line) || line.length<2)return null;
  let best=null;
  for(let i=1;i<line.length;i++) {
    const a=line[i-1],b=line[i];
    if(!Array.isArray(a)||!Array.isArray(b)||![a[0],a[1],b[0],b[1]].every(finite))continue;
    const d=segmentDistanceKm(point,a,b);
    if(best===null || d<best)best=d;
  }
  return best;
}
function geometryDistanceKm(point,geometry) {
  if(!geometry)return null;
  const lines=geometry.type==="LineString" ? [geometry.coordinates] :
    geometry.type==="MultiLineString" ? geometry.coordinates :
    geometry.type==="Polygon" ? geometry.coordinates.slice(0,1) :
    geometry.type==="MultiPolygon" ? geometry.coordinates.map((p)=>p[0]) : [];
  let best=null;
  for(const line of Array.isArray(lines)?lines:[]) {
    const d=lineDistanceKm(point,line);
    if(d!==null && (best===null || d<best))best=d;
  }
  return best;
}
function reportAgeMs(report,now) {
  const date=parseReportTime(report?.issuedAt || report?.time);
  return date ? now-date.getTime() : null;
}
function zoneShindo(props) {
  const direct=validShindo(props?.scale);
  if(direct!==null)return direct;
  const match=String(props?.value||"").match(/^(?:Shindo\s+)?(.+)$/);
  return match ? shindoFromLabel(match[1]) : null;
}
/**
 * @param report normalized report from src/data.js
 * @param user {latitude, longitude} from the device (foreground only)
 * @param zones GeoJSON features from matchHazardZones (may be empty)
 * @returns null or {level:"alarm"|"notice", reason, category, shindo?, grade?, distanceKm?}
 */
function evaluateUserImpact(report,user,zones=[],now=Date.now()) {
  if(!report || report.cancelled || !validPoint(user))return null;
  const age=reportAgeMs(report,now);
  if(age===null || age<-5*60*1000)return null;
  const features=Array.isArray(zones)?zones:[];
  if(report.category==="earthquake") {
    if(age>QUAKE_WINDOW_MS)return null;
    let inside=null;
    for(const feature of features) {
      const scale=zoneShindo(feature?.properties);
      if(scale===null || scale<MIN_ALARM_SHINDO)continue;
      if(geometryContains(user,feature.geometry) && (inside===null || scale>inside))inside=scale;
    }
    if(inside!==null) return {level:"alarm",category:"earthquake",
      reason:report.predicted?"insideForecastArea":"insideShindoArea",
      shindo:INTENSITY[inside].label};
    const maxScale=validShindo(report.shindoCode);
    const distance=distanceKm(user,report.coordinate);
    if(distance!==null && distance<=NEAR_EPICENTER_KM &&
      (report.urgent || (maxScale!==null && maxScale>=MIN_ALARM_SHINDO))) {
      return {level:"alarm",category:"earthquake",reason:"nearEpicenter",
        shindo:maxScale!==null?INTENSITY[maxScale].label:null,
        distanceKm:Math.round(distance)};
    }
    return null;
  }
  if(report.category==="tsunami") {
    if(age>TSUNAMI_WINDOW_MS)return null;
    const rank={advisory:1,warning:2,majorWarning:3};
    let best=null;
    for(const feature of features) {
      const grade=feature?.properties?.grade;
      if(!rank[grade])continue;
      const d=geometryDistanceKm(user,feature.geometry);
      if(d===null || d>NEAR_COAST_KM)continue;
      if(!best || rank[grade]>rank[best.grade] ||
        (rank[grade]===rank[best.grade] && d<best.distance)) best={grade,distance:d};
    }
    if(!best)return null;
    return {level:best.grade==="advisory"?"notice":"alarm",category:"tsunami",
      reason:"nearTsunamiCoast",grade:best.grade,distanceKm:Math.max(0,Math.round(best.distance))};
  }
  return null;
}
// Reports worth fetching area geometry for before evaluation.
function alertCandidate(report,now=Date.now()) {
  if(!report || report.cancelled)return false;
  const age=reportAgeMs(report,now);
  if(age===null || age<-5*60*1000)return false;
  if(report.category==="earthquake")return age<=QUAKE_WINDOW_MS;
  if(report.category==="tsunami")return age<=TSUNAMI_WINDOW_MS &&
    ["advisory","warning","majorWarning"].includes(report.tsunamiStatus);
  return false;
}
module.exports={distanceKm,geometryContains,geometryDistanceKm,evaluateUserImpact,
  alertCandidate,MIN_ALARM_SHINDO,NEAR_EPICENTER_KM,NEAR_COAST_KM};

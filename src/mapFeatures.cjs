// Rendering anchors are derived from official JMA area geometry, NOT from
// made-up seismic station coordinates or simulated quake wave propagation.
// A badge represents an affected *area*, not an exact observation point.
function coordinate(raw) {
  if (!Array.isArray(raw) || raw.length < 2) return null;
  const longitude=raw[0], latitude=raw[1];
  return typeof latitude==="number" && typeof longitude==="number" &&
    Number.isFinite(latitude) && Number.isFinite(longitude) &&
    Math.abs(latitude)<=90 && Math.abs(longitude)<=180 ?
      {latitude,longitude}:null;
}
function color(value) {
  return typeof value==="string" && /^#[0-9a-fA-F]{6}$/.test(value) ?
    value : "#82909A";
}
function downsample(raw,max=500) {
  if (!Array.isArray(raw) || raw.length < 2) return [];
  const step=Math.max(1,Math.ceil((raw.length-1)/(max-1)));
  const result=[];
  for(let i=0;i<raw.length;i+=step) {
    const p=coordinate(raw[i]);
    if(p)result.push(p);
  }
  const last=coordinate(raw[raw.length-1]);
  if(last && (!result.length || result[result.length-1].latitude!==last.latitude ||
    result[result.length-1].longitude!==last.longitude)) result.push(last);
  return result;
}
function ringArea(ring) {
  let area=0;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++)
    area+=(ring[j].longitude*ring[i].latitude-ring[i].longitude*ring[j].latitude);
  return area/2;
}
function ringContains(p,ring) {
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[i],b=ring[j];
    if((a.latitude>p.latitude)!==(b.latitude>p.latitude) &&
      p.longitude<(b.longitude-a.longitude)*(p.latitude-a.latitude)/
        (b.latitude-a.latitude)+a.longitude) inside=!inside;
  }
  return inside;
}
function polygonAnchor(ring) {
  if(ring.length<3)return null;
  let sumX=0,sumY=0,crossSum=0;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[j],b=ring[i],cross=a.longitude*b.latitude-b.longitude*a.latitude;
    crossSum+=cross;sumX+=(a.longitude+b.longitude)*cross;
    sumY+=(a.latitude+b.latitude)*cross;
  }
  if(Math.abs(crossSum)>1e-12) {
    const centroid={longitude:sumX/(3*crossSum),latitude:sumY/(3*crossSum)};
    if(ringContains(centroid,ring))return centroid;
  }
  // Verified region boundary vertices are a safe fallback display location.
  // They are NOT treated as instrument locations.
  const index=Math.floor(ring.length/3);
  return ring[index];
}
function asPolygon(raw) {
  if(!Array.isArray(raw) || !raw.length)return null;
  const outer=downsample(raw[0]);
  if(outer.length<4)return null;
  return {coordinates:outer,holes:raw.slice(1,8).map(r=>downsample(r))
    .filter(r=>r.length>=4)};
}
function buildMapZones(features) {
  const polygons=[],lines=[],markers=[];
  for(const [index,feature] of (Array.isArray(features)?features:[]).slice(0,60).entries()) {
    const geom=feature?.geometry||{},props=feature?.properties||{};
    const tint=color(props.color);
    const polygonsInFeature=[];
    const emitPolygon=(raw)=> {
      const polygon=asPolygon(raw);
      if(!polygon)return;
      polygons.push({key:`poly-${index}-${polygons.length}`,...polygon,color:tint,
        label:String(props.label||"").slice(0,180),value:String(props.value||"").slice(0,64)});
      polygonsInFeature.push(polygon.coordinates);
    };
    const emitLine=(raw)=>{
      const coordinates=downsample(raw,700);
      if(coordinates.length>1) lines.push({key:`line-${index}-${lines.length}`,
        coordinates,color:tint,label:String(props.label||"").slice(0,180),
        value:String(props.value||"").slice(0,64)});
    };
    if(geom.type==="Polygon")emitPolygon(geom.coordinates);
    if(geom.type==="MultiPolygon" && Array.isArray(geom.coordinates))
      geom.coordinates.slice(0,20).forEach(emitPolygon);
    if(geom.type==="LineString")emitLine(geom.coordinates);
    if(geom.type==="MultiLineString" && Array.isArray(geom.coordinates))
      geom.coordinates.slice(0,30).forEach(emitLine);
    if(props.kind!=="observedIntensity" || !polygonsInFeature.length)continue;
    const outer=polygonsInFeature.reduce((best,ring)=>
      !best || Math.abs(ringArea(ring))>Math.abs(ringArea(best))?ring:best,null);
    const anchor=polygonAnchor(outer);
    const match=String(props.value||"").match(/^Shindo\s+([0-7](?:[+-])?|≥5- \(estimated\))$/);
    if(anchor && match)markers.push({
      key:`zone-${index}`,coordinate:anchor,color:tint,shortLabel:match[1],
      value:String(props.value),title:String(props.label||"").slice(0,180)
    });
  }
  return {polygons,lines,markers};
}
module.exports={coordinate,downsample,ringContains,polygonAnchor,buildMapZones};

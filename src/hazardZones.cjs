// Safely match ONLY JMA-published zones to the selected P2PQuake report.
// The colored areas describe published observations/forecast areas, NOT a
// physical earthquake propagation simulation or a tsunami inundation model.
const EARTHQUAKE_GEOJSON = "https://www.jma.go.jp/bosai/common/const/geojson/earthquake.json";
const TSUNAMI_GEOJSON = "https://www.jma.go.jp/bosai/common/const/geojson/tsunami.json";
const INTENSITY_COLORS = {
  10:"#6AB4E6", 20:"#2C96C8", 30:"#4FBF8B", 40:"#F0CA47",
  45:"#F59D38", 46:"#E97D2E", 50:"#E75B33", 55:"#D63B4A",
  60:"#AB3170", 70:"#713EA2"
};
const GRADE_COLORS = {majorWarning:"#9F276E",warning:"#E23D3D",advisory:"#F2B335"};
function norm(value) {
  return String(value == null ? "" : value).normalize("NFKC").replace(/\s+/g,"").trim();
}
function regionReports(report) {
  if (!report || report.cancelled) return [];
  if (report.category==="earthquake") {
    const raw = Array.isArray(report.shakingAreas) ? report.shakingAreas : [];
    // Station readings cannot be placed without station coordinates.
    return raw.filter((a) => a.isArea && a.name && INTENSITY_COLORS[a.scale])
      .map((a) => ({
        name:a.name, code:a.code == null ? null : String(a.code),
        value:a.scaleLabel || String(a.scale), color:INTENSITY_COLORS[a.scale],
        fill:true,kind:"observedIntensity"
      }));
  }
  if (report.category==="tsunami") {
    return (Array.isArray(report.tsunamiAreas) ? report.tsunamiAreas : [])
      .filter((a)=>a.name && GRADE_COLORS[a.grade])
      .map((a)=>({
        name:a.name, code:a.code == null ? null : String(a.code),
        value:a.grade, color:GRADE_COLORS[a.grade], fill:false,kind:"forecastCoast"
      }));
  }
  return [];
}
function matchHazardZones(geojson,report,displayName=(s)=>s) {
  const requested = regionReports(report);
  if (!requested.length || geojson?.type!=="FeatureCollection" ||
    !Array.isArray(geojson.features)) return [];
  const byCode = new Map(), byName = new Map();
  for (const r of requested) {
    if(r.code) byCode.set(norm(r.code),r);
    byName.set(norm(r.name),r);
  }
  const matched = [];
  let totalBytes = 0;
  for (const feature of geojson.features) {
    const geom = feature?.geometry;
    if (!geom || !["Polygon","MultiPolygon","LineString","MultiLineString"].includes(geom.type)) continue;
    const props=feature.properties || {};
    const zone = (props.code!=null ? byCode.get(norm(props.code)) : null) ||
      byName.get(norm(props.name));
    if (!zone) continue;
    const geomJson = JSON.stringify(geom);
    if (geomJson.length > 350000 || totalBytes + geomJson.length > 1400000) continue;
    totalBytes += geomJson.length;
    matched.push({
      type:"Feature", geometry:geom,
      properties:{
        label:String(displayName(zone.name)).slice(0,280),
        value:String(zone.value).slice(0,64),
        color:zone.color,
        kind:zone.kind, fill:zone.fill
      }
    });
    if (matched.length>=60) break;
  }
  return matched;
}
module.exports={EARTHQUAKE_GEOJSON,TSUNAMI_GEOJSON,INTENSITY_COLORS,GRADE_COLORS,
  regionReports,matchHazardZones};

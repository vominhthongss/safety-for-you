import { fetchJson } from "./data";
const {EARTHQUAKE_GEOJSON,TSUNAMI_GEOJSON,regionReports,matchHazardZones} =
  require("./hazardZones.cjs");
// Caches official zone boundary geometry (not the alert) for 24 hours.
// Event intensity/grades always come from the SELECTED P2PQuake report.
const cache=new Map();
async function officialGeometry(url) {
  const now=Date.now();
  let item=cache.get(url);
  if (!item || now-item.savedAt > 24*60*60*1000) {
    item={promise:fetchJson(url),savedAt:now};
    cache.set(url,item);
  }
  try {
    return await item.promise;
  } catch (error) {
    cache.delete(url);
    throw error;
  }
}
const geometryUrl=(report)=>report.category==="tsunami" ? TSUNAMI_GEOJSON : EARTHQUAKE_GEOJSON;
export async function loadHazardZones(report,formatName=(s)=>s,t=(s)=>s) {
  if (!regionReports(report).length) return [];
  const geojson=await officialGeometry(geometryUrl(report));
  return matchHazardZones(geojson,report,formatName).map((feature)=>({
    ...feature,
    properties:{
      ...feature.properties,
      value: report.category==="tsunami" ?
        t(feature.properties.value) : "Shindo " + feature.properties.value
    }
  }));
}
// Untranslated JMA areas (including EEW forecast areas) for the user alarm.
export async function loadAlertZones(report) {
  if (!regionReports(report,{includeForecast:true}).length) return [];
  const geojson=await officialGeometry(geometryUrl(report));
  return matchHazardZones(geojson,report,(s)=>s,{includeForecast:true});
}

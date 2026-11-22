import { fetchJson } from "./data";
const {EARTHQUAKE_GEOJSON,TSUNAMI_GEOJSON,regionReports,matchHazardZones} =
  require("./hazardZones.cjs");
// Caches official zone boundary geometry (not the alert) for 24 hours.
// Event intensity/grades always come from the SELECTED P2PQuake report.
const cache=new Map();
export async function loadHazardZones(report,formatName=(s)=>s,t=(s)=>s) {
  const areas=regionReports(report);
  if (!areas.length) return [];
  const url=report.category==="tsunami" ? TSUNAMI_GEOJSON : EARTHQUAKE_GEOJSON;
  const now=Date.now();
  let item=cache.get(url);
  if (!item || now-item.savedAt > 24*60*60*1000) {
    item={promise:fetchJson(url),savedAt:now};
    cache.set(url,item);
  }
  try {
    const geojson=await item.promise;
    return matchHazardZones(geojson,report,formatName).map((feature)=>({
      ...feature,
      properties:{
        ...feature.properties,
        value: report.category==="tsunami" ?
          t(feature.properties.value) : "Shindo " + feature.properties.value
      }
    }));
  } catch (error) {
    cache.delete(url);
    throw error;
  }
}

import { CONFIG, SHELTER_LAYERS } from "./config";
const { earthquakeDetails, normalizeTsunamiAreas, tsunamiStatus, tsunamiSummary, weatherDetails, scaleLabel } =
  require("./hazardFacts.cjs");

const finite = (value) => value !== null && value !== "" && Number.isFinite(Number(value));
const coords = (lat, lon) => {
  const latitude = Number(lat), longitude = Number(lon);
  return finite(lat) && finite(lon) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180 &&
    !(latitude === 0 && longitude === 0) ? { latitude, longitude } : null;
};
const timeValue = (time) => {
  const date = new Date(String(time || "").replace(/^(\d{4})\/(\d\d)\/(\d\d) (\d\d:\d\d:\d\d)/, "$1-$2-$3T$4+09:00"));
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
};
export function mergeReports(previous = [], incoming = []) {
  const indexed = new Map();
  for (const item of [...previous, ...incoming]) if (item?.id) indexed.set(item.id, item);
  return [...indexed.values()].sort((a,b) => timeValue(b.time) - timeValue(a.time)).slice(0, 100);
}
export function normalizeQuake(raw) {
  if (![551, 552, 556].includes(raw?.code)) return null;
  const tsunami = raw.code === 552;
  const eq = raw.earthquake || {};
  const hypo = eq.hypocenter || {};
  const tsunamiAreas = tsunamiSummary(normalizeTsunamiAreas(raw.areas));
  // P2PQuake observation points supply intensity; only isArea=true can
  // match official JMA intensity-zone boundaries without geocoding guesses.
  const shakingAreas = raw.code === 551 && Array.isArray(raw.points) ?
    raw.points.filter((p)=>p?.isArea === true && p.addr && Number.isFinite(Number(p.scale)))
      .map((p)=>({name:String(p.addr),code:p.code || null,
        scale:Number(p.scale),scaleLabel:scaleLabel(p.scale),isArea:true})) : [];

  // EEW (556) forecast areas: used only to check the user's own area.
  const forecastAreas = raw.code === 556 && Array.isArray(raw.areas) ?
    raw.areas.filter((a)=>a?.name && scaleLabel(a.scaleFrom))
      .map((a)=>({name:String(a.name),scale:Number(a.scaleFrom),
        scaleLabel:scaleLabel(a.scaleFrom)})).slice(0,200) : [];
  const area = tsunamiAreas.slice(0, 5).map((a) => a.name).join(" · ");
  const detail = tsunami ? null : earthquakeDetails(raw);
  const cancelled = tsunami ? raw.cancelled === true : detail.cancelled;
  return {
    id: "p2p-" + (raw.id || raw.code + "-" + raw.time),
    category: tsunami ? "tsunami" : "earthquake",
    title: tsunami ? (cancelled ? "津波警報・注意報解除" : (area || "津波情報")) :
      (hypo.name || "地震情報"),
    description: tsunami ? (cancelled ? "津波予報の解除情報" : "津波の予想と対象地域") :
      (raw.code === 556 ? "緊急地震速報（警報）" : "気象庁 地震情報"),
    source: "P2PQuake / JMA",
    time: tsunami ? raw.issue?.time || raw.time : (eq.time || eq.originTime || raw.issue?.time || raw.time),
    issuedAt: raw.issue?.time || raw.time,
    receivedAt: raw.time,
    coordinate: tsunami ? null : coords(hypo.latitude, hypo.longitude),
    magnitude: detail?.magnitude ?? null,
    shindo: detail?.shindo ?? null,
    shindoCode: detail?.shindoCode ?? null,
    predicted: detail?.predicted ?? false,
    depthKm: detail?.depthKm ?? null,
    tsunamiRisk: detail?.domesticTsunami ?? null,
    tsunamiAreas,
    shakingAreas,
    forecastAreas,
    tsunamiStatus: tsunamiStatus(tsunamiAreas, cancelled),
    cancelled,
    urgent: raw.code === 556 && !cancelled,
    url: tsunami ? "https://www.jma.go.jp/bosai/map.html#contents=tsunami" :
      "https://www.jma.go.jp/bosai/map.html#contents=earthquake_map",
    rawCode: raw.code
  };
}
export async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally { clearTimeout(timeout); }
}
export async function getQuakeReports() {
  const codes = [551, 552, 556].map((c) => "codes=" + c).join("&");
  const data = await fetchJson(CONFIG.p2pApi + "/history?" + codes + "&limit=60");
  if (!Array.isArray(data)) throw new Error("Unexpected P2PQuake response");
  return data.map(normalizeQuake).filter(Boolean);
}
export async function getWeatherReports() {
  if (!CONFIG.jmaProxy) throw new Error("JMA_NOT_CONFIGURED");
  const payload = await fetchJson(CONFIG.jmaProxy + "/hazards");
  if (!Array.isArray(payload?.items)) throw new Error("Unexpected JMA response");
  return payload.items.filter((r) => r.id && r.category && r.time && r.source === "JMA")
    .map((r) => ({
      id: r.id, category: r.category, title: r.title, description: r.description || "",
      coordinate: coords(r.coordinate?.latitude, r.coordinate?.longitude),
      time: r.time, issuedAt:r.time, source: "JMA", url: r.url, urgent: false,
      bulletinKind: "recent", weatherMetric: weatherDetails(r.category, r.metrics),
      // Only explicitly verified grade fields from a structured official adapter.
      // Current JMA Atom headline Worker does not supply this metadata.
      severityVerified: r.severity?.verified === true,
      warningGrade: ["advisory","warning","emergency"].includes(r.severity?.grade)
        ? r.severity.grade : null
    }));
}
function lonToX(lon, z) { return Math.floor((lon + 180) / 360 * (2 ** z)); }
function latToY(lat, z) {
  const constrained = Math.min(85, Math.max(-85, lat)) * Math.PI / 180;
  return Math.floor((1 - Math.asinh(Math.tan(constrained)) / Math.PI) / 2 * 2 ** z);
}
export function tileCoordinates(location, z = 10) {
  const x = lonToX(location.longitude, z), y = latToY(location.latitude, z);
  const tiles = [];
  for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++) {
    tiles.push({ z, x: x+dx, y: y+dy });
  }
  return tiles;
}
const hazardKeys = ["flood", "landslide", "typhoon", "earthquake", "tsunami", "fire", "rain", "volcano"];
export function validShelter(feature, selected) {
  const geometry = feature?.geometry;
  if (geometry?.type !== "Point" || !Array.isArray(geometry?.coordinates)) return null;
  const c = coords(geometry.coordinates[1], geometry.coordinates[0]);
  if (!c) return null;
  const p = feature.properties || {};
  const suitable = hazardKeys.filter((name, i) => Number(p["disaster" + (i + 1)]) === 1);
  if (!suitable.includes(selected)) return null;
  return { id: [p.name || "site", c.latitude, c.longitude].join("-"),
    name: String(p.name || "指定緊急避難場所"), address: String(p.address || ""),
    remarks: String(p.remarks || ""), coordinate: c, suitable };
}
export async function getShelters(location, hazard) {
  const layer = SHELTER_LAYERS[hazard];
  if (!location || !layer) return [];
  const tiles = tileCoordinates(location);
  const results = await Promise.allSettled(tiles.map(async (t) => {
    const url = CONFIG.gsiTiles + "/" + layer.tile + "/" + t.z + "/" + t.x + "/" + t.y + ".geojson";
    const data = await fetchJson(url);
    return (data.features || []).map((f) => validShelter(f, hazard)).filter(Boolean);
  }));
  if (results.every((r) => r.status === "rejected")) throw new Error("GSI_UNAVAILABLE");
  const seen = new Map();
  for (const item of results) if (item.status === "fulfilled") for (const p of item.value) seen.set(p.id, p);
  const distance2 = (p) => (p.coordinate.latitude-location.latitude)**2 + (p.coordinate.longitude-location.longitude)**2;
  return [...seen.values()].sort((a,b) => distance2(a)-distance2(b)).slice(0, 100);
}
export function isVeryRecentUrgent(report, now = Date.now()) {
  const t = timeValue(report?.time);
  return !!report?.urgent && t > 0 && now - t >= 0 && now - t < 2 * 60 * 1000;
}

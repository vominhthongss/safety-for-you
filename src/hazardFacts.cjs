// Source-backed hazard details. This module is CommonJS so node:test can
// exercise the exact same pure normalization used in the Expo app.
const SCALE_LABELS = {
  0:"0", 10:"1", 20:"2", 30:"3", 40:"4",
  45:"5-", 46:"5-+", 50:"5+", 55:"6-", 60:"6+", 70:"7"
};
const TSUNAMI_GRADES = {
  MajorWarning:"majorWarning", Warning:"warning", Watch:"advisory",
  Unknown:"unspecified"
};
const numeric = (value) => value !== null && value !== undefined &&
  value !== "" && Number.isFinite(Number(value));
const scalar = (value) => numeric(value) ? Number(value) : null;
const maybeText = (value) => typeof value === "string" && value.trim() ? value.trim() : null;

function scaleLabel(code) {
  return SCALE_LABELS[Number(code)] || null;
}
function maxPredictedScale(areas) {
  const values = Array.isArray(areas) ?
    areas.map((a) => scalar(a.scaleTo)).filter((v) => v !== null && SCALE_LABELS[v]) : [];
  return values.length ? Math.max(...values) : null;
}

// A forecast with a qualitative descriptor ("巨大" / "高い") must not
// acquire a made-up numeric height. The text is authoritative as published.
function tsunamiHeight(value) {
  if (!value || typeof value !== "object") return null;
  const description = maybeText(value.description);
  if (description === "巨大" || description === "高い") {
    return { type:"description", description };
  }
  if (description === "１０ｍ超" || description === "10m超") {
    return { type:"over", meters:10 };
  }
  if (description === "０．２ｍ未満" || description === "0.2m未満") {
    return { type:"under", meters:0.2 };
  }
  const meters = scalar(value.value);
  if (meters !== null && meters >= 0 && meters < 1000) return { type:"meters", meters };
  if (description) return { type:"description", description };
  return null;
}
function normalizeTsunamiAreas(areas) {
  if (!Array.isArray(areas)) return [];
  return areas.map((area) => ({
    name: maybeText(area.name),
    code: area.code == null ? null : String(area.code),
    grade: TSUNAMI_GRADES[area.grade] || "unspecified",
    forecastHeight: tsunamiHeight(area.maxHeight),
    arrivalTime: maybeText(area.firstHeight?.arrivalTime),
    arrivalCondition: maybeText(area.firstHeight?.condition),
    immediate: area.immediate === true
  })).filter((area) => area.name).slice(0, 100);
}
function tsunamiStatus(areas, cancelled) {
  if (cancelled) return "cancelled";
  if (areas.some((a) => a.grade === "majorWarning")) return "majorWarning";
  if (areas.some((a) => a.grade === "warning")) return "warning";
  if (areas.some((a) => a.grade === "advisory")) return "advisory";
  return null;
}
function tsunamiSummary(areas) {
  // Never reduce a regional forecast to a single Japan-wide number.
  const byGrade = { majorWarning:3, warning:2, advisory:1, unspecified:0 };
  return [...areas].sort((a,b) => byGrade[b.grade] - byGrade[a.grade]);
}
function earthquakeDetails(raw) {
  const eq = raw.earthquake || {};
  const hypo = eq.hypocenter || {};
  const forecast = raw.code === 556;
  const scale = forecast ? maxPredictedScale(raw.areas) : scalar(eq.maxScale);
  return {
    magnitude: scalar(hypo.magnitude) !== null && Number(hypo.magnitude) >= 0 && Number(hypo.magnitude) <= 10 ?
      Number(hypo.magnitude) : null,
    shindo: scaleLabel(scale),
    predicted: forecast,
    depthKm: scalar(hypo.depth) !== null && Number(hypo.depth) >= 0 ? Number(hypo.depth) : null,
    domesticTsunami: maybeText(eq.domesticTsunami),
    cancelled: forecast && raw.cancelled === true
  };
}

// Numeric weather measurements are accepted only when a trusted backend
// explicitly supplies typed fields extracted from a verified official report.
// Today the JMA Atom headline adapter supplies none; blank means unavailable.
const WEATHER_FIELDS = {
  rain:"rainfallMm", typhoon:"windSpeedMs", flood:"riverLevelM",
  landslide:"rainfallMm", volcano:"volcanoAlertLevel",
  snow:"snowfallCm", heat:"temperatureC"
};
function weatherDetails(category, trustedMetrics) {
  const field = WEATHER_FIELDS[category];
  if (!field || !trustedMetrics || typeof trustedMetrics !== "object") return null;
  const value = scalar(trustedMetrics[field]);
  if (value === null) return null;
  if (field === "volcanoAlertLevel" && (!Number.isInteger(value) || value < 1 || value > 5)) return null;
  if (field !== "temperatureC" && (value < 0 || value > 20000)) return null;
  if (field === "temperatureC" && (value < -100 || value > 70)) return null;
  return { key:field, value };
}
module.exports = { SCALE_LABELS, scaleLabel, numeric, scalar, tsunamiHeight,
  normalizeTsunamiAreas, tsunamiStatus, tsunamiSummary,
  earthquakeDetails, weatherDetails };

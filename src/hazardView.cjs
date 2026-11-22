// Source-backed metric display values only. No synthetic measurements.
const {numeric} = require("./hazardFacts.cjs");
const WEATHER_META = {
  rainfallMm: ["rainfall", "mm"],
  windSpeedMs: ["windSpeed", "m/s"],
  riverLevelM: ["riverLevel", "m"],
  volcanoAlertLevel: ["volcanoLevel", ""],
  snowfallCm: ["snowfall", "cm"],
  temperatureC: ["temperature", "°C"]
};
function formatNumber(value) {
  if (!numeric(value)) return null;
  return String(Number(value));
}
function heightText(height, t) {
  if (!height) return null;
  if (height.type === "description") return height.description;
  if (height.type === "under") return "< " + height.meters + " m";
  if (height.type === "over") return "> " + height.meters + " m";
  if (height.type === "meters" && numeric(height.meters))
    return formatNumber(height.meters) + " m";
  return null;
}
function reportMetrics(report, t) {
  if (!report) return [];
  const result = [];
  if (report.category === "earthquake") {
    const m = formatNumber(report.magnitude);
    if (m !== null) result.push({key:"magnitude",label:t("magnitude"),value:"M " + m});
    if (report.shindo) result.push({
      key:"shindo",label:t(report.predicted ? "predictedIntensity" : "intensity"),
      value:report.shindo
    });
    const depth = formatNumber(report.depthKm);
    if (depth !== null) result.push({key:"depth",label:t("depth"),value:depth+" km"});
    if (report.cancelled) result.push({key:"cancelled",label:t("status"),value:t("cancelled")});
  } else if (report.category === "tsunami") {
    if (report.tsunamiStatus) result.push({
      key:"tsunamiStatus",label:t("status"),value:t(report.tsunamiStatus)
    });
    const first = report.tsunamiAreas?.[0];
    if (first && !report.cancelled) {
      const height = heightText(first.forecastHeight, t);
      if (height) result.push({key:"forecastHeight",label:t("forecastHeight"),
        value:height,area:first.name});
    }
  } else if (report.weatherMetric?.key && WEATHER_META[report.weatherMetric.key]) {
    const metric = report.weatherMetric;
    const [key,unit] = WEATHER_META[metric.key];
    const n=formatNumber(metric.value);
    if (n !== null) result.push({key:metric.key,label:t(key),value:n+(unit ? " "+unit : "")});
  }
  return result;
}
module.exports = {formatNumber,heightText,reportMetrics};

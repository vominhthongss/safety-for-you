export { COLORS,getColors } from "./theme";

export const CONFIG = {
  splashMinMs: Math.min(600, Math.max(0, Number(process.env.EXPO_PUBLIC_SPLASH_MIN_MS) || 0)),
  refreshMs: Math.max(60000, (Number(process.env.EXPO_PUBLIC_REFRESH_SECONDS) || 120) * 1000),
  jmaProxy: (process.env.EXPO_PUBLIC_JMA_PROXY_URL || "").replace(/\/$/, ""),
  // Public privacy policy (docs/privacy/ published with GitHub Pages).
  privacyPolicyUrl: (process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ||
    "https://vominhthongss.github.io/safety-for-you/privacy/").trim(),
  romajiService: (process.env.EXPO_PUBLIC_ROMAJI_API_URL || "").replace(new RegExp("/$"), ""),
  p2pApi: "https://api.p2pquake.net/v2",
  p2pWs: "wss://api.p2pquake.net/v2/ws",
  gsiTiles: "https://cyberjapandata.gsi.go.jp/xyz",
  gsiBasemap: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
  osmJapanBasemap: "https://tile.openstreetmap.jp/styles/maptiler-basic-en/{z}/{x}/{y}.png",
};
export const CATEGORY_SYMBOLS = {
  earthquake: { ios:"waveform.path.ecg", android:"monitor_heart", web:"monitor_heart" },
  tsunami: { ios:"water.waves", android:"waves", web:"waves" },
  typhoon: { ios:"tropicalstorm", android:"cyclone", web:"cyclone" },
  rain: { ios:"cloud.heavyrain.fill", android:"rainy", web:"rainy" },
  flood: { ios:"drop.fill", android:"flood", web:"flood" },
  landslide: { ios:"mountain.2.fill", android:"landslide", web:"landslide" },
  volcano: { ios:"flame.fill", android:"volcano", web:"volcano" },
  snow: { ios:"snowflake", android:"weather_snowy", web:"weather_snowy" },
  heat: { ios:"sun.max.fill", android:"sunny", web:"sunny" },
  shelter: { ios:"house.fill", android:"home", web:"home" },
  back: { ios:"chevron.left", android:"arrow_back_ios_new", web:"arrow_back_ios_new" },
  language: { ios:"globe", android:"language", web:"language" },
  refresh: { ios:"arrow.clockwise", android:"refresh", web:"refresh" },
  pin: { ios:"location.fill", android:"location_on", web:"location_on" },
  moon: { ios:"moon.fill", android:"dark_mode", web:"dark_mode" },
  sun: { ios:"sun.max.fill", android:"light_mode", web:"light_mode" },
  bell: { ios:"bell.badge.fill", android:"notifications_active", web:"notifications_active" },
  locate: { ios:"scope", android:"my_location", web:"my_location" },
  warning: { ios:"exclamationmark.triangle.fill", android:"warning", web:"warning" }
};
// Settings-style icon tile colors (UIKit system color names).
export const CATEGORY_TINTS = {
  earthquake:"systemOrange", tsunami:"systemBlue", typhoon:"systemIndigo", rain:"systemTeal",
  flood:"systemCyan", landslide:"systemBrown", volcano:"systemRed", snow:"systemMint",
  heat:"systemPink", shelter:"systemGreen"
};
export const CATEGORIES = [
  { id: "earthquake", icon: "🌎", color: "#F9DFCC" },
  { id: "tsunami", icon: "🌊", color: "#CDE9F8" },
  { id: "typhoon", icon: "🌀", color: "#DCE1FF" },
  { id: "rain", icon: "🌧️", color: "#D6E8FF" },
  { id: "flood", icon: "💧", color: "#CDEDF0" },
  { id: "landslide", icon: "⛰️", color: "#E9DFD2" },
  { id: "volcano", icon: "🌋", color: "#F9DECE" },
  { id: "snow", icon: "❄️", color: "#DFEFF7" },
  { id: "heat", icon: "☀️", color: "#FFE9C1" },
  { id: "shelter", icon: "🏠", color: "#DFF2DF" }
];
export const SHELTER_LAYERS = {
  earthquake: { tile: "skhb04", property: "disaster4" },
  tsunami: { tile: "skhb05", property: "disaster5" },
  flood: { tile: "skhb01", property: "disaster1" },
  landslide: { tile: "skhb02", property: "disaster2" },
  volcano: { tile: "skhb08", property: "disaster8" }
};

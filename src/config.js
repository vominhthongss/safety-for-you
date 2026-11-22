import { Platform, PlatformColor } from "react-native";

export const CONFIG = {
  splashMinMs: Math.min(600, Math.max(0, Number(process.env.EXPO_PUBLIC_SPLASH_MIN_MS) || 0)),
  refreshMs: Math.max(60000, (Number(process.env.EXPO_PUBLIC_REFRESH_SECONDS) || 120) * 1000),
  jmaProxy: (process.env.EXPO_PUBLIC_JMA_PROXY_URL || "").replace(/\/$/, ""),
  romajiService: (process.env.EXPO_PUBLIC_ROMAJI_API_URL || "").replace(new RegExp("/$"), ""),
  p2pApi: "https://api.p2pquake.net/v2",
  p2pWs: "wss://api.p2pquake.net/v2/ws",
  gsiTiles: "https://cyberjapandata.gsi.go.jp/xyz",
};
// Semantic iOS colors adapt to Dark Mode and accessibility contrast automatically.
const apple = (name, fallback) => Platform.OS === "ios" ? PlatformColor(name) : fallback;
export const COLORS = {
  ink: apple("label", "#1C1C1E"),
  muted: apple("secondaryLabel", "#636366"),
  bg: apple("systemGroupedBackground", "#F2F2F7"),
  white: apple("secondarySystemGroupedBackground", "#FFFFFF"),
  border: apple("separator", "#D1D1D6"),
  teal: apple("systemBlue", "#007AFF"),
  tealLight: apple("tertiarySystemFill", "#E7F2FA"),
  alert: apple("systemRed", "#D92D20"),
  alertBg: apple("secondarySystemGroupedBackground", "#FFF2EF"),
  yellow: "#FDECC9"
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
  pin: { ios:"location.fill", android:"location_on", web:"location_on" }
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

export const CONFIG = {
  splashMinMs: Math.min(600, Math.max(0, Number(process.env.EXPO_PUBLIC_SPLASH_MIN_MS) || 0)),
  refreshMs: Math.max(60000, (Number(process.env.EXPO_PUBLIC_REFRESH_SECONDS) || 120) * 1000),
  jmaProxy: (process.env.EXPO_PUBLIC_JMA_PROXY_URL || "").replace(/\/$/, ""),
  p2pApi: "https://api.p2pquake.net/v2",
  p2pWs: "wss://api.p2pquake.net/v2/ws",
  gsiTiles: "https://cyberjapandata.gsi.go.jp/xyz",
};
export const COLORS = {
  ink: "#243B43", muted: "#60767F", bg: "#F6FAF9",
  teal: "#167C78", tealLight: "#E6F5F2", white: "#FFFFFF",
  alert: "#B74432", alertBg: "#FFF1ED", border: "#E1EBEA",
  yellow: "#FDECC9"
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
  rain: { tile: "skhb07", property: "disaster7" },
  typhoon: { tile: "skhb03", property: "disaster3" }
};

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const read = (path) => readFileSync(path, "utf8");
const pkg = JSON.parse(read("package.json"));

test("Expo 58, JavaScript entry point and compatible React Native", () => {
  assert.ok(pkg.dependencies.expo.startsWith("~58."));
  assert.ok(pkg.dependencies["react-native"].startsWith("0.88."));
  assert.equal(pkg.main, "node_modules/expo/AppEntry.js");
  assert.ok(!("typescript" in (pkg.devDependencies || {})));
});
test("P2PQuake, JMA and GSI providers are configured", () => {
  const config = read("src/config.js");
  const data = read("src/data.js");
  assert.ok(config.includes("api.p2pquake.net"));
  assert.ok(config.includes("cyberjapandata.gsi.go.jp"));
  assert.ok(data.includes("getWeatherReports"));
  assert.ok(data.includes("GSI_UNAVAILABLE"));
});
test("JMA recent headlines must not be mislabelled active alerts", () => {
  const worker = read("server/worker.js");
  assert.ok(worker.includes("RECENT_JMA_BULLETINS_NOT_ACTIVE_WARNINGS"));
  assert.ok(worker.includes("cacheTtl: 180"));
});
test("Shelter layers only claim the officially matched hazard", () => {
  const config = read("src/config.js");
  assert.ok(config.includes('earthquake: { tile: "skhb04"'));
  assert.ok(config.includes('tsunami: { tile: "skhb05"'));
  assert.ok(!config.includes('typhoon: { tile: "skhb03"'));
});

test("Apple HIG home does not require horizontal hazard scrolling or redundant greeting", () => {
  const app = read("App.js");
  assert.ok(app.includes('CATEGORIES.map((item)'));
  assert.ok(app.includes("categoryWidth"));
  assert.ok(app.includes("useWindowDimensions"));
  assert.ok(!app.includes("styles.gridScroller"));
  assert.ok(!app.includes('t("today")'));
  assert.ok(app.includes("SymbolView"));
  assert.ok(app.includes("fontScale"));
});
test("All static Japanese translations have matching Romaji readings", () => {
  const i18n = read("src/i18n.js");
  const ja = i18n.split("const ja = {")[1].split("};")[0];
  const jaKeys = [...ja.matchAll(/(?:^|[,\\n])\\s*([A-Za-z][A-Za-z0-9]*):/g)].map((m) => m[1]);
  const code = read("src/jaRomaji.js");
  const json = code.slice(code.indexOf("{"), code.lastIndexOf("};") + 1);
  const readings = JSON.parse(json);
  for (const key of jaKeys) assert.ok(readings[key], "Missing Japanese reading for " + key);
  assert.ok(i18n.includes('ja: "日本語 (Nihongo)"'));
});
test("Live Japanese readings convert Kana locally without placeholders", () => {
  const code = read("src/romanization.js");
  assert.ok(code.includes("showJapaneseWithRomaji"));
  assert.ok(code.includes("CONFIG.romajiService"));
});

test("Live Romaji conversion uses WanaKana and never displays placeholder", () => {
  const src = read("src/romanization.js");
  assert.ok(src.includes('from "wanakana"'));
  assert.ok(src.includes("toRomaji(value)"));
  assert.ok(src.includes("if (!reading || reading === value) return value;"));
  assert.ok(!src.includes("Romaji: unavailable"));
});
test("Native MapLibre GSI map replaces Google Maps", () => {
  const pkg = JSON.parse(read("package.json"));
  const config = read("app.config.js");
  const map = read("src/SafetyMap.js");
  assert.ok(pkg.dependencies["@maplibre/maplibre-react-native"]);
  assert.ok(!pkg.dependencies["react-native-maps"]);
  assert.ok(config.includes('"@maplibre/maplibre-react-native"'));
  assert.ok(!config.includes("GOOGLE_MAPS_ANDROID_API_KEY"));
  assert.ok(map.includes('from "@maplibre/maplibre-react-native"'));
  assert.ok(map.includes("© GSI"));
});
test("Light Dark mode button next to language persists override", () => {
  const app = read("App.js");
  assert.ok(app.includes("toggleTheme"));
  assert.ok(app.includes("Appearance.setColorScheme(next)"));
  assert.ok(app.includes('AsyncStorage.setItem("sfy_color_scheme",next)'));
  assert.ok(app.includes("styles.themeButton"));
  assert.ok(app.includes("styles.langButton"));
  assert.ok(JSON.parse(read("package.json")).dependencies["expo-system-ui"]);
});

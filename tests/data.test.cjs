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
test("Expo Go supports WebView Leaflet GSI without MapLibre", () => {
  const pkg = JSON.parse(read("package.json"));
  const config = read("app.config.js");
  const map = read("src/SafetyMap.js");
  const bundler = read("scripts/bundle-leaflet.cjs");
  assert.equal(pkg.dependencies["react-native-webview"], "14.0.1");
  assert.equal(pkg.dependencies.leaflet, "1.9.4");
  assert.ok(!pkg.dependencies["@maplibre/maplibre-react-native"]);
  assert.ok(!pkg.dependencies["react-native-maps"]);
  assert.ok(!config.includes("@maplibre/maplibre-react-native"));
  assert.ok(!config.includes("GOOGLE_MAPS_ANDROID_API_KEY"));
  assert.ok(map.includes('from "react-native-webview"'));
  assert.ok(map.includes("LEAFLET_JS"));
  assert.ok(map.includes("© GSI"));
  assert.ok(bundler.includes("leaflet/dist") || bundler.includes('"dist", "leaflet.js"'));
  assert.equal(pkg.scripts.postinstall, "node scripts/bundle-leaflet.cjs");
});
test("Packaged Leaflet is available after npm install", () => {
  const fs = require("node:fs");
  const file = "src/generated/leafletAssets.js";
  assert.ok(fs.existsSync(file), "Run npm install to generate local Leaflet assets");
  assert.ok(fs.statSync(file).size > 50000, "Leaflet vendor JS must be embedded");
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

test("P2PQuake magnitude, Japanese intensity, depth and EEW forecast are distinct", () => {
  const facts = require("../src/hazardFacts.cjs");
  const quake = facts.earthquakeDetails({ code:551,
    earthquake:{ maxScale:45, hypocenter:{ magnitude:6.4,depth:20 } } });
  assert.equal(quake.magnitude,6.4);
  assert.equal(quake.shindo,"5-");
  assert.equal(quake.depthKm,20);
  assert.equal(quake.predicted,false);
  const eew = facts.earthquakeDetails({ code:556,
    earthquake:{ hypocenter:{magnitude:5.3} },areas:[{scaleTo:55},{scaleTo:60}] });
  assert.equal(eew.shindo,"6+");
  assert.equal(eew.predicted,true);
});
test("Tsunami heights are per-coast forecasts, including nonnumeric warnings", () => {
  const h = require("../src/hazardFacts.cjs");
  const view = require("../src/hazardView.cjs");
  const areas = h.normalizeTsunamiAreas([
    {name:"宮城県",grade:"Warning",firstHeight:{arrivalTime:"2026/11/22 12:00:00"},
      maxHeight:{value:3,description:"３ｍ"}},
    {name:"岩手県",grade:"MajorWarning",maxHeight:{description:"巨大"}},
    {name:"北海道",grade:"Watch",maxHeight:{value:0.2,description:"０．２ｍ未満"}}
  ]);
  assert.equal(areas.length,3);
  assert.equal(h.tsunamiStatus(areas,false),"majorWarning");
  assert.equal(view.heightText(areas[0].forecastHeight), "3 m");
  assert.equal(view.heightText(areas[1].forecastHeight), "巨大");
  assert.equal(view.heightText(areas[2].forecastHeight), "< 0.2 m");
  assert.equal(h.tsunamiStatus([],true),"cancelled");
});
test("Weather numbers only appear when backend supplies typed numerical measurements", () => {
  const h = require("../src/hazardFacts.cjs");
  assert.equal(h.weatherDetails("typhoon",{}),null);
  assert.equal(h.weatherDetails("flood",{rainfallMm:999}),null);
  assert.deepEqual(h.weatherDetails("typhoon",{windSpeedMs:38}),{key:"windSpeedMs",value:38});
  assert.equal(h.weatherDetails("volcano",{volcanoAlertLevel:9}),null);
});
test("Map camera bounds include user and selected event, never fabricate coordinates", () => {
  const {boundsForPoints}=require("../src/mapViewport.cjs");
  const user={latitude:35.18,longitude:136.9};
  const quake={latitude:24.3,longitude:124.0};
  const [west,south,east,north]=boundsForPoints([user,quake]);
  assert.ok(west <= quake.longitude && east >= user.longitude);
  assert.ok(south <= quake.latitude && north >= user.latitude);
  assert.equal(boundsForPoints([user,null]),null);
  const close=boundsForPoints([user,user]);
  assert.ok(close[2]-close[0] > 0 && close[3]-close[1] > 0);
});
test("Selecting a report focuses its verified coordinates and fits GPS + event", () => {
  const app=read("App.js");
  const map=read("src/SafetyMap.js");
  assert.ok(app.includes("const selectReport = (report)"));
  assert.ok(app.includes("setSelectedReportId(report.id)"));
  assert.ok(app.includes("setSelectedPoint(report.coordinate || null)"));
  assert.ok(app.includes("onPress={()=>selectReport(report)}"));
  assert.ok(map.includes("boundsForPoints([user,event])"));
  assert.ok(map.includes("map.fitBounds(bounds"));
  assert.ok(map.includes("window.SFY_MAP_UPDATE"));
  assert.ok(map.includes("injectJavaScript"));
  assert.ok(!map.includes("MLRNCameraModule"));
  assert.ok(app.includes("reportMetrics(report,t)"));
  assert.ok(app.includes("tsunamiAreas"));
});

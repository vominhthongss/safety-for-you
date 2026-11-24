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

test("Apple HIG home uses native navigation and an inset-grouped hazard list", () => {
  const app = read("App.js");
  const ui = read("src/ui.js");
  assert.ok(app.includes('CATEGORIES.map((item)'));
  assert.ok(app.includes("createNativeStackNavigator"));
  assert.ok(app.includes("headerLargeTitleEnabled"));
  assert.ok(app.includes("unstable_headerRightItems"));
  assert.ok(app.includes('contentInsetAdjustmentBehavior:"automatic"'));
  assert.ok(app.includes("RefreshControl"));
  assert.ok(!app.includes("styles.gridScroller"));
  assert.ok(!app.includes('t("today")'));
  assert.ok(ui.includes("SymbolView"));
  assert.ok(ui.includes("chevron.right"));
  // No emoji pictograms in the interface code.
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  for (const file of ["App.js","src/ui.js","src/SafetyGuide.js"]) assert.ok(!EMOJI.test(read(file)), file);
});
test("Japanese content keeps Romaji, while language picker shows only 日本語", () => {
  const i18n = read("src/i18n.js");
  const ja = i18n.split("const ja = {")[1].split("};")[0];
  const jaKeys = [...ja.matchAll(/(?:^|[,\\n])\\s*([A-Za-z][A-Za-z0-9]*):/g)].map((m) => m[1]);
  const code = read("src/jaRomaji.js");
  const json = code.slice(code.indexOf("{"), code.lastIndexOf("};") + 1);
  const readings = JSON.parse(json);
  for (const key of jaKeys) assert.ok(readings[key], "Missing Japanese reading for " + key);
  assert.ok(i18n.includes('ja: "日本語"'));
  assert.ok(!i18n.includes('日本語 (Nihongo)'));
});
test("Live Japanese readings convert Kana locally without placeholders", () => {
  const code = read("src/romanization.js");
  assert.ok(code.includes("showJapaneseWithRomaji"));
  assert.ok(code.includes("CONFIG.romajiService"));
});

test("Live Romaji conversion uses WanaKana and never displays placeholder", () => {
  const src=read("src/romanization.js");
  const helper=read("src/romajiLabel.cjs");
  assert.ok(src.includes('require("./romajiLabel.cjs")'));
  assert.ok(helper.includes('require("wanakana")'));
  assert.ok(helper.includes("toRomaji(reading)"));
  assert.ok(!helper.includes("Romaji: unavailable"));
});
test("Expo Go supports WebView Leaflet OSM Japan without MapLibre", () => {
  const pkg = JSON.parse(read("package.json"));
  const config = read("app.config.js");
  const map = read("src/SafetyMap.js");
  const bundler = read("scripts/bundle-leaflet.cjs");
  assert.equal(pkg.dependencies["react-native-webview"], "14.0.1");
  assert.equal(pkg.dependencies.leaflet, "1.9.4");
  assert.ok(!pkg.dependencies["@maplibre/maplibre-react-native"]);
  assert.equal(pkg.dependencies["react-native-maps"], "1.29.11");
  const nativeMap=read("src/AppleSafetyMap.js");
  assert.ok(map.includes('Platform.OS==="ios"'));
  assert.ok(nativeMap.includes('from "react-native-maps"'));
  assert.ok(nativeMap.includes("showsUserLocation={false}"));
  assert.ok(nativeMap.includes("mapZones.markers.map"));
  assert.ok(nativeMap.includes("fitToCoordinates"));
  assert.ok(!config.includes("@maplibre/maplibre-react-native"));
  assert.ok(!config.includes("GOOGLE_MAPS_ANDROID_API_KEY"));
  assert.ok(map.includes('from "react-native-webview"'));
  assert.ok(map.includes("LEAFLET_JS"));
  assert.ok(map.includes("© OpenStreetMap contributors"));
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
  assert.ok(map.includes("map.fitBounds(fit"));
  assert.ok(map.includes("window.SFY_MAP_UPDATE"));
  assert.ok(map.includes("injectJavaScript"));
  assert.ok(!map.includes("MLRNCameraModule"));
  assert.ok(app.includes("reportMetrics(report,t)"));
  assert.ok(app.includes("tsunamiAreas"));
});

test("Common JMA Japanese place names have offline Romaji; unknown Kanji is not guessed", () => {
  const {lookupPlaceReading}=require("../src/placeReadings.cjs");
  assert.equal(lookupPlaceReading("愛知県"),"Aichi-ken");
  assert.equal(lookupPlaceReading("宮城県"),"Miyagi-ken");
  assert.equal(lookupPlaceReading("北海道太平洋沿岸東部"),"Hokkaidō Taiheiyō engan tōbu");
  assert.equal(lookupPlaceReading("未知の地名"),"");
  const {getReliableReading}=require("../src/romajiLabel.cjs");
  assert.equal(getReliableReading("愛知県"),"Aichi-ken");
});
test("Official JMA GeoJSON URLs are used for earthquake and tsunami published regions", () => {
  const z=require("../src/hazardZones.cjs");
  assert.ok(z.EARTHQUAKE_GEOJSON.endsWith("/earthquake.json"));
  assert.ok(z.TSUNAMI_GEOJSON.endsWith("/tsunami.json"));
  assert.ok(!read("src/SafetyMap.js").includes("L.circle("));
});

test("Severity palette distinguishes Japan Shindo 1 vs 3 independent of magnitude", () => {
  const {getReportSeverity, getAreaSeverity, INTENSITY, TSUNAMI, NEUTRAL} =
    require("../src/hazardSeverity.cjs");
  const one = getReportSeverity({category:"earthquake", magnitude:7.2, shindoCode:10});
  const three = getReportSeverity({category:"earthquake", magnitude:2.8, shindoCode:30});
  assert.equal(one.label,"1");
  assert.equal(three.label,"3");
  assert.notEqual(one.color, three.color);
  assert.equal(three.color, getAreaSeverity("earthquake",{scale:30}).color);
  assert.equal(getReportSeverity({category:"earthquake", magnitude:8}).color, NEUTRAL.color);
  assert.equal(getReportSeverity({category:"earthquake",shindoCode:46}).label,"≥5- (estimated)");
  assert.equal(getReportSeverity({category:"earthquake",shindoCode:55}).label,"6-");
  assert.equal(getReportSeverity({category:"earthquake",shindoCode:60}).label,"6+");
  assert.equal(getReportSeverity({category:"earthquake",shindoCode:70}).color,INTENSITY[70].color);
  const a=getReportSeverity({category:"tsunami",tsunamiStatus:"advisory"});
  const w=getReportSeverity({category:"tsunami",tsunamiStatus:"warning"});
  const m=getReportSeverity({category:"tsunami",tsunamiStatus:"majorWarning"});
  assert.equal(a.color, TSUNAMI.advisory.color);
  assert.notEqual(a.color,w.color);
  assert.notEqual(w.color,m.color);
  assert.equal(getReportSeverity({category:"tsunami",tsunamiStatus:"majorWarning",cancelled:true}).color,NEUTRAL.color);
});
test("Weather stays neutral without verified official severity metadata", () => {
  const {getReportSeverity,NEUTRAL,METEO_GRADES}=require("../src/hazardSeverity.cjs");
  assert.equal(getReportSeverity({category:"rain",source:"JMA",title:"大雨警報"}).color,NEUTRAL.color);
  assert.equal(getReportSeverity({category:"typhoon",source:"JMA",
    warningGrade:"warning",severityVerified:false}).color,NEUTRAL.color);
  assert.equal(getReportSeverity({category:"rain",source:"JMA",
    warningGrade:"emergency",severityVerified:true}).color,METEO_GRADES.emergency.color);
});
test("Multi-prefecture Romaji and common JMA phrases work without remote server", () => {
  const {composeReadings}=require("../src/romajiComposition.cjs");
  const {lookupPlaceReading}=require("../src/placeReadings.cjs");
  assert.equal(lookupPlaceReading("宮古島近海"),"Miyako-jima kinkai");
  assert.equal(lookupPlaceReading("福島県浜通り"),"Fukushima-ken Hamadōri");
  assert.equal(lookupPlaceReading("津波情報"),"Tsunami jōhō");
  assert.equal(composeReadings("宮城県 · 岩手県",lookupPlaceReading),
    "Miyagi-ken · Iwate-ken");
  assert.equal(composeReadings("愛知県, 名古屋市",lookupPlaceReading),
    "Aichi-ken, Nagoya-shi");
  assert.equal(composeReadings("宮城県 · 未知の地名",lookupPlaceReading),"");
  const {getReliableReading,showJapaneseWithRomaji}=
    require("../src/romajiLabel.cjs");
  assert.equal(getReliableReading("宮城県 · 岩手県"),"Miyagi-ken · Iwate-ken");
  assert.equal(showJapaneseWithRomaji("未知の地名"),"未知の地名");
});
test("Cards, map pins and shaded JMA zones use data-backed severity colors", () => {
  const app=read("App.js");
  const map=read("src/SafetyMap.js");
  const zones=read("src/hazardZones.cjs");
  assert.ok(app.includes("getReportSeverity(report)"));
  assert.ok(app.includes("styles.severityRow"));
  assert.ok(app.includes("getAreaSeverity(\"tsunami\",area)"));
  assert.ok(app.includes("selectedColor={getReportSeverity(selectedReport).color}"));
  assert.ok(map.includes("severityColor"));
  assert.ok(map.includes("selectedColor"));
  assert.ok(zones.includes("hazardSeverity.cjs"));
});

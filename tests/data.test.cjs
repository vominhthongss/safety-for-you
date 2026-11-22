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
test("Live Japanese strings are paired with Romaji or explicit unavailable state", () => {
  const code = read("src/romanization.js");
  assert.ok(code.includes("showJapaneseWithRomaji"));
  assert.ok(code.includes("Romaji: unavailable"));
  assert.ok(code.includes("CONFIG.romajiService"));
});

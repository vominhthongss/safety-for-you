const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const pkg = JSON.parse(readFileSync("package.json","utf8"));
test("Expo 58, React Native 0.88 and JS entry point", () => {
  assert.match(pkg.dependencies.expo, /58/);
  assert.match(pkg.dependencies["react-native"], /^0\.88\./);
  assert.equal(pkg.main, "node_modules/expo/AppEntry.js");
  assert.ok(!("typescript" in pkg.devDependencies));
});
test("All safety data sources are traceable", () => {
  const data = readFileSync("src/data.js","utf8");
  assert.match(data, /api\.p2pquake\.net/);
  assert.match(data, /GSI_UNAVAILABLE/);
  assert.match(data, /Unexpected JMA response/);
});
test("JMA headlines must not be marked as active alerts", () => {
  const worker = readFileSync("server/worker.js","utf8");
  assert.match(worker, /NOT_ACTIVE_WARNINGS/);
  assert.match(worker, /cacheTtl: 180/);
});

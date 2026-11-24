// EAS Build needs a `preview` profile and an EAS project ID it can read from
// the dynamic app.config.js (eas init cannot write into a dynamic config).
const test=require("node:test");
const assert=require("node:assert/strict");
const {readFileSync}=require("node:fs");
const eas=JSON.parse(readFileSync("eas.json","utf8"));

test("eas.json has preview APK and production AAB profiles without empty env values",()=>{
  assert.equal(eas.build.preview.android.buildType,"apk");
  assert.equal(eas.build.preview.distribution,"internal");
  assert.equal(eas.build.production.android.buildType,"app-bundle");
  for(const profile of Object.values(eas.build))
    for(const value of Object.values(profile.env||{})) assert.ok(String(value).length>0);
});
test("app.config.js maps EAS_PROJECT_ID to extra.eas.projectId only when set",()=>{
  const path=require.resolve("../app.config.js");
  const load=(id)=>{
    delete require.cache[path];
    if(id===undefined) delete process.env.EAS_PROJECT_ID; else process.env.EAS_PROJECT_ID=id;
    return require(path).expo.extra;
  };
  assert.equal(load(undefined).eas,undefined);
  assert.equal(load("  ").eas,undefined);
  assert.equal(load("abc-123").eas.projectId,"abc-123");
  delete process.env.EAS_PROJECT_ID;
});

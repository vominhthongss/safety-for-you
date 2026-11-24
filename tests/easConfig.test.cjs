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
test("app.config.js links the EAS project and allows an EAS_PROJECT_ID override",()=>{
  const path=require.resolve("../app.config.js");
  const load=(id)=>{
    delete require.cache[path];
    if(id===undefined) delete process.env.EAS_PROJECT_ID; else process.env.EAS_PROJECT_ID=id;
    return require(path).expo.extra;
  };
  const linked="c112d170-b9c9-46ee-9368-084cd57158b3";
  assert.equal(load(undefined).eas.projectId,linked);
  assert.equal(load("  ").eas.projectId,linked);
  assert.equal(load("abc-123").eas.projectId,"abc-123");
  delete process.env.EAS_PROJECT_ID;
  delete require.cache[path];
  assert.equal(require(path).expo.owner,"vominhthongss");
});
test("Android release builds disable R8 minification and resource shrinking",()=>{
  const path=require.resolve("../app.config.js");
  delete require.cache[path];
  const plugin=require(path).expo.plugins.find((p)=>Array.isArray(p) && p[0]==="expo-build-properties");
  assert.ok(plugin,"expo-build-properties plugin is configured");
  assert.equal(plugin[1].android.enableMinifyInReleaseBuilds,false);
  assert.equal(plugin[1].android.enableShrinkResourcesInReleaseBuilds,false);
});
test("App icons, splash logo and Google Play graphics exist and are referenced",()=>{
  const fs=require("node:fs");
  const path=require.resolve("../app.config.js");
  delete require.cache[path];
  const expo=require(path).expo;
  // PNG header: width and height at bytes 16-23, color type at byte 25 (2 = RGB, 6 = RGBA).
  const png=(file)=>{
    const b=fs.readFileSync(file);
    assert.equal(b.toString("ascii",1,4),"PNG",file);
    return {w:b.readUInt32BE(16),h:b.readUInt32BE(20),alpha:b[25]===6||b[25]===4};
  };
  const icon=png(expo.icon.replace("./",""));
  assert.deepEqual([icon.w,icon.h,icon.alpha],[1024,1024,false]); // App Store icon: no alpha
  assert.equal(png(expo.android.adaptiveIcon.foregroundImage.replace("./","")).w,1024);
  assert.equal(png(expo.android.adaptiveIcon.monochromeImage.replace("./","")).w,1024);
  const splash=expo.plugins.find((p)=>Array.isArray(p)&&p[0]==="expo-splash-screen")[1];
  assert.ok(fs.existsSync(splash.image.replace("./","")));
  const playIcon=png("store/google-play/icon-512.png");
  assert.deepEqual([playIcon.w,playIcon.h],[512,512]);
  const feature=png("store/google-play/feature-graphic.png");
  assert.deepEqual([feature.w,feature.h,feature.alpha],[1024,500,false]);
});

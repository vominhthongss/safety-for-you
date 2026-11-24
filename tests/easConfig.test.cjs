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
test("Store compliance settings: privacy manifest, encryption, permissions, backup",()=>{
  const path=require.resolve("../app.config.js");
  delete require.cache[path];
  const expo=require(path).expo;
  assert.equal(expo.scheme,undefined,"no unused custom URL scheme");
  assert.equal(expo.ios.config.usesNonExemptEncryption,false);
  const pm=expo.ios.privacyManifests;
  assert.equal(pm.NSPrivacyTracking,false);
  const apis=pm.NSPrivacyAccessedAPITypes.map((a)=>a.NSPrivacyAccessedAPIType);
  for(const api of ["UserDefaults","FileTimestamp","SystemBootTime","DiskSpace"])
    assert.ok(apis.includes("NSPrivacyAccessedAPICategory"+api),api);
  assert.deepEqual(pm.NSPrivacyCollectedDataTypes.map((d)=>d.NSPrivacyCollectedDataType),
    ["NSPrivacyCollectedDataTypeCoarseLocation"]);
  assert.equal(expo.android.allowBackup,false);
  for(const p of ["SYSTEM_ALERT_WINDOW","READ_EXTERNAL_STORAGE","WRITE_EXTERNAL_STORAGE"])
    assert.ok(expo.android.blockedPermissions.includes("android.permission."+p),p);
  const loc=expo.plugins.find((p)=>Array.isArray(p)&&p[0]==="expo-location")[1];
  for(const key of ["locationAlwaysAndWhenInUsePermission","locationAlwaysPermission","locationFullAccuracyPermission"]) {
    assert.ok(loc[key] && !/\$\(PRODUCT_NAME\)/.test(loc[key]),key+" must be specific");
  }
  assert.ok(/background/i.test(loc.locationAlwaysPermission));
});
test("Privacy policy exists in three languages and is linked from the app",()=>{
  const fs=require("node:fs");
  for(const f of ["index.md","ja.md","vi.md"]) assert.ok(fs.existsSync("docs/privacy/"+f),f);
  const policy=fs.readFileSync("docs/privacy/index.md","utf8");
  for(const host of ["GSI","OpenStreetMap","P2PQuake","Romaji"]) assert.ok(policy.includes(host),host);
  assert.ok(fs.readFileSync("src/config.js","utf8").includes("privacyPolicyUrl"));
  assert.ok(fs.readFileSync("App.js","utf8").includes("openUrl(CONFIG.privacyPolicyUrl)"));
});
test("Notification icon and iOS appearance icons are configured",()=>{
  const path=require.resolve("../app.config.js");
  delete require.cache[path];
  const expo=require(path).expo;
  const fs=require("node:fs");
  const notif=expo.plugins.find((p)=>Array.isArray(p)&&p[0]==="expo-notifications")[1];
  const b=fs.readFileSync(notif.icon.replace("./",""));
  assert.equal(b.readUInt32BE(16),96); assert.equal(b[25],6); // 96 px RGBA (white on transparency)
  assert.match(notif.color,/^#[0-9A-F]{6}$/i);
  for(const k of ["light","dark","tinted"]) assert.ok(fs.existsSync(expo.ios.icon[k].replace("./","")),k);
  assert.equal(expo.ios.icon.light,expo.icon);
});
test("Screenshot checker validates store sizes and alpha",()=>{
  const fs=require("node:fs"),os=require("node:os"),p=require("node:path");
  const {checkFile}=require("../scripts/check-store-screenshots.cjs");
  const dir=fs.mkdtempSync(p.join(os.tmpdir(),"shots-"));
  const png=(w,h,type)=>{ const b=Buffer.alloc(33); b.write("\x89PNG\r\n\x1a\n",0,"latin1");
    b.writeUInt32BE(13,8); b.write("IHDR",12); b.writeUInt32BE(w,16); b.writeUInt32BE(h,20); b[24]=8; b[25]=type; return b; };
  const file=(name,buf)=>{ const f=p.join(dir,name); fs.writeFileSync(f,buf); return f; };
  assert.deepEqual(checkFile(file("ok.png",png(1320,2868,2)),"iphone-6.9"),[]);
  assert.equal(checkFile(file("bad.png",png(1170,2532,2)),"iphone-6.9").length,1);
  assert.deepEqual(checkFile(file("ipad.png",png(2064,2752,2)),"ipad-13"),[]);
  assert.deepEqual(checkFile(file("a.png",png(1080,2400,2)),"android-phone"),[]);
  assert.equal(checkFile(file("alpha.png",png(1080,2400,6)),"android-phone").length,1);
  assert.equal(checkFile(file("tall.png",png(1000,2400,2)),"android-phone").length,1);
});

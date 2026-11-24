// Every Japanese UI string and every illustrated safety step that contains
// Kanji must carry a reviewed Romaji reading.
const test=require("node:test");
const assert=require("node:assert/strict");
const {readFileSync}=require("node:fs");
const KANJI=/[㐀-鿿]/;
function loadModule(path,exportName) {
  const code=readFileSync(path,"utf8").replace(/^import .*$/gm,"").replace(/export /g,"");
  return new Function(code+"\nreturn "+exportName+";")();
}
test("Each Japanese interface string with Kanji has a Romaji reading",()=>{
  const strings=loadModule("src/i18n.js","strings");
  const readings=loadModule("src/jaRomaji.js","JA_ROMAJI");
  for(const [key,value] of Object.entries(strings.ja)) {
    if(KANJI.test(value)) {
      assert.ok(readings[key],"Missing Romaji for ja."+key);
      assert.ok(!KANJI.test(readings[key]),"Romaji contains Kanji for "+key);
    }
  }
});
test("Placeholders in Japanese strings are kept in their Romaji",()=>{
  const strings=loadModule("src/i18n.js","strings");
  const readings=loadModule("src/jaRomaji.js","JA_ROMAJI");
  for(const [key,value] of Object.entries(strings.ja)) {
    for(const token of value.match(/\{\w+\}/g)||[]) assert.ok(readings[key].includes(token),key+" "+token);
  }
});
test("Safety illustrations and Shindo guide show Japanese with Romaji",()=>{
  const {GUIDES,SHINDO_GUIDE,localText}=require("../src/safetyGuide.cjs");
  const items=[...Object.values(GUIDES).flat(),...SHINDO_GUIDE];
  assert.ok(items.length>=30);
  for(const item of items) {
    for(const locale of ["en","ja","jaRomaji","vi"]) assert.ok(item.text[locale],locale);
    assert.ok(!KANJI.test(item.text.jaRomaji));
    assert.equal(localText(item.text,"ja"),item.text.ja+"\n"+item.text.jaRomaji);
    assert.equal(localText(item.text,"ko"),item.text.en);
  }
});
test("Common JMA epicenter names compose prefecture and direction readings",()=>{
  const {lookupPlaceReading}=require("../src/placeReadings.cjs");
  assert.equal(lookupPlaceReading("千葉県北西部"),"Chiba-ken hokuseibu");
  assert.equal(lookupPlaceReading("石川県能登地方"),"Ishikawa-ken Noto chihō");
});

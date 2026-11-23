// Source-backed Japanese name display for maps and other dynamic UI.
// WanaKana converts Kana only; it cannot determine readings for unknown Kanji.
const {toRomaji}=require("wanakana");
const {lookupPlaceReading}=require("./placeReadings.cjs");
const {composeReadings}=require("./romajiComposition.cjs");
const JAPANESE=/[\u3040-\u30ff\u3400-\u9fff]/u;
const KANJI=/[\u3400-\u9fff]/u;
const KANA=/[\u3040-\u30ff]/u;
const hasJapanese=(value)=>JAPANESE.test(String(value||""));
const isKanji=(value)=>KANJI.test(String(value||""));
function normalizeReading(value) {
  if(typeof value!=="string")return "";
  const reading=value.trim();
  if(!reading || KANJI.test(reading))return "";
  // Verified dictionary/backend readings may be Kana or already Romanized.
  return KANA.test(reading) ? toRomaji(reading).trim() : reading;
}
function toLocalRomaji(value) {
  const source=String(value||"").trim();
  return hasJapanese(source) && !KANJI.test(source) ? normalizeReading(source) : "";
}
function getReliableReading(input,readings={}) {
  const source=String(input||"").trim();
  if(!hasJapanese(source))return "";
  const exact=normalizeReading(readings[source]) ||
    normalizeReading(lookupPlaceReading(source)) || toLocalRomaji(source);
  if(exact && exact!==source)return exact;
  return composeReadings(source,(piece)=>normalizeReading(readings[piece]) ||
    normalizeReading(lookupPlaceReading(piece)) || toLocalRomaji(piece));
}
function showJapaneseWithRomaji(input,readings={}) {
  const source=String(input||"");
  if(!hasJapanese(source))return source;
  const reading=getReliableReading(source,readings);
  return reading && reading!==source ? source+"\n"+reading : source;
}
module.exports={hasJapanese,isKanji,toLocalRomaji,normalizeReading,
  getReliableReading,showJapaneseWithRomaji};

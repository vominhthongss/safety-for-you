const test=require("node:test");
const assert=require("node:assert/strict");
const {toLocalRomaji,normalizeReading,getReliableReading,showJapaneseWithRomaji}=
  require("../src/romajiLabel.cjs");

test("WanaKana converts Hiragana and Katakana to readable Romaji",()=>{
  assert.equal(toLocalRomaji("かな"),"kana");
  assert.equal(toLocalRomaji("カタカナ"),"katakana");
  assert.equal(normalizeReading("ニホンゴ"),"nihongo");
});
test("Known Kanji place name retains Japanese and its verified Romaji",()=>{
  assert.equal(showJapaneseWithRomaji("名古屋市"),"名古屋市\nNagoya-shi");
  assert.equal(getReliableReading("宮城県 · 岩手県"),
    "Miyagi-ken · Iwate-ken");
});
test("Kana reading supplied by verified backend gets converted with WanaKana",()=>{
  assert.equal(showJapaneseWithRomaji("日本語",{"日本語":"ニホンゴ"}),
    "日本語\nnihongo");
});
test("Do not invent unknown Kanji place pronunciation",()=>{
  assert.equal(toLocalRomaji("未知地名"),"");
  assert.equal(getReliableReading("未知地名"),"");
  assert.equal(showJapaneseWithRomaji("未知地名"),"未知地名");
});
test("Non-Japanese text and already romanized place names remain unchanged",()=>{
  assert.equal(showJapaneseWithRomaji("Nagoya"),"Nagoya");
  assert.equal(normalizeReading("Miyagi-ken"),"Miyagi-ken");
});

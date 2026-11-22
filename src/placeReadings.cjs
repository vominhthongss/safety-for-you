// Common JMA/municipal names with standard Hepburn readings. Only exact,
// reviewed names or prefecture + known coastline suffix are expanded.
// Never guess an unfamiliar Kanji place-name pronunciation.
const NAMES={
  "北海道": "Hokkaidō",
  "青森県": "Aomori-ken",
  "岩手県": "Iwate-ken",
  "宮城県": "Miyagi-ken",
  "秋田県": "Akita-ken",
  "山形県": "Yamagata-ken",
  "福島県": "Fukushima-ken",
  "茨城県": "Ibaraki-ken",
  "栃木県": "Tochigi-ken",
  "群馬県": "Gunma-ken",
  "埼玉県": "Saitama-ken",
  "千葉県": "Chiba-ken",
  "東京都": "Tōkyō-to",
  "神奈川県": "Kanagawa-ken",
  "新潟県": "Niigata-ken",
  "富山県": "Toyama-ken",
  "石川県": "Ishikawa-ken",
  "福井県": "Fukui-ken",
  "山梨県": "Yamanashi-ken",
  "長野県": "Nagano-ken",
  "岐阜県": "Gifu-ken",
  "静岡県": "Shizuoka-ken",
  "愛知県": "Aichi-ken",
  "三重県": "Mie-ken",
  "滋賀県": "Shiga-ken",
  "京都府": "Kyōto-fu",
  "大阪府": "Ōsaka-fu",
  "兵庫県": "Hyōgo-ken",
  "奈良県": "Nara-ken",
  "和歌山県": "Wakayama-ken",
  "鳥取県": "Tottori-ken",
  "島根県": "Shimane-ken",
  "岡山県": "Okayama-ken",
  "広島県": "Hiroshima-ken",
  "山口県": "Yamaguchi-ken",
  "徳島県": "Tokushima-ken",
  "香川県": "Kagawa-ken",
  "愛媛県": "Ehime-ken",
  "高知県": "Kōchi-ken",
  "福岡県": "Fukuoka-ken",
  "佐賀県": "Saga-ken",
  "長崎県": "Nagasaki-ken",
  "熊本県": "Kumamoto-ken",
  "大分県": "Ōita-ken",
  "宮崎県": "Miyazaki-ken",
  "鹿児島県": "Kagoshima-ken",
  "沖縄県": "Okinawa-ken",
  "名古屋市": "Nagoya-shi",
  "大阪市": "Ōsaka-shi",
  "京都市": "Kyōto-shi",
  "仙台市": "Sendai-shi",
  "札幌市": "Sapporo-shi",
  "横浜市": "Yokohama-shi",
  "福岡市": "Fukuoka-shi",
  "太平洋沿岸東部": "Taiheiyō engan tōbu",
  "太平洋沿岸中部": "Taiheiyō engan chūbu",
  "太平洋沿岸西部": "Taiheiyō engan seibu",
  "日本海沿岸北部": "Nihonkai engan hokubu",
  "日本海沿岸南部": "Nihonkai engan nanbu",
  "太平洋沿岸": "Taiheiyō engan",
  "日本海沿岸": "Nihonkai engan",
  "オホーツク海沿岸": "Ohōtsuku-kai engan",
  "陸奥湾": "Mutsu-wan",
  "伊勢・三河湾": "Ise–Mikawa-wan",
  "有明・八代海": "Ariake–Yatsushiro-kai"
};
const SUFFIXES={
  "沖":"oki","近海":"kinkai","東方沖":"tōhō oki","西方沖":"seihō oki",
  "北部":"hokubu","南部":"nanbu","東部":"tōbu","西部":"seibu",
  "中部":"chūbu","太平洋沿岸東部":"Taiheiyō engan tōbu",
  "太平洋沿岸中部":"Taiheiyō engan chūbu",
  "太平洋沿岸西部":"Taiheiyō engan seibu",
  "日本海沿岸北部":"Nihonkai engan hokubu",
  "日本海沿岸南部":"Nihonkai engan nanbu",
  "太平洋沿岸":"Taiheiyō engan","日本海沿岸":"Nihonkai engan"
};
function lookupPlaceReading(name) {
  const text=String(name||"").trim();
  if (NAMES[text]) return NAMES[text];
  const prefix=Object.keys(NAMES).filter((n)=>/[県府都道]$/.test(n)||n==="北海道")
    .sort((a,b)=>b.length-a.length)
    .find((n)=>text.startsWith(n)&&SUFFIXES[text.slice(n.length)]);
  return prefix ? NAMES[prefix] + " " + SUFFIXES[text.slice(prefix.length)] : "";
}
module.exports={lookupPlaceReading};

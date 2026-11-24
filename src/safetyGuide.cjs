// Picture-first protective actions. One short sentence per step, a large
// pictogram and an explicit "do" / "do not" marker so the guidance can be
// understood without reading long text. Japanese always carries Romaji.
// Locales without a reviewed translation fall back to English.
const S=(icon,dont,en,ja,jaRomaji,vi)=>({icon,dont,text:{en,ja,jaRomaji,vi}});
const GUIDES={
  earthquake:[
    S("🧎",false,"Get low. Protect your head.","姿勢を低くして頭を守る","Shisei o hikuku shite atama o mamoru","Cúi thấp người, che đầu."),
    S("🪑",false,"Get under a strong table and hold on.","丈夫な机の下に入り、脚をつかむ","Jōbu na tsukue no shita ni hairi, ashi o tsukamu","Chui xuống gầm bàn chắc chắn và bám chặt."),
    S("🏃",true,"Do not run outside while it is shaking.","揺れている間は外へ飛び出さない","Yurete iru aida wa soto e tobidasanai","Không chạy ra ngoài khi đang rung.")
  ],
  tsunami:[
    S("🏃",false,"Leave the coast now. Do not wait.","すぐに海岸から離れる。待たない","Sugu ni kaigan kara hanareru. Matanai","Rời bờ biển ngay. Không chờ đợi."),
    S("⛰️",false,"Go to high ground or the upper floors of a strong building.","高台か、丈夫な建物の上の階へ","Takadai ka, jōbu na tatemono no ue no kai e","Lên chỗ cao hoặc tầng cao của tòa nhà kiên cố."),
    S("🌊",true,"Do not go back until the warning is lifted.","警報が解除されるまで戻らない","Keihō ga kaijo sareru made modoranai","Không quay lại cho đến khi cảnh báo được gỡ bỏ.")
  ],
  typhoon:[
    S("🏠",false,"Stay indoors.","屋内にいる","Okunai ni iru","Ở trong nhà."),
    S("🪟",false,"Stay away from windows.","窓から離れる","Mado kara hanareru","Tránh xa cửa sổ."),
    S("🔦",false,"Prepare a light, water and a charged phone.","明かり・水・充電したスマホを用意する","Akari, mizu, jūden shita sumaho o yōi suru","Chuẩn bị đèn, nước và điện thoại đã sạc.")
  ],
  rain:[
    S("🏢",false,"Move to a higher floor or a shelter early.","早めに上の階か避難場所へ","Hayame ni ue no kai ka hinan basho e","Sớm lên tầng cao hoặc đến nơi sơ tán."),
    S("🚗",true,"Do not walk or drive in moving water.","流れる水の中を歩いたり運転したりしない","Nagareru mizu no naka o aruitari unten shitari shinai","Không đi bộ hay lái xe qua dòng nước chảy."),
    S("📻",false,"Check official information.","公式の情報を確認する","Kōshiki no jōhō o kakunin suru","Theo dõi thông tin chính thức.")
  ],
  flood:[
    S("🏢",false,"Move to a higher floor or a shelter early.","早めに上の階か避難場所へ","Hayame ni ue no kai ka hinan basho e","Sớm lên tầng cao hoặc đến nơi sơ tán."),
    S("🏞️",true,"Do not go near rivers or canals.","川や用水路に近づかない","Kawa ya yōsuiro ni chikazukanai","Không đến gần sông hoặc kênh."),
    S("🚗",true,"Do not walk or drive in moving water.","流れる水の中を歩いたり運転したりしない","Nagareru mizu no naka o aruitari unten shitari shinai","Không đi bộ hay lái xe qua dòng nước chảy.")
  ],
  landslide:[
    S("⛰️",false,"Move away from steep slopes and streams.","急な斜面や沢から離れる","Kyū na shamen ya sawa kara hanareru","Tránh xa sườn dốc và khe suối."),
    S("🏠",false,"If you cannot leave, go upstairs to a room away from the slope.","逃げられない時は、斜面と反対側の上の階の部屋へ","Nigerarenai toki wa, shamen to hantai-gawa no ue no kai no heya e","Nếu không thể rời đi, lên tầng trên, vào phòng ở phía xa sườn dốc."),
    S("👂",false,"Cracks, strange sounds or muddy water are danger signs.","ひび割れ・異常な音・濁った水は危険のサイン","Hibiware, ijō na oto, nigotta mizu wa kiken no sain","Vết nứt, tiếng động lạ, nước đục là dấu hiệu nguy hiểm.")
  ],
  volcano:[
    S("🏃",false,"Leave the area as officials instruct.","自治体の指示に従って離れる","Jichitai no shiji ni shitagatte hanareru","Rời khu vực theo hướng dẫn của chính quyền."),
    S("😷",false,"Cover your nose and mouth from ash.","火山灰から鼻と口を守る","Kazanbai kara hana to kuchi o mamoru","Che mũi và miệng để tránh tro bụi."),
    S("🏠",false,"Go indoors and close the windows.","屋内に入り、窓を閉める","Okunai ni hairi, mado o shimeru","Vào trong nhà và đóng cửa sổ.")
  ],
  snow:[
    S("🏠",false,"Avoid going out.","不要な外出を控える","Fuyō na gaishutsu o hikaeru","Hạn chế ra ngoài."),
    S("🚗",false,"If your car is stuck, clear snow from the exhaust pipe.","車が雪で動けない時は、マフラーの周りの雪を取り除く","Kuruma ga yuki de ugokenai toki wa, mafurā no mawari no yuki o torinozoku","Nếu xe bị kẹt tuyết, dọn tuyết quanh ống xả."),
    S("🧣",false,"Keep warm.","体を温かく保つ","Karada o atatakaku tamotsu","Giữ ấm cơ thể.")
  ],
  heat:[
    S("💧",false,"Drink water before you feel thirsty.","のどが渇く前に水を飲む","Nodo ga kawaku mae ni mizu o nomu","Uống nước trước khi thấy khát."),
    S("❄️",false,"Stay in a cool room. Use the air conditioner.","エアコンで涼しい部屋にいる","Eakon de suzushii heya ni iru","Ở phòng mát, bật máy lạnh."),
    S("☀️",true,"Do not stay long in strong midday sun.","日中の強い日差しの下に長くいない","Nitchū no tsuyoi hizashi no shita ni nagaku inai","Không ở lâu dưới nắng gắt buổi trưa.")
  ],
  shelter:[
    S("🎒",false,"Take documents, medicine and water.","書類・薬・水を持つ","Shorui, kusuri, mizu o motsu","Mang giấy tờ, thuốc và nước."),
    S("🚶",false,"Walk. Do not go by car.","車ではなく歩いて行く","Kuruma de wa naku aruite iku","Đi bộ, không đi bằng ô tô."),
    S("✅",false,"Check that the place is safe for this disaster.","その災害に対応した場所か確かめる","Sono saigai ni taiō shita basho ka tashikameru","Kiểm tra nơi đó phù hợp với loại thiên tai này.")
  ]
};
// Paraphrase of JMA's 震度階級関連解説表 (Shindo scale description table).
// Source: https://www.jma.go.jp/jma/kishou/know/shindo/kaisetsu.html
const R=(label,codes,icon,en,ja,jaRomaji,vi)=>({label,codes,icon,text:{en,ja,jaRomaji,vi}});
const SHINDO_GUIDE=[
  R("1–2",[10,20],"🙂","Some people indoors notice it.","屋内の一部の人が揺れを感じる","Okunai no ichibu no hito ga yure o kanjiru","Một số người trong nhà nhận thấy rung."),
  R("3",[30],"🍽️","Most people indoors feel it. Dishes may rattle.","屋内のほとんどの人が感じる。食器が音を立てることがある","Okunai no hotondo no hito ga kanjiru. Shokki ga oto o tateru koto ga aru","Hầu hết người trong nhà cảm thấy. Chén bát có thể kêu lách cách."),
  R("4",[40],"💡","Most people are startled. Hanging lights swing a lot.","ほとんどの人が驚く。電灯などのつり下げ物が大きく揺れる","Hotondo no hito ga odoroku. Dentō nado no tsurisagemono ga ōkiku yureru","Hầu hết mọi người giật mình. Đèn treo đung đưa mạnh."),
  R("5-",[45,46],"📚","You want to hold on to something. Dishes and books may fall.","物につかまりたいと感じる。食器や本が落ちることがある","Mono ni tsukamaritai to kanjiru. Shokki ya hon ga ochiru koto ga aru","Muốn bám vào vật gì đó. Chén bát và sách có thể rơi."),
  R("5+",[50],"🪑","Hard to walk without holding on. Unsecured furniture may fall.","物につかまらないと歩くことが難しい。固定していない家具が倒れることがある","Mono ni tsukamaranai to aruku koto ga muzukashii. Kotei shite inai kagu ga taoreru koto ga aru","Khó đi nếu không bám vào vật gì. Đồ đạc không cố định có thể đổ."),
  R("6-",[55],"🚪","Hard to stand. Much unsecured furniture moves or falls. Doors may jam.","立っていることが困難になる。固定していない家具の多くが移動し、倒れる。ドアが開かなくなることがある","Tatte iru koto ga konnan ni naru. Kotei shite inai kagu no ōku ga idō shi, taoreru. Doa ga akanaku naru koto ga aru","Khó đứng vững. Nhiều đồ đạc không cố định bị xê dịch hoặc đổ. Cửa có thể bị kẹt."),
  R("6+–7",[60,70],"🧎","You cannot move without crawling. You may be thrown.","はわないと動くことができない。飛ばされることもある","Hawanai to ugoku koto ga dekinai. Tobasareru koto mo aru","Không thể di chuyển nếu không bò. Có thể bị hất văng.")
];
function localText(text,locale) {
  if(locale==="ja")return text.ja+"\n"+text.jaRomaji;
  return text[locale] || text.en;
}
function guideFor(hazard) { return GUIDES[hazard] || []; }
module.exports={GUIDES,SHINDO_GUIDE,guideFor,localText};

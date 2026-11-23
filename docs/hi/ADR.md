# Safety For You — आर्किटेक्चर निर्णय अभिलेख

स्वीकृत · 2026-11-23 · इस शाखा के कोड पर आधारित

[परिचय और डिप्लॉय मार्गदर्शिका](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo और बंडल नक्शा

**संदर्भ:** दोनों प्लेटफॉर्म पर SDK 58 Expo Go चाहिए।

**निर्णय:** JavaScript, Expo 58/RN 0.88, WebView में Leaflet 1.9.4; npm पर बंडल और OSM Japan अंग्रेज़ी tiles।

**परिणाम:** MapLibre native विस्तार नहीं चाहिए; नेटवर्क, श्रेय, क्षमता और वास्तविक परीक्षण अभी भी ज़रूरी हैं।


## ADR-002 — स्रोत-आधारित आपदा डेटा

**संदर्भ:** Magnitude, Shindo और सुनामी स्तर अलग हैं; पुराने बुलेटिन सक्रिय चेतावनी नहीं हैं।

**निर्णय:** P2PQuake 551/552/556 सामान्यीकृत करें; जारी/घटना समय और प्रकाशित स्तर रखें; सत्यापित JMA क्षेत्र ही मिलाएँ।

**परिणाम:** Worker केवल हाल के शीर्षक देता है। संख्या, स्थान या प्रभावशीलता न गढ़ें। क्षेत्र लहर/बाढ़ simulation नहीं; पाठ और आधिकारिक लिंक रखें।


## ADR-003 — अग्रभूमि अपडेट

**संदर्भ:** निगरानी वाला push ढाँचा नहीं है।

**निर्णय:** न्यूनतम 60 सेकंड REST, reconnect WebSocket, पृष्ठभूमि में रोकना; AsyncStorage और उपयोगकर्ता कार्रवाई के बाद स्थान अनुमति।

**परिणाम:** पृष्ठभूमि आपात सूचना या समय की गारंटी नहीं। पुरानी अनुमति दोबारा ले सकते हैं; अस्वीकृति के बाद भी रिपोर्ट खुली रहती हैं।


## ADR-004 — भाषा और उच्चारण

**संदर्भ:** मूल स्थान नाम पहचानना ज़रूरी है।

**निर्णय:** 13 भाषा i18n और अंग्रेज़ी fallback; भाषा नाम केवल 日本語, अन्य जापानी लेबल में Romaji। स्थानीय शब्दकोश/Kana और वैकल्पिक Kuroshiro।

**परिणाम:** दस्तावेज़ 13 भाषाओं में; ja/en/vi के बाहर पुराना UI आंशिक है। अज्ञात नाम न अनुमानें; Romaji सुरक्षा अनुवाद नहीं है।


## ADR-005 — जापानी समय और पहुँच

**संदर्भ:** Timezone और बड़े अक्षर से गलत पढ़ाई व overlap हो सकते हैं।

**निर्णय:** बिना offset समय JST, ISO offset सुरक्षित; Asia/Tokyo से आज, पूरी तारीख/JST, हर मिनट और लौटने पर अपडेट। अलग समय रंग, 44pt, बढ़ता पाठ, modal focus और कम motion।

**परिणाम:** जारी/घटना अलग, legend नक्शे के नीचे। Apple HIG लागू करना approval या accessibility प्रमाणपत्र नहीं।


## ADR-006 — अलग सेवाएँ

**संदर्भ:** JMA और दुर्लभ Kanji के लिए server चाहिए।

**निर्णय:** Cloudflare Worker और Node Romaji अलग; HTTPS EXPO_PUBLIC URLs, बाहरी लेबल text के रूप में।

**परिणाम:** सार्वजनिक cache, rate limits और निगरानी चाहिए। config ऐप में है; provider को metadata, नक्शे और वैकल्पिक conversion text मिलता है।


## ADR-007 — MIT और वितरण

**संदर्भ:** पुनःउपयोग अधिकार और release मार्ग स्पष्ट चाहिए।

**निर्णय:** मूल code/docs MIT, बाहरी शर्तें कायम; EAS preview/simulator/production अलग और keys Git से बाहर।

**परिणाम:** सूचना सहित commercial fork अनुमति है। hosting/खाते संचालक के; OTA या सरकारी समर्थन नहीं है।

## संदर्भ

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

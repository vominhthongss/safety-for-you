# Safety For You — आर्किटेक्चर निर्णय अभिलेख

स्वीकृत · 2026-11-23 · यस शाखाको कोडअनुसार

[परिचय र डिप्लोय मार्गदर्शन](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo र नक्सा

**सन्दर्भ:** दुवै प्लेटफर्ममा SDK 58 Expo Go चाहिन्छ।

**निर्णय:** JavaScript, Expo 58/RN 0.88 र WebView मा Leaflet 1.9.4; npm मा बन्डल र OSM Japan अंग्रेजी नक्सा।

**परिणाम:** MapLibre native विस्तार चाहिँदैन; नेटवर्क, स्रोत उल्लेख, क्षमता र वास्तविक परीक्षण आवश्यक छन्।


## ADR-002 — स्रोतमा आधारित सूचना

**सन्दर्भ:** Magnitude, Shindo र सुनामी तह फरक हुन्; पुरानो सूचना सक्रिय चेतावनी होइन।

**निर्णय:** P2PQuake 551/552/556, जारी/घटना समय र प्रकाशित तह राख्ने; पुष्टि भएका JMA क्षेत्र मात्र जोड्ने।

**परिणाम:** Worker ले हालैका शीर्षक मात्र दिन्छ। संख्या, स्थान वा प्रभावकारिता नअड्कल्ने। क्षेत्रहरू छाल/डुबानको simulation होइनन्; पाठ र आधिकारिक लिंक राख्ने।


## ADR-003 — खुला एपमा अपडेट

**सन्दर्भ:** निगरानी गरिएको पुश संरचना छैन।

**निर्णय:** कम्तीमा ६० सेकेन्ड REST, पुनःजडान WebSocket, पृष्ठभूमिमा रोक्ने; AsyncStorage र प्रयोगकर्ताको कार्यपछि स्थान अनुमति।

**परिणाम:** पृष्ठभूमि सूचना वा समयको ग्यारेन्टी छैन। पुरानो अनुमति प्रयोग गर्न सकिन्छ; अस्वीकारमा पनि सूचना पढ्न मिल्छ।


## ADR-004 — भाषा र पढाइ

**सन्दर्भ:** मूल स्थान नाम चिनिनुपर्छ।

**निर्णय:** १३ भाषाको i18n र अंग्रेजी fallback; छनोटमा 日本語 मात्र, अन्य जापानीमा Romaji राख्ने। स्थानीय शब्दकोश/Kana र वैकल्पिक Kuroshiro।

**परिणाम:** कागजात १३ भाषामा; ja/en/vi बाहिर पुरानो UI आंशिक। नचिनेका नाम नअड्कल्ने; Romaji सुरक्षा अनुवाद होइन।


## ADR-005 — जापानी समय र पहुँच

**सन्दर्भ:** समयक्षेत्र र ठूलो अक्षरले भ्रम वा खप्टिने समस्या ल्याउँछन्।

**निर्णय:** offset नभएको समय JST, ISO offset जस्ताको तस्तै; Asia/Tokyo अनुसार आज, पूरा मिति/JST, प्रत्येक मिनेट र फर्किँदा अपडेट। छुट्टै समय रङ, 44pt, अक्षर विस्तार, फोकस र कम चाल।

**परिणाम:** जारी/घटना समय छुट्टै, नक्सामुनि विवरण। Apple HIG अपनाउँदैमा स्वीकृति वा पहुँच प्रमाणपत्र हुँदैन।


## ADR-006 — वैकल्पिक सेवा

**सन्दर्भ:** JMA र दुर्लभ Kanji लाई सर्भर चाहिन्छ।

**निर्णय:** Cloudflare Worker र Node Romaji अलग; HTTPS EXPO_PUBLIC URL र बाह्य नामलाई पाठको रूपमा देखाउने।

**परिणाम:** क्यास निगरानी र दर सीमा चाहिन्छ। सेटिङ एपमा हुन्छ; प्रदायकले नेटवर्क विवरण, नक्सा अनुरोध र वैकल्पिक पाठ पाउँछन्।


## ADR-007 — MIT र प्रकाशन

**सन्दर्भ:** पुनःप्रयोग अधिकार र प्रक्रिया स्पष्ट चाहिन्छ।

**निर्णय:** मौलिक कोड/कागजात MIT, बाह्य सर्त कायम; EAS preview/simulator/production अलग, कुञ्जी Git बाहिर।

**परिणाम:** सूचना राखेर व्यावसायिक fork गर्न मिल्छ। hosting/खाता सञ्चालकको जिम्मा; OTA वा सरकारी समर्थन छैन।

## सन्दर्भ

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

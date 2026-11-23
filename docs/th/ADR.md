# Safety For You — บันทึกการตัดสินใจด้านสถาปัตยกรรม

ยอมรับแล้ว · 2026-11-23 · อ้างอิงโค้ดในสาขานี้

[แนะนำโครงการและคู่มือการติดตั้งใช้งาน](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo และแผนที่

**บริบท:** ทั้งสองระบบต้องรองรับ Expo Go SDK 58

**การตัดสินใจ:** ใช้ JavaScript, Expo 58/RN 0.88, Leaflet 1.9.4 ใน WebView รวมตอน npm install และแผนที่ OSM Japan ป้ายอังกฤษ

**ผลที่ตามมา:** ไม่ต้องเพิ่ม MapLibre native แต่ยังต้องมีเครือข่าย แสดงที่มา ดูขีดจำกัดและทดสอบเครื่องจริง


## ADR-002 — ข้อมูลตามแหล่งอ้างอิง

**บริบท:** Magnitude, Shindo และระดับสึนามิต่างกัน ประกาศเก่าไม่ใช่คำเตือนปัจจุบัน

**การตัดสินใจ:** แปลง P2PQuake 551/552/556 เก็บเวลาออก/เกิดและระดับที่เผยแพร่ จับคู่เฉพาะพื้นที่ JMA ที่ยืนยัน

**ผลที่ตามมา:** Worker ให้หัวข้อล่าสุดเท่านั้น ไม่เดาค่า พิกัดหรือผลบังคับ พื้นที่ไม่จำลองคลื่น/น้ำท่วม และคงข้อความระดับกับลิงก์ทางการ


## ADR-003 — อัปเดตขณะเปิด

**บริบท:** ไม่มีระบบ push ที่เฝ้าตรวจ

**การตัดสินใจ:** REST อย่างน้อย 60 วินาที WebSocket เชื่อมใหม่และหยุดเบื้องหลัง เก็บค่าที่ AsyncStorage ขอพิกัดหลังผู้ใช้กด

**ผลที่ตามมา:** ไม่รับประกันแจ้งเตือนเบื้องหลังหรือเวลา ใช้สิทธิ์เดิมได้และยังอ่านข้อมูลเมื่อปฏิเสธ


## ADR-004 — ภาษาและคำอ่าน

**บริบท:** ต้องจำชื่อสถานที่ต้นฉบับได้

**การตัดสินใจ:** i18n 13 ภาษาพร้อมอังกฤษสำรอง ชื่อภาษาคือ 日本語 ไม่มี Romaji แต่ป้ายญี่ปุ่นอื่นคงคำอ่าน ใช้พจนานุกรม/Kana และ Kuroshiro ทางเลือก

**ผลที่ตามมา:** เอกสารครบ13ภาษา UI เก่านอก ja/en/vi ยังบางส่วน ไม่เดาชื่อที่ไม่รู้ และ Romaji ไม่ใช่คำแปลด้านความปลอดภัย


## ADR-005 — เวลาญี่ปุ่นและการเข้าถึง

**บริบท:** เขตเวลาและตัวอักษรใหญ่ทำให้อ่านผิดหรือทับกัน

**การตัดสินใจ:** เวลาที่ไม่มี offset เป็น JST รักษา ISO offset วันนี้ตาม Asia/Tokyo พร้อมวันที่เต็ม/JST อัปเดตทุกนาทีและกลับแอป สีเวลาเฉพาะ เป้า44pt ขยายตัวอักษร โฟกัส modal และลดการเคลื่อนไหว

**ผลที่ตามมา:** แยกเวลาออก/เกิด วางคำอธิบายใต้แผนที่ Apple HIG ไม่เท่ากับการรับรองหรืออนุมัติสโตร์


## ADR-006 — บริการแยก

**บริบท:** หัวข้อJMAและKanjiหายากต้องมี server

**การตัดสินใจ:** แยกCloudflare Worker กับ Node Romaji ตั้ง HTTPS EXPO_PUBLIC และแสดงข้อมูลภายนอกเป็นข้อความ

**ผลที่ตามมา:** ต้องดูcacheสาธารณะ จำกัดอัตราและเฝ้าตรวจ configฝังในแอป ผู้ให้บริการรับmetadata คำขอแผนที่และข้อความแปลงหากเปิด


## ADR-007 — MIT และการเผยแพร่

**บริบท:** ต้องชัดเจนเรื่องสิทธิ์และกระบวนการ

**การตัดสินใจ:** โค้ด/เอกสารต้นฉบับMIT รักษาเงื่อนไขภายนอก แยกEAS preview/simulator/production เก็บคีย์นอกGit

**ผลที่ตามมา:** forkเชิงพาณิชย์ได้เมื่อคงข้อความแจ้ง ผู้ดูแลจัดhosting/บัญชีเอง ไม่มีOTAหรือการรับรองรัฐ

## แหล่งอ้างอิง

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

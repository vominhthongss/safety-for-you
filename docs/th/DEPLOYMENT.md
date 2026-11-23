# Safety For You — แนะนำโครงการและคู่มือการติดตั้งใช้งาน

[บันทึกการตัดสินใจด้านสถาปัตยกรรม](ADR.md) · [🌐](../README.md)

## 1. โครงการและโอเพนซอร์ส

Safety For You เป็นแอปมือถือฟรีที่ไม่แสวงหากำไรสำหรับผู้พักอาศัยและนักท่องเที่ยวในญี่ปุ่น รวมข้อมูลแผ่นดินไหว สึนามิ ประกาศอากาศล่าสุด แผนที่ และจุดอพยพฉุกเฉินที่กำหนด เป็นโครงการอิสระ ไม่ใช่บริการของรัฐบาล อัปเดตขณะเปิดแอปเท่านั้น ไม่มีการรับประกันการแจ้งเตือนฉุกเฉินเบื้องหลังหรือความปลอดภัยเมื่อออฟไลน์

โค้ดและเอกสารต้นฉบับอยู่ภายใต้ [MIT](../../LICENSE) ใช้ แก้ไข แจกจ่าย และขายได้โดยเก็บข้อความลิขสิทธิ์และคำอนุญาตไว้ วัตถุประสงค์ไม่แสวงหากำไรไม่ห้าม fork เชิงพาณิชย์ และไม่มีการรับประกัน ข้อมูล แผนที่ และไลบรารีมี[เงื่อนไขของตนเอง](../../THIRD_PARTY_NOTICES.md) หากร่วมพัฒนาให้ fork สร้าง branch ตรวจสอบ และเปิด PR ห้าม commit ข้อมูลรับรองหรือคีย์ลงนาม

## 2. สิ่งที่ต้องเตรียม

ต้องมี Node.js 22+, npm, Git และ Expo Go ที่รองรับ SDK 58 การ build iOS ในเครื่องต้องมี macOS/Xcode ส่วน Android ต้องมี SDK/JDK ที่เข้ากันได้ Cloud build ใช้บัญชี Expo และสโตร์ต้องมีบัญชี Apple Developer/Google Play Console ของตนเอง ไม่ต้องมีฐานข้อมูลหรือ Google Maps key

## 3. เรียกใช้บนเครื่อง

รันจากโฟลเดอร์หลักของ repository และอย่าทับ `.env` เดิม ตั้งค่าตามตารางแล้วสแกน QR ด้วย Expo Go ขั้นตอนติดตั้งจะรวม Leaflet หากไฟล์ที่สร้างหายให้รัน `npm run bundle:maps` มีภาษาให้เลือก 13 ภาษา แต่ข้อความ UI เดิมบางส่วนที่ไม่ใช่ ja/en/vi อาจแสดงอังกฤษแทน

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| ตัวแปร | ความหมาย |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | เวลารอเริ่มต้นแบบเลือกได้ 0–600 ms |
| `EXPO_PUBLIC_REFRESH_SECONDS` | รอบรีเฟรชขณะเปิดแอป ขั้นต่ำ 60 วินาที ค่าเริ่มต้น 120 |
| `EXPO_PUBLIC_JMA_PROXY_URL` | HTTPS base URL ของ Worker ไม่ใส่ /hazards; ว่างเพื่อปิดข้อมูลอากาศ |
| `EXPO_PUBLIC_ROMAJI_API_URL` | HTTPS base URL ของ Romaji ไม่ใส่ /romaji; ว่างเพื่อใช้การอ่านในเครื่อง |
| `ANDROID_PACKAGE` | Android application ID ของตนเอง |
| `IOS_BUNDLE_ID` | iOS bundle ID ของตนเอง |
| `EAS_PROJECT_ID` | UUID โครงการ Expo; Expo Go เว้นได้ แต่ EAS ต้องเชื่อมโครงการของตนเอง |

## 4. JMA Worker แบบเลือกใช้

ตั้งชื่อเฉพาะใน `wrangler.toml` ล็อกอิน Cloudflare และ deploy จากโฟลเดอร์หลัก แทนที่โดเมนตัวอย่างด้วย URL ที่ Wrangler ส่งกลับ `/hazards` ต้องมี JSON `items` และ `kind`; `degraded: true` หมายถึงบางแหล่งล้มเหลว ใส่ base URL ใน `.env` Worker จัดหมวดหัวข้อ JMA Atom เท่านั้น ไม่ตรวจสอบคำเตือนที่ยังมีผลหรือค่าการวัดอากาศ

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. บริการ Romaji แบบเลือกใช้

เริ่มในอีก terminal บน VPS งานจริงควรใช้ systemd, container หรือ process manager วาง HTTPS reverse proxy หน้า port 3088 จำกัดการเข้าตรง ขนาดและอัตราคำขอ ตรวจ `/health` ให้ได้ `{"ok":true}` และ POST `/romaji` ให้ได้ array คำอ่าน แล้วตั้ง base URL คำขออาจมีชื่อสถานที่ ประกาศและที่อยู่อพยพ จึงควรลด log เนื้อหา เมื่อบริการขัดข้องพจนานุกรม/Kana ในเครื่องยังทำงาน

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. สร้าง Android และ iOS

สร้างโครงการของตนใน Expo dashboard แล้วใส่ UUID ใน `EAS_PROJECT_ID` กำหนด ID ทั้งสองก่อน build แรก หาก fork ให้เปลี่ยน name/slug/scheme ใน `app.config.js` ไฟล์ `eas.json` มี preview (Android APK/iOS ad hoc), simulator (iOS Simulator), production (Android AAB/iOS store) ตั้งตัวแปรที่กรอกในตารางไว้ทั้ง preview และ production ของ Expo เนื่องจาก `.env` ที่ Git มองข้ามไม่ถูกอัปโหลดอัตโนมัติ ค่าเหล่านี้เป็นสาธารณะ ห้ามใส่ความลับ เปลี่ยนแล้วเริ่ม Metro ใหม่หรือ build ใหม่

ล็อกอินแล้วเลือกคำสั่งที่ต้องการ EAS จะให้ลิงก์ดาวน์โหลด iOS ad hoc ต้องลงทะเบียนผ่าน `npx eas-cli device:create` และลงนาม Apple ตัว Simulator ติดตั้งบน iPhone ไม่ได้ หากเครื่องมีเครื่องมือครบให้เพิ่ม `--local`

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. ส่งขึ้นสโตร์

build production แล้วส่งแพลตฟอร์มที่เลือก จัดการ signing ผ่าน EAS และเก็บคีย์นอก Git Google Play ใช้ AAB ส่วน iOS ส่งไป App Store Connect/TestFlight โดยยังไม่เผยแพร่เอง เตรียมคำอธิบาย ไอคอน ภาพหน้าจอ นโยบายความเป็นส่วนตัว การเปิดเผยข้อมูลและทดสอบเครื่องจริงก่อนขอตรวจ ใช้ app ID และ Google service-account key ในบัญชีเผยแพร่ของตนเอง

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. การตรวจสอบ

รันคำสั่งแล้วทดสอบ iOS/Android จริง: 13 ภาษา ชื่อ 日本語 เวลาออกประกาศ/เกิดเหตุ เที่ยงคืนญี่ปุ่นขณะใช้เขตเวลาอื่น สว่าง/มืด/คอนทราสต์สูง ตัวอักษร 200% VoiceOver/TalkBack และโฟกัสหน้าต่าง ลดการเคลื่อนไหว ปฏิเสธตำแหน่ง เครือข่ายล้มเหลว ที่มาและคำอธิบายสี การ export JS ไม่ใช่การทดสอบ native หรืออนุมัติจาก Apple ดู[การตรวจ UI](../UI_DESIGN.md)

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. อัปเดตและกู้คืน

บันทึก commit และหมายเลข build ที่ทดสอบ เปลี่ยน version ใน `app.config.js`; EAS เพิ่มเลข production อัตโนมัติ ยังไม่มี EAS Update จึงต้องเผยแพร่ native build ใหม่ คืน Worker ด้วย commit ที่เสถียรหรือ Cloudflare rollback และเริ่ม Romaji รุ่นเดิม แอปสโตร์ลดรุ่นเงียบ ๆ ไม่ได้ ให้ build source เดิมด้วยหมายเลขสูงกว่า เฝ้าดู endpoint ขีดจำกัดแผนที่และแหล่งข้อมูล

## 10. แหล่งอ้างอิง

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

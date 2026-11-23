# คู่มือการติดตั้งและเผยแพร่ — Safety For You (ไทย)

Safety For You เป็นแอปข้อมูลภัยพิบัติญี่ปุ่นแบบฟรี ไม่แสวงหากำไร และโอเพนซอร์สภายใต้สัญญาอนุญาต MIT ไม่สามารถแทน JMA, J-Alert หรือคำสั่งของทางการท้องถิ่นได้

## สิ่งที่ต้องมี

ต้องมี Node.js 22+ และ Expo Go ที่รองรับ SDK 58 โครงการนี้ไม่มี lockfile ให้ติดตั้งด้วย npm install

## เรียกใช้ในเครื่อง

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

- `EXPO_PUBLIC_REFRESH_SECONDS`: ช่วงเวลารีเฟรชเป็นวินาที (ขั้นต่ำ 60).
- `EXPO_PUBLIC_JMA_PROXY_URL`: URL Cloudflare Worker เสริมสำหรับหัวข้อข่าว JMA.
- `EXPO_PUBLIC_ROMAJI_API_URL`: URL บริการ Kanji เป็น Romaji ที่โฮสต์เอง (ทางเลือก).
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: ตัวระบุคงที่สำหรับ Android/iOS build ที่ลงนาม.
- `EXPO_PUBLIC_*`: ตัวแปรสาธารณะรวมอยู่ในแอป ห้ามใส่ข้อมูลลับ.
- `Leaflet 1.9.4`: `postinstall` สร้าง `src/generated/leafletAssets.js`; tile แผนที่ยังต้องใช้อินเทอร์เน็ต.

## บริการเสริม

Cloudflare Worker เป็นทางเลือกสำหรับหัวข้อประกาศ JMA ล่าสุดที่ /hazards ไม่ใช่คำเตือนที่มีผลอยู่ บริการ Romaji ก็เป็นทางเลือก หากเปิดสาธารณะต้องใช้ HTTPS และจำกัดอัตราคำขอ

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

สำหรับการแปลง Kanji/Romaji ดู`romaji-service/README.md`(Node.js 22+, HTTPS และจำกัดคำขอ) หากไม่เปิดบริการให้เว้น URL ว่าง เมื่อไม่มี Worker หัวข้อข่าวอากาศอาจใช้ไม่ได้ ตั้งค่า URL ใน `.env` แล้วเริ่ม Expo ใหม่

## การ build สำหรับสโตร์

ก่อนเผยแพร่บนสโตร์ ให้เข้าสู่ระบบ Expo/EAS ตั้งค่าโปรเจ็กต์สำหรับ build แล้วสร้าง production build ของ Android/iOS ผู้เผยแพร่ต้องจัดการ app identifiers เอง

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

Repository ยังไม่มี`eas.json` ให้เรียก`build:configure`หนึ่งครั้งแล้วตรวจ production profile ต้องกำหนดข้อมูลลงนาม บัญชีร้านค้า ตัวระบุ และตัวแปร production ก่อนสร้าง build ดูขั้นตอนเผยแพร่ด้านล่าง

## ตรวจสอบก่อนเผยแพร่

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

ก่อนเผยแพร่ต้องเตรียมข้อมูลความเป็นส่วนตัว ไอคอน ภาพหน้าจอ ช่องทางติดต่อ ทดสอบอุปกรณ์จริง/การเข้าถึง และคำชี้แจงว่าไม่ใช่ระบบเตือนภัยทางการ การ export JS ผ่านไม่ได้รับรองความปลอดภัยหรือการอนุมัติจาก App Store

## เงื่อนไขโอเพนซอร์ส

ภายใต้[สัญญาอนุญาต MIT](../../LICENSE) อนุญาตให้ใช้งาน แก้ไข และเผยแพร่ซ้ำ รวมถึงเชิงพาณิชย์ โดยคงประกาศลิขสิทธิ์และใบอนุญาตในสำเนาสำคัญ ข้อกำหนดของไลบรารี แผนที่ และข้อมูลภายนอกยังคงใช้แยกกัน ผลงานที่ส่งต้องรักษาเครดิตแหล่งข้อมูล การตรวจสอบข้อเท็จจริง และคำเตือนด้านความปลอดภัย

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.th.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## การเผยแพร่ในร้านแอป

ดู[คู่มือเผยแพร่ Google Play และ Apple App Store](../stores/STORE_RELEASE.th.md) ซึ่งครอบคลุมการลงนาม การทดสอบ ความเป็นส่วนตัว การตรวจสอบ และสิ่งที่ต้องทำก่อนเผยแพร่

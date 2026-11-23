# คู่มือเผยแพร่บน Google Play และ Apple App Store

คู่มือนี้สำหรับ Safety For You (Expo SDK 58) แอปข้อมูลภัยพิบัติที่ให้บริการฟรี ไม่แสวงหากำไร และดำเนินการอย่างอิสระ ไม่ใช่บริการทดแทน JMA, J-Alert, หน่วยงานท้องถิ่น หรือประกาศฉุกเฉิน การอนุมัติจากร้านค้าไม่สามารถรับประกันได้

## 1. ข้อกำหนดและการตรวจสอบ

เตรียม Node.js 22+, สภาพแวดล้อม Expo ที่เข้ากันได้, บัญชี Expo และบัญชีนักพัฒนาของ Google Play และ Apple ปัจจุบัน repository ยังไม่มี npm lockfile หรือ `eas.json` คำสั่งต่อไปนี้ตรวจสอบ JavaScript เท่านั้น ไม่ใช่การทดสอบ native build

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. กำหนด EAS ตัวระบุและการลงนาม

ก่อนเผยแพร่ครั้งแรก ให้กำหนด `ANDROID_PACKAGE` และ `IOS_BUNDLE_ID` ใน `.env` เป็นค่าเฉพาะที่ผู้เผยแพร่ควบคุม และตรงกับ `app.config.js` และข้อมูลที่ลงทะเบียนในร้านค้า การเปลี่ยนหลังเผยแพร่อาจทำให้กลายเป็นแอปใหม่ ใช้ `build:configure` เพื่อสร้าง `eas.json` และตรวจสอบการเชื่อมกับโปรเจกต์ Expo

```bash
cp .env.example .env
# Set ANDROID_PACKAGE and IOS_BUNDLE_ID in .env before the first release.
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` (example; review after generation):

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  }
}
```

ตัวอย่างให้ EAS จัดการและเพิ่มหมายเลข build อัตโนมัติ ปรับ `expo.version` ใน `app.config.js` ให้ตรงกับรุ่น ห้ามใช้ Android versionCode หรือ iOS buildNumber ซ้ำ เก็บคีย์อัปโหลดและข้อมูลลงนามเป็นความลับ ไม่เพิ่มลง Git

ตั้งค่าตัวแปรที่จำเป็นใน EAS production environment ค่า `EXPO_PUBLIC_*` ถูกอ่านได้จากแอปที่เผยแพร่ จึงห้ามเก็บข้อมูลลับ JMA Worker และบริการ Romaji เป็นทางเลือก และต้องแสดงสถานะเมื่อไม่ได้ตั้งค่า

## 3. Google Play: Android App Bundle (AAB)

ลงทะเบียน Play Console สร้างแอป ระบุ Android package ID ที่ถูกต้อง กรอกหน้าร้าน และเปิด Play App Signing คีย์ลงนามแอปที่ Google จัดการแตกต่างจากคีย์อัปโหลดที่ EAS ใช้ ห้ามส่งคีย์ขึ้น Git

สร้าง production AAB การอัปโหลดครั้งแรกสามารถทำผ่าน Play Console โดยตรง ต่อไปใช้ Expo Submit ได้หลังตั้งค่า Google Play API และ service account อย่างปลอดภัย การอัปโหลดไม่ใช่การเผยแพร่สู่สาธารณะ

```bash
npx eas-cli build --platform android --profile production
# After configuring Google Play API access and service-account credentials:
npx eas-cli submit --platform android --latest
```

ทดสอบผ่าน Internal testing หรือ Closed testing ก่อน โดยตรวจข้อผิดพลาด สิทธิ์ตำแหน่ง แผนที่ และเครือข่าย บัญชีนักพัฒนาส่วนบุคคลที่เปิดหลัง 13 พฤศจิกายน 2023 อาจต้องมีผู้ทดสอบอย่างน้อย 12 คนเข้าร่วมต่อเนื่อง 14 วัน และได้รับสิทธิ์ production ตรวจเงื่อนไขล่าสุดใน Play Console

กรอก Data safety, URL นโยบายความเป็นส่วนตัวทั้งในร้านและแอป, ระดับเนื้อหา, กลุ่มเป้าหมาย, การเข้าถึงแอป, ภาพหน้าจอ, ช่องทางติดต่อ และสิทธิ์ที่ขอ ตรวจ target API ของ AAB ให้ตรงตามข้อกำหนด (API 36 สำหรับแอปโทรศัพท์ใหม่ ณ พฤศจิกายน 2026) ไม่พิจารณาเพียง JavaScript export

## 4. Apple App Store: ไฟล์ iOS IPA ที่ลงนามแล้ว

สมัคร Apple Developer Program สร้าง App ID และรายการแอปใน App Store Connect โดยใช้ Bundle ID ตรงกัน ตั้งค่า distribution certificate และ provisioning profile ผ่าน EAS และตรวจ Apple team ให้ถูกต้อง

สร้าง IPA ที่ลงนามแล้ว อัปโหลดไป App Store Connect และทดสอบด้วย TestFlight บนอุปกรณ์จริง Expo Submit ทำหน้าที่อัปโหลดเท่านั้น ไม่เผยแพร่อัตโนมัติ

```bash
npx eas-cli build --platform ios --profile production
# After configuring Apple credentials and App Store Connect:
npx eas-cli submit --platform ios --latest
```

ใน App Store Connect ระบุ App Privacy, URL นโยบายความเป็นส่วนตัวและการสนับสนุนที่ใช้งานได้, คำอธิบายที่ถูกต้อง, ระดับอายุ, ภาพหน้าจอ iPhone และ iPad ที่จำเป็น (`supportsTablet: true`), ข้อมูลสำหรับผู้ตรวจและบัญชีทดสอบถ้าจำเป็น เลือก build ส่ง App Review และเผยแพร่หลังได้รับอนุมัติ

## 5. ความปลอดภัยและการตรวจสอบก่อนเผยแพร่

ทดสอบ Apple Maps บน iOS และ Leaflet บน Android ด้วยอุปกรณ์จริง ตรวจครบ 13 ภาษา การเข้าถึง สิทธิ์ตำแหน่งที่อนุญาตหรือปฏิเสธ ข่าวเก่าหรือข้อมูลหาย สภาวะออฟไลน์ และเครดิตแผนที่ ห้ามอ้างว่ามีการเตือนฉุกเฉินทางการแบบเรียลไทม์ ตัดสินคำเตือนที่ยังใช้จากหัวข้อ JMA เพียงอย่างเดียว จำลองการแพร่ของสึนามิ หรือรับประกันว่าศูนย์อพยพเปิดอยู่

**สิ่งที่ยังขาดใน repository ได้แก่ `eas.json`, ภาพและภาพหน้าจอสำหรับร้าน, URL นโยบายความเป็นส่วนตัว, การตรวจ native build ที่ลงนามบนอุปกรณ์จริง และผลการตรวจของร้าน เอกสารนี้ไม่ได้ทำให้ทุกขั้นตอนสำเร็จโดยอัตโนมัติ**

## 6. การอัปเดตและดูแลระบบ

เพิ่มหมายเลขเวอร์ชันและ build ทุกครั้ง ทดสอบอุปกรณ์จริงซ้ำ ใช้การเผยแพร่แบบเป็นขั้นตอนเมื่อทำได้ เฝ้าตรวจ crash และข้อกำหนดผู้ให้ข้อมูล ปรับการเปิดเผยความเป็นส่วนตัวเมื่อการจัดการข้อมูลเปลี่ยน และเมื่อแหล่งข้อมูลล้มเหลวต้องแจ้งสถานะพร้อมชี้ไปยังช่องทางทางการ

## Official references

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[Deployment overview](../deploy/DEPLOY.th.md) · [Documentation index](../README.md)

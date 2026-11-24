---
title: Safety For You — Privacy Policy
lang: en
---

# Privacy Policy

**App:** Safety For You (iOS and Android)
**Effective date:** 2026-11-24
**Other languages:** [日本語](ja.md) · [Tiếng Việt](vi.md)

Safety For You is a free, nonprofit, open-source app (MIT License) that shows disaster information for Japan. It is independent and is not affiliated with the Japan Meteorological Agency (JMA), any government body or any emergency service.

## Summary

- The app has no accounts, no advertising, no analytics and no tracking.
- The publisher does not sell or share personal data and does not build user profiles.
- Location is used only while the app is open and only after you allow it.
- Notifications are created on your device. No push token is registered.

## 1. Location

With your permission, the app reads your device location **only while it is open** (foreground). It is used to:

1. show your position on hazard maps and the distance to a reported event;
2. find evacuation places near you;
3. decide whether a recent bulletin covers your location, so the app can show an alarm.

The publisher does not receive or store your location. To work, the app sends requests to the following services, and these requests can reveal your **approximate area**:

| Service | What is sent | Purpose |
|---|---|---|
| Geospatial Information Authority of Japan (GSI) | Map tile numbers around your position (an area of tens of kilometers) | Load designated evacuation places |
| OpenStreetMap Japan tile server (Android) | Tile numbers for the visible map area | Display the map |
| Apple Maps (iOS) | Map area displayed, handled by Apple | Display the map |
| Your device's geocoding service (Apple on iOS, Google on Android) | Your coordinates | Show the name of your city or region |

Each service processes requests under its own privacy policy. You can deny or withdraw location permission at any time in your device settings; the app keeps working without it, but cannot show your position, nearby shelters or location-based alarms.

## 2. Notifications and alarm

If you turn on "Alarm sound", the app asks for notification permission and shows **local** notifications created on your device. No push token is created and no notification data is sent to a server. The alarm works only while the app is open.

## 3. Data stored on your device

The app stores your language, Light/Dark choice, alarm-sound setting and the identifiers of bulletins that already triggered an alarm. This data stays on your device, is excluded from cloud backup, and is deleted when you uninstall the app.

## 4. Network requests

The app downloads public disaster information from P2PQuake (api.p2pquake.net), JMA (www.jma.go.jp) and GSI. If the publisher enables them, the app also uses:

- a JMA headline relay (Cloudflare Worker), which receives no personal data;
- a Japanese-to-Romaji reading service, which receives Japanese text shown in the app, such as bulletin titles, evacuation place names and **the name of your city or region**.

Like any internet service, each server can see your IP address and basic request information. The publisher does not use this information to identify you.

## 5. Children

The app is a general-audience safety app. It does not knowingly collect personal information from children.

## 6. Your choices

- Allow or deny location and notification permissions in your device settings.
- Uninstall the app to delete all data stored on your device.

## 7. Changes

Changes to this policy are published at this address with a new effective date.

## 8. Contact

Questions or requests: open an issue at <https://github.com/vominhthongss/safety-for-you/issues>.

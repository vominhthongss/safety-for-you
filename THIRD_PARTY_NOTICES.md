# Third-party notices

The project's MIT license covers its original code and documentation. It does not relicense dependencies, fonts, external APIs or geographic data. Preserve the licenses accompanying the versions you distribute, including transitive dependencies.

## Software and fonts

| Component | License / notice |
| --- | --- |
| Expo packages, React, React Native, AsyncStorage, safe-area-context, WebView, WanaKana | MIT in the installed packages; retain their respective copyright notices |
| Leaflet 1.9.4 | BSD-2-Clause, reproduced below; engine JS/CSS are bundled with this app |
| Expo Symbols' Material Symbols font on Android | Apache-2.0; retain `@expo-google-fonts/material-symbols/LICENSE_FONT` with distributions |
| Optional Kuroshiro/Kuromoji service | Retain each installed package and dictionary's license; the app's MIT license does not supersede them |

Store release preparation must include applicable native/transitive notices for the actual dependency versions. Package metadata is not an exhaustive binary license inventory.

## External services and data

- [OpenStreetMap copyright](https://www.openstreetmap.org/copyright): OSM data uses ODbL; the basemap remains visibly attributed to OpenStreetMap contributors.
- [OSM Japan tile service](https://wiki.openstreetmap.org/wiki/Japan/OSMFJ_Tileserver): tiles are an external hosted service with usage conditions. Arrange capacity or your own hosting for substantial traffic.
- [GSI data and usage](https://maps.gsi.go.jp/development/ichiran.html): designated evacuation locations come from GSI, separately from the OSM basemap. Preserve source attribution and follow linked use conditions.
- [JMA data](https://www.jma.go.jp/jma/kishou/info/coment.html): source of bulletins and geographic boundaries. Source availability does not imply endorsement of this app.
- [P2PQuake API](https://www.p2pquake.net/develop/json_api_v2/): distribution of earthquake/tsunami data; follow provider terms and service limits.

## Leaflet 1.9.4 license

```text
BSD 2-Clause License

Copyright (c) 2010-2023, Volodymyr Agafonkin
Copyright (c) 2010-2011, CloudMade
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

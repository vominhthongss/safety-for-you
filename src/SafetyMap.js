import React, { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { CONFIG } from "./config";
import { getColors } from "./theme";
import { LEAFLET_JS, LEAFLET_CSS } from "./generated/leafletAssets";
const { valid, boundsForPoints } = require("./mapViewport.cjs");

// Expo Go has react-native-webview built in; no custom native map module.
// Leaflet JS/CSS are bundled locally at npm install, NOT loaded from a CDN.
const MAP_RUNTIME = String.raw`
(function () {
  "use strict";
  const send = (type) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type:type }));
    }
  };
  try {
    if (!window.L) throw new Error("Leaflet did not load");
    const map = L.map("map", {
      zoomControl:true, attributionControl:false, preferCanvas:true,
      zoomSnap:0.25, minZoom:2, maxZoom:18,
      scrollWheelZoom:false, doubleClickZoom:true
    }).setView([36.2048, 138.2529], 5);
    const tiles = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      tileSize:256, minZoom:2, minNativeZoom:5,
      maxZoom:18, maxNativeZoom:18, detectRetina:false,
      attribution:"© GSI / 国土地理院"
    }).addTo(map);
    let tileErrors = 0;
    tiles.on("tileload", () => { tileErrors = 0; });
    tiles.on("tileerror", () => {
      tileErrors++;
      if (tileErrors >= 10) send("tiles-error");
    });
    const pinLayer = L.layerGroup().addTo(map);
    const valid = (p) => p && typeof p.latitude === "number" &&
      typeof p.longitude === "number" &&
      Number.isFinite(p.latitude) && Number.isFinite(p.longitude) &&
      Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180;
    const coords = (p) => [p.latitude, p.longitude];
    const addPin = (p, label, fill) => {
      if (!valid(p)) return;
      const circle = L.circleMarker(coords(p), {
        radius:9, color:"#FFFFFF", weight:3,
        fillColor:fill,fillOpacity:1,interactive:true
      }).addTo(pinLayer);
      const text = document.createElement("span");
      text.textContent = String(label || "");
      circle.bindPopup(text); // DOM node, not untrusted innerHTML
    };
    function update(payload) {
      pinLayer.clearLayers();
      const user = valid(payload.location) ? payload.location : null;
      const event = valid(payload.selectedPoint) ? payload.selectedPoint : null;
      if (user) addPin(user, payload.youLabel, "#007AFF");
      const items = Array.isArray(payload.points) ? payload.points.slice(0,100) : [];
      items.forEach((p) => {
        if (valid(p.coordinate)) addPin(p.coordinate,p.title,payload.kind==="shelter"?"#238353":"#D84032");
      });
      if (event && !items.some((p) => valid(p.coordinate) &&
          p.coordinate.latitude===event.latitude &&
          p.coordinate.longitude===event.longitude)) {
        addPin(event,payload.eventLabel,"#D84032");
      }
      // Fit both confirmed positions. Never fabricate a location for regional alerts.
      const bounds = payload.bounds;
      if (Array.isArray(bounds) && bounds.length===2) {
        map.fitBounds(bounds,{padding:[36,46],maxZoom:12,animate:true,duration:0.4});
      } else if (event) {
        map.setView(coords(event),11,{animate:true});
      } else if (user) {
        map.setView(coords(user),10,{animate:true});
      }
      document.body.style.backgroundColor = payload.dark ? "#1C1C20" : "#F2F2F7";
      setTimeout(() => map.invalidateSize(), 0);
    }
    window.SFY_MAP_UPDATE = (serialized) => {
      try { update(JSON.parse(serialized)); }
      catch (error) { send("render-error"); }
    };
    send("ready");
  } catch (error) {
    send("init-error");
  }
})();
`;
const MAP_HTML = [
  "<!DOCTYPE html><html><head>",
  '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">',
  '<meta charset="utf-8">',
  "<style>", LEAFLET_CSS.replace(/<\/style/gi,"<\\/style"),
  "html,body,#map{width:100%;height:100%;margin:0;padding:0;overflow:hidden;}",
  ".leaflet-container{background:#F2F2F7;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}",
  ".leaflet-control-zoom a{width:44px!important;height:44px!important;line-height:44px!important;}",
  "</style></head><body><div id='map'></div>",
  "<script>", LEAFLET_JS.replace(/<\/script/gi,"<\\/script"), "</script>",
  "<script>", MAP_RUNTIME, "</script></body></html>"
].join("");

const sanitize = (point) => valid(point) ?
  {latitude:Number(point.latitude),longitude:Number(point.longitude)} : null;

function buildPayload({location,points,selectedPoint,kind,dark,t}) {
  const user = sanitize(location);
  const event = sanitize(selectedPoint);
  const extent = boundsForPoints([user,event]); // [west,south,east,north]
  return {
    location:user,
    selectedPoint:event,
    bounds:extent ? [[extent[1],extent[0]],[extent[3],extent[2]]] : null,
    points:points.filter((p)=>valid(p.coordinate)).slice(0,100).map((p)=>({
      coordinate:sanitize(p.coordinate),
      title:String(p.title || p.name || "").slice(0,240)
    })),
    kind, dark,
    youLabel:t("you"),
    eventLabel:t("map")
  };
}

/** WebView + offline-bundled Leaflet engine with online GSI map tiles. */
export default function SafetyMap({
  location, points = [], selectedPoint, t, height = 270, kind = "hazard", dark = false
}) {
  const ref = useRef(null);
  const [ready,setReady] = useState(false);
  const [mapFailed,setMapFailed] = useState(false);
  const colors = useMemo(() => getColors(dark),[dark]);
  // Stable content avoids remounting the WebView whenever a report is selected.
  const source = useMemo(() => ({html:MAP_HTML,baseUrl:"https://maps.gsi.go.jp/"}),[]);
  const payload = useMemo(() =>
    buildPayload({location,points,selectedPoint,kind,dark,t}),
    [location?.latitude,location?.longitude,selectedPoint?.latitude,
      selectedPoint?.longitude,points,kind,dark,t]
  );
  useEffect(() => {
    if (!ready) return;
    // JSON double-encoding passes the payload as a *string* to the JS bridge.
    // Incoming JMA/GSI titles remain data and never become executable JS.
    const body = JSON.stringify(JSON.stringify(payload));
    ref.current?.injectJavaScript("window.SFY_MAP_UPDATE("+body+");true;");
  },[ready,payload]);
  const onMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "ready") { setReady(true);setMapFailed(false); }
      if (message.type === "init-error" || message.type === "render-error" ||
        message.type === "tiles-error") setMapFailed(true);
    } catch { setMapFailed(true); }
  };
  return (
    <View style={[styles.shell,{height,backgroundColor:colors.bg,borderColor:colors.border}]}>
      <WebView ref={ref} style={styles.map} source={source}
        originWhitelist={["*"]} javaScriptEnabled
        domStorageEnabled={false} scrollEnabled={false}
        setSupportMultipleWindows={false}
        onMessage={onMessage} onError={()=>setMapFailed(true)}
        onHttpError={()=>setMapFailed(true)}
        accessibilityLabel={t("map")} testID="gsi-map"
      />
      {mapFailed && <View style={[styles.error,{backgroundColor:colors.white}]} pointerEvents="none">
        <Text style={[styles.note,{color:colors.ink}]}>{t("unavailable")}</Text>
      </View>}
      {!valid(location) && <View style={[styles.gps,{backgroundColor:colors.white}]} pointerEvents="none">
        <Text style={[styles.note,{color:colors.ink}]}>{t("noLocationPin")}</Text>
      </View>}
      <Pressable accessibilityRole="link" accessibilityLabel="GSI map attribution"
        style={[styles.credit,{backgroundColor:colors.white}]}
        onPress={()=>Linking.openURL("https://maps.gsi.go.jp/development/ichiran.html").catch(()=>{})}>
        <Text style={[styles.creditText,{color:colors.ink}]}>© GSI · Leaflet</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  shell:{borderWidth:StyleSheet.hairlineWidth,borderRadius:12,overflow:"hidden"},
  map:{flex:1,backgroundColor:"transparent"},
  error:{position:"absolute",top:8,left:8,right:8,padding:10,borderRadius:8},
  gps:{position:"absolute",top:8,left:8,padding:10,borderRadius:8},
  note:{fontSize:13,fontWeight:"600"},
  credit:{position:"absolute",right:6,bottom:6,minHeight:36,
    paddingHorizontal:10,justifyContent:"center",borderRadius:8},
  creditText:{fontSize:11}
});

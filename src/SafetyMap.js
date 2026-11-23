import React, { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import AppleSafetyMap from "./AppleSafetyMap";
import { WebView } from "react-native-webview";
import { CONFIG } from "./config";
import { getColors } from "./theme";
import { LEAFLET_JS, LEAFLET_CSS } from "./generated/leafletAssets";
const { valid, boundsForPoints } = require("./mapViewport.cjs");
const {buildMapZones}=require("./mapFeatures.cjs");

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
    // OSM Japan's English-label style keeps Kanji off the raster basemap.
    // Native place names in hazard markers are shown alongside Romaji.
    const tiles = L.tileLayer("https://tile.openstreetmap.jp/styles/maptiler-basic-en/{z}/{x}/{y}.png", {
      tileSize:256, minZoom:2, maxZoom:18, maxNativeZoom:18,
      detectRetina:false, attribution:"© OpenStreetMap contributors"
    }).addTo(map);
    let tileErrors = 0;
    tiles.on("tileload", () => { tileErrors = 0; });
    tiles.on("tileerror", () => {
      tileErrors++;
      if (tileErrors >= 10) send("tiles-error");
    });
    const pinLayer = L.layerGroup().addTo(map);
    const zonePinLayer = L.layerGroup().addTo(map);
    const zoneLayer = L.featureGroup().addTo(map);
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
      zonePinLayer.clearLayers();
      zoneLayer.clearLayers();
      const user = valid(payload.location) ? payload.location : null;
      const event = valid(payload.selectedPoint) ? payload.selectedPoint : null;
      if (user) addPin(user, payload.youLabel, "#007AFF");
      const items = Array.isArray(payload.points) ? payload.points.slice(0,100) : [];
      items.forEach((p) => {
        if (!valid(p.coordinate)) return;
        const severityColor = /^#[0-9A-Fa-f]{6}$/.test(p.color || "") ? p.color : "#82909A";
        addPin(p.coordinate,p.title,payload.kind==="shelter"?"#238353":severityColor);
      });
      if (event && !items.some((p) => valid(p.coordinate) &&
          p.coordinate.latitude===event.latitude &&
          p.coordinate.longitude===event.longitude)) {
        addPin(event,payload.eventLabel,payload.selectedColor || "#82909A");
      }
      // Render only officially-defined JMA regions matched to this report.
      const zones = Array.isArray(payload.zones) ? payload.zones.slice(0,60) : [];
      zones.forEach((feature) => {
        try {
          const p = feature.properties || {};
          const shape = L.geoJSON(feature,{
            style:{
              color:typeof p.color==="string" ? p.color : "#D84032",
              weight:p.kind==="forecastCoast" ? 8 : 1.8,
              opacity:0.94,
              fill:!!p.fill,
              fillOpacity:p.fill ? 0.35 : 0
            }
          }).addTo(zoneLayer);
          const label=document.createElement("div");
          const heading=document.createElement("strong");
          heading.textContent=String(p.label || "");
          const line=document.createElement("p");
          line.textContent=String(p.value || "");
          line.style.margin="4px 0 0";
          label.appendChild(heading);
          label.appendChild(line);
          shape.bindPopup(label);
        } catch (_) { /* invalid upstream geometry is omitted */ }
      });
      // Area badges show PUBLISHED JMA region intensities, never assumed sensor points.
      (Array.isArray(payload.zoneMarkers)?payload.zoneMarkers:[]).slice(0,60)
        .forEach((item)=>{
          if(!valid(item.coordinate) || !/^[0-7](?:[+-])?$|^≥5-/.test(String(item.shortLabel))) return;
          const tint=/^#[a-fA-F0-9]{6}$/.test(item.color)?item.color:"#82909A";
          const marker=L.marker(coords(item.coordinate),{
            icon:L.divIcon({
              className:"shindo-badge",
              html:'<span class="shindo-badge-label"></span>',
              iconSize:[32,32],iconAnchor:[16,16]
            })
          }).addTo(zonePinLayer);
          const el=marker.getElement();
          if(el){el.style.borderColor=tint;
            const label=el.querySelector(".shindo-badge-label");
            if(label)label.textContent=item.shortLabel;}
          const popup=document.createElement("span");
          popup.textContent=String(item.title||"")+" · "+String(item.value||"");
          marker.bindPopup(popup);
        });
      // Fit verified event + GPS AND any published region boundaries.
      const bounds = payload.bounds;
      let fit=null;
      if (Array.isArray(bounds) && bounds.length===2) fit=L.latLngBounds(bounds);
      if (zoneLayer.getLayers().length) {
        const zoneBounds=zoneLayer.getBounds();
        if (zoneBounds.isValid()) {
          if (!fit) fit=zoneBounds;
          else fit.extend(zoneBounds);
        }
      }
      if (fit && fit.isValid()) {
        if (user) fit.extend(coords(user));
        if (event) fit.extend(coords(event));
        map.fitBounds(fit,{padding:[36,46],maxZoom:12,animate:true,duration:0.4});
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
  ".leaflet-control-zoom a{width:44px!important;height:44px!important;line-height:44px!important;}.leaflet-popup-content{white-space:pre-line;line-height:1.45;}",
  ".shindo-badge{display:flex!important;align-items:center;justify-content:center;background:#fff;border:3px solid #82909A;border-radius:50%;box-sizing:border-box;box-shadow:0 1px 4px #0007;color:#1c1c1e;font-weight:800;font-size:13px;}",
  "</style></head><body><div id='map'></div>",
  "<script>", LEAFLET_JS.replace(/<\/script/gi,"<\\/script"), "</script>",
  "<script>", MAP_RUNTIME, "</script></body></html>"
].join("");

const sanitize = (point) => valid(point) ?
  {latitude:Number(point.latitude),longitude:Number(point.longitude)} : null;

function buildPayload({location,points,selectedPoint,kind,dark,t,zones,selectedColor}) {
  const user = sanitize(location);
  const event = sanitize(selectedPoint);
  const extent = boundsForPoints([user,event]); // [west,south,east,north]
  return {
    location:user,
    selectedPoint:event,
    selectedColor:typeof selectedColor==="string" && /^#[0-9A-Fa-f]{6}$/.test(selectedColor) ?
      selectedColor : "#82909A",
    bounds:extent ? [[extent[1],extent[0]],[extent[3],extent[2]]] : null,
    points:points.filter((p)=>valid(p.coordinate)).slice(0,100).map((p)=>({
      coordinate:sanitize(p.coordinate),
      title:String(p.title || p.name || "").slice(0,300),
      color:typeof p.color === "string" && /^#[0-9A-Fa-f]{6}$/.test(p.color) ?
        p.color : "#82909A"
    })),
    kind, dark,
    zones:Array.isArray(zones) ? zones : [],
    zoneMarkers:buildMapZones(zones).markers,
    youLabel:t("you"),
    eventLabel:t("map")
  };
}

/** WebView + bundled Leaflet with OSM Japan English-label raster tiles. */
function LeafletSafetyMap({
  location, points = [], selectedPoint, t, height = 270, kind = "hazard",
  zones = [], dark = false, selectedColor = "#82909A"
}) {
  const ref = useRef(null);
  const [ready,setReady] = useState(false);
  const [mapFailed,setMapFailed] = useState(false);
  const colors = useMemo(() => getColors(dark),[dark]);
  // Stable content avoids remounting the WebView whenever a report is selected.
  const source = useMemo(() => ({html:MAP_HTML,baseUrl:"https://tile.openstreetmap.jp/"}),[]);
  const payload = useMemo(() =>
    buildPayload({location,points,selectedPoint,kind,dark,t,zones,selectedColor}),
    [location?.latitude,location?.longitude,selectedPoint?.latitude,
      selectedPoint?.longitude,points,kind,dark,t,zones,selectedColor]
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
      {!!zones.length && kind !== "shelter" && <View style={[styles.legend,{backgroundColor:colors.white}]}>
        <Text style={[styles.legendText,{color:colors.ink}]}>
          {kind === "tsunami" ? t("tsunamiZoneLegend") : t("quakeZoneLegend")}
        </Text>
        <View style={styles.legendSwatches}>
          {Array.from(new Map(zones.filter((z)=>z.properties?.color)
            .map((z)=>[String(z.properties.color)+"-"+String(z.properties.value),z.properties])).values())
            .slice(0,7).map((item,i)=>(
              <View key={i} style={styles.legendItem}>
                <View style={[styles.swatch,{backgroundColor:item.color}]}/>
                <Text style={[styles.legendItemText,{color:colors.ink}]}>{item.value}</Text>
              </View>
            ))}
        </View>
      </View>}
      <Pressable accessibilityRole="link" accessibilityLabel="OpenStreetMap attribution"
        style={[styles.credit,{backgroundColor:colors.white}]}
        onPress={()=>Linking.openURL("https://wiki.openstreetmap.org/wiki/Japan/OSMFJ_Tileserver").catch(()=>{})}>
        <Text style={[styles.creditText,{color:colors.ink}]}>
          © OpenStreetMap contributors · OSM Japan
        </Text>
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
  creditText:{fontSize:10},
  legend:{position:"absolute",left:8,bottom:8,maxWidth:"54%",padding:9,borderRadius:10,gap:6},
  legendText:{fontSize:11,fontWeight:"700"},
  legendSwatches:{flexDirection:"row",gap:6,flexWrap:"wrap"},
  legendItem:{flexDirection:"row",alignItems:"center",gap:3},
  legendItemText:{fontSize:10,fontWeight:"700"},
  swatch:{width:14,height:10,borderRadius:3}
});

// Apple Maps on iPhone via native MapKit; Android keeps WebView/Leaflet.
export default function SafetyMap(props) {
  return Platform.OS==="ios" ? <AppleSafetyMap {...props}/> : <LeafletSafetyMap {...props}/>;
}

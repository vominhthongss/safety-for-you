import React, { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Camera, Map, Marker } from "@maplibre/maplibre-react-native";
import { CONFIG } from "./config";
import { getColors } from "./theme";

// MapLibre raster tiles from the Geospatial Information Authority of Japan.
// No Google Maps SDK, API key, billing project, Mapbox token or third-party demo style.
const JAPAN_CENTER = [138.2529, 36.2048];
const GSI_STYLE = {
  version: 8,
  name: "GSI Standard Map",
  sources: {
    "gsi-standard": {
      type: "raster",
      tiles: [CONFIG.gsiBasemap],
      tileSize: 256,
      minzoom: 2,
      maxzoom: 18,
      attribution: "Geospatial Information Authority of Japan (GSI)"
    }
  },
  layers: [{ id: "gsi-standard", type: "raster", source: "gsi-standard" }]
};

const asLngLat = (point) => [Number(point.longitude), Number(point.latitude)];
const valid = (point) =>
  point && Number.isFinite(Number(point.latitude)) &&
  Number.isFinite(Number(point.longitude)) &&
  Number(point.latitude) >= -90 && Number(point.latitude) <= 90 &&
  Number(point.longitude) >= -180 && Number(point.longitude) <= 180;

function Pin({ shelter = false, mine = false }) {
  const color = mine ? "#007AFF" : shelter ? "#238353" : "#D84032";
  return (
    <View style={[styles.pin, { backgroundColor:color }]}
      accessible accessibilityLabel={mine ? "My location" : shelter ? "Evacuation place" : "Hazard location"}>
      <View style={styles.pinCore}/>
    </View>
  );
}

// Never guess a regional alert's coordinates or claim a shelter is currently open.
export default function SafetyMap({
  location, points = [], selectedPoint, t, height = 270, kind = "hazard", dark = false
}) {
  const camera = useRef(null);
  const colors = useMemo(() => getColors(dark), [dark]);
  const [mapFailed, setMapFailed] = useState(false);
  const [chosen, setChosen] = useState("");
  const initial = useMemo(() => {
    const start = valid(selectedPoint) ? selectedPoint : valid(location) ? location : null;
    return { center: start ? asLngLat(start) : JAPAN_CENTER, zoom: start ? 10 : 4.5 };
  }, []); // Native map camera initial state is only used on mount.

  useEffect(() => {
    const target = valid(selectedPoint) ? selectedPoint : valid(location) ? location : null;
    if (!target) return;
    camera.current?.easeTo({
      center: asLngLat(target),
      zoom: valid(selectedPoint) ? 13 : 10,
      duration: 350
    });
  }, [selectedPoint?.latitude, selectedPoint?.longitude, location?.latitude, location?.longitude]);

  const markers = useMemo(() => points.filter((item) => valid(item.coordinate)).slice(0, 100), [points]);
  return (
    <View style={[styles.shell, {height,backgroundColor:colors.bg,borderColor:colors.border}]}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={GSI_STYLE}
        logo={false}
        attribution
        onDidFailLoadingMap={() => setMapFailed(true)}
        compass
        touchRotate={false}
        testID="gsi-map">
        <Camera
          ref={camera}
          initialViewState={initial}
          minZoom={2}
          maxZoom={18}
        />
        {valid(location) && (
          <Marker id="my-location" lngLat={asLngLat(location)} anchor="center"
            onPress={() => setChosen(t("you"))}>
            <Pin mine/>
          </Marker>
        )}
        {markers.map((item, index) => (
          <Marker
            id={String(item.id || index)}
            key={String(item.id || index)}
            lngLat={asLngLat(item.coordinate)}
            anchor="center"
            onPress={() => setChosen(item.title || item.name || t("map"))}>
            <Pin shelter={kind==="shelter"}/>
          </Marker>
        ))}
      </Map>
      {mapFailed && <View style={[styles.mapError, {backgroundColor:colors.white}]} pointerEvents="none">
        <Text style={[styles.notice, {color:colors.ink}]}>{t("unavailable")}</Text>
      </View>}
      {!valid(location) && <View style={[styles.noGps, {backgroundColor: dark ? "#25262AE8" : "#FFFFFFE8"}]} pointerEvents="none">
        <Text style={styles.notice}>{t("noLocationPin")}</Text>
      </View>}
      {!!chosen && <View style={[styles.selection, {backgroundColor: dark ? "#25262AF5" : "#FFFFFFF5"}]} pointerEvents="none">
        <Text style={styles.notice} numberOfLines={3}>{chosen}</Text>
      </View>}
      <Pressable accessibilityRole="link" accessibilityLabel="GSI map attribution"
        style={[styles.credits, {backgroundColor: dark ? "#25262AED" : "#FFFFFFED"}]}
        onPress={() => Linking.openURL("https://www.gsi.go.jp/ENGLISH/page_e30286.html").catch(() => {})}>
        <Text style={[styles.creditText, {color:colors.ink}]}>© GSI • MapLibre</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  shell:{ borderRadius:12, overflow:"hidden", backgroundColor:"#ECF1F5",borderWidth:1,borderColor:"#D1D1D6" },
  pin:{ width:24,height:24,borderRadius:12,borderColor:"#FFFFFF",borderWidth:3,
    justifyContent:"center",alignItems:"center",elevation:3 },
  pinCore:{ width:7,height:7,borderRadius:4,backgroundColor:"#FFFFFF" },
  noGps:{ position:"absolute",top:10,left:10,backgroundColor:"#FFFFFFE8",borderRadius:9,padding:8 },
  selection:{ position:"absolute",left:10,right:10,bottom:48,backgroundColor:"#FFFFFFF5",
    borderRadius:9,padding:10 },
  notice:{ fontSize:13,color:"#1C1C1E",fontWeight:"600" },
  credits:{ position:"absolute",right:7,bottom:6,minHeight:36,
    paddingHorizontal:10,justifyContent:"center",backgroundColor:"#FFFFFFED",borderRadius:8 },
  creditText:{ color:"#333333",fontSize:11 }
});

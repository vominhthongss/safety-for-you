import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { COLORS } from "./config";

// Markers are shown only for verified coordinates. Area-wide alerts are not fabricated as map points.
export default function SafetyMap({ location, points = [], selectedPoint, t, height = 270 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = selectedPoint || location;
    if (!c) return;
    ref.current?.animateToRegion({ ...c, latitudeDelta: .15, longitudeDelta: .15 }, 350);
  }, [selectedPoint?.latitude, selectedPoint?.longitude, location?.latitude, location?.longitude]);
  return (
    <View style={[styles.shell, { height }]}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: location?.latitude || 36.2048,
          longitude: location?.longitude || 138.2529,
          latitudeDelta: location ? .16 : 10, longitudeDelta: location ? .16 : 10 }}
        showsCompass accessibilityLabel={t("map")}>
        {location && <Marker coordinate={location} title={t("you")} pinColor={COLORS.teal} />}
        {points.filter((p) => p.coordinate).slice(0,100).map((point) => (
          <Marker key={point.id} coordinate={point.coordinate} title={point.title || point.name}
            description={point.address || point.description || ""} pinColor="#C44D37" />
        ))}
      </MapView>
      {!location && <View style={styles.overlay}><Text style={styles.overlayText}>{t("noLocationPin")}</Text></View>}
    </View>
  );
}
const styles = StyleSheet.create({
  shell: { borderRadius: 12, overflow: "hidden", backgroundColor: COLORS.tealLight, borderWidth: 1, borderColor: COLORS.border },
  overlay: { position: "absolute", top: 12, left: 12, backgroundColor: COLORS.white, borderRadius: 10, padding: 10 },
  overlayText: { fontSize: 12, color: COLORS.muted, fontWeight: "600" }
});

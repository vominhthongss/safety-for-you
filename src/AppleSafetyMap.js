import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";
import { getColors } from "./theme";
const {buildMapZones}=require("./mapFeatures.cjs");
const {valid}=require("./mapViewport.cjs");

const JAPAN={latitude:36.2048,longitude:138.2529};
const safe=(p)=>valid(p) ? {latitude:Number(p.latitude),longitude:Number(p.longitude)}:null;
const mapColor=(s)=>typeof s==="string" && /^#[a-fA-F0-9]{6}$/.test(s)?s:"#82909A";
function initialRegion(primary) {
  return {latitude:primary.latitude,longitude:primary.longitude,
    latitudeDelta:4,longitudeDelta:4};
}
// iOS MapKit via react-native-maps (default provider = Apple Maps).
// Android never mounts this component; it keeps the existing Leaflet WebView.
export default function AppleSafetyMap({
  location,points=[],selectedPoint,t,height=270,kind="hazard",zones=[],
  dark=false,selectedColor="#82909A"
}) {
  const mapRef=useRef(null);
  const [ready,setReady]=useState(false);
  const colors=useMemo(()=>getColors(dark),[dark]);
  const mapZones=useMemo(()=>buildMapZones(zones),[zones]);
  const user=safe(location);
  const selected=safe(selectedPoint);
  const eventPoints=useMemo(()=>points.filter(p=>safe(p.coordinate)).slice(0,100)
    .map((p,index)=>({
      key:String(p.id||index),coordinate:safe(p.coordinate),
      title:String(p.title||p.name||"").slice(0,300),
      tint:kind==="shelter"?"#238353":mapColor(p.color)
    })),[points,kind]);
  const coordinates=useMemo(()=>{
    const seen=new Set(),result=[];
    for(const p of [user,selected,...eventPoints.map(p=>p.coordinate),
      ...mapZones.markers.map(m=>m.coordinate)]) {
      if(!p)continue;
      const id=`${p.latitude.toFixed(6)}/${p.longitude.toFixed(6)}`;
      if(!seen.has(id)){seen.add(id);result.push(p);}
    }
    // Regional outlines are already represented by JMA-derived label anchors.
    return result;
  },[user?.latitude,user?.longitude,selected?.latitude,selected?.longitude,
      eventPoints,mapZones]);
  const viewportKey=coordinates.map(p=>`${p.latitude.toFixed(4)}:${p.longitude.toFixed(4)}`).join("|");
  useEffect(()=>{
    if(!ready || !coordinates.length)return;
    if(coordinates.length===1) {
      mapRef.current?.animateToRegion(initialRegion(coordinates[0]),350);
    } else {
      mapRef.current?.fitToCoordinates(coordinates,{
        edgePadding:{top:46,right:42,bottom:46,left:42},animated:false
      });
    }
  },[ready,viewportKey]);
  const origin=selected||user||eventPoints[0]?.coordinate||JAPAN;
  return <View style={[styles.shell,{height,backgroundColor:colors.bg,borderColor:colors.border}]}>
    <MapView ref={mapRef} style={styles.map} mapType="standard"
      userInterfaceStyle={dark?"dark":"light"}
      initialRegion={initialRegion(origin)} onMapReady={()=>setReady(true)}
      showsCompass showsScale showsUserLocation={false}
      accessibilityLabel={t("map")} testID="apple-map">
      {mapZones.polygons.map(p=><Polygon key={p.key} coordinates={p.coordinates}
        holes={p.holes} strokeColor={p.color} strokeWidth={1.5}
        fillColor={p.color+"55"} tappable={false}/>)}
      {mapZones.lines.map(p=><Polyline key={p.key} coordinates={p.coordinates}
        strokeColor={p.color} strokeWidth={6} tappable={false}/>)}
      {mapZones.markers.map(item=><Marker key={item.key}
        coordinate={item.coordinate} anchor={{x:0.5,y:0.5}}
        title={item.title} description={item.value} tracksViewChanges={false}
        accessibilityLabel={item.title+" · "+item.value}>
        <View style={[styles.shindoMarker,{borderColor:item.color}]}>
          <Text style={styles.shindoText}>{item.shortLabel}</Text>
        </View>
      </Marker>)}
      {eventPoints.map(item=>selected && item.coordinate.latitude===selected.latitude &&
          item.coordinate.longitude===selected.longitude?null:
        <Marker key={item.key} coordinate={item.coordinate} title={item.title}
          pinColor={item.tint} />)}
      {selected && <Marker coordinate={selected}
        title={kind==="earthquake"?t("earthquake"):t("map")}
        description={eventPoints.find(item=>item.coordinate.latitude===selected.latitude &&
          item.coordinate.longitude===selected.longitude)?.title||undefined}
        anchor={{x:0.5,y:0.5}} tracksViewChanges={false}>
        <View style={[styles.epicenter,{backgroundColor:mapColor(selectedColor)}]}>
          <Text style={styles.epicenterText}>✦</Text>
        </View>
      </Marker>}
      {user && <Marker coordinate={user} title={t("you")}
        anchor={{x:0.5,y:0.5}} tracksViewChanges={false}>
        <View style={styles.userOuter}><View style={styles.userInner}/></View>
      </Marker>}
    </MapView>
    {!user && <View style={[styles.gps,{backgroundColor:colors.white}]}
      pointerEvents="none">
      <Text style={[styles.note,{color:colors.ink}]}>{t("noLocationPin")}</Text>
    </View>}
    {!!mapZones.markers.length && kind==="earthquake" &&
      <View style={[styles.legend,{backgroundColor:colors.white}]}
        pointerEvents="none">
        <Text style={[styles.note,{color:colors.ink}]}>{t("quakeZoneLegend")}</Text>
        <View style={styles.legendItems}>
          {[...new Map(mapZones.markers.map(m=>[m.shortLabel,m])).values()].slice(0,6)
            .map(m=><View key={m.shortLabel} style={styles.legendItem}>
              <View style={[styles.legendSwatch,{backgroundColor:m.color}]}/>
              <Text style={[styles.legendLabel,{color:colors.ink}]}>{m.shortLabel}</Text>
            </View>)}
        </View>
      </View>}
  </View>;
}
const styles=StyleSheet.create({
  shell:{borderWidth:StyleSheet.hairlineWidth,borderRadius:12,overflow:"hidden"},
  map:{flex:1},
  userOuter:{width:22,height:22,borderRadius:11,backgroundColor:"#FFFFFF",
    alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#007AFF"},
  userInner:{width:14,height:14,borderRadius:7,backgroundColor:"#007AFF"},
  epicenter:{width:28,height:28,borderWidth:2,borderColor:"#FFFFFF",borderRadius:14,
    alignItems:"center",justifyContent:"center"},
  epicenterText:{fontWeight:"900",fontSize:19,color:"#FFFFFF"},
  shindoMarker:{width:31,minHeight:31,borderRadius:16,borderWidth:3,
    backgroundColor:"#FFFFFF",justifyContent:"center",alignItems:"center",paddingHorizontal:2},
  shindoText:{fontSize:12,fontWeight:"900",color:"#1C1C1E",textAlign:"center"},
  gps:{position:"absolute",top:8,right:8,padding:9,borderRadius:8},
  note:{fontSize:12,fontWeight:"700"},
  legend:{position:"absolute",left:8,top:8,right:60,padding:7,borderRadius:8,gap:5},
  legendItems:{flexDirection:"row",gap:7,flexWrap:"wrap"},
  legendItem:{flexDirection:"row",alignItems:"center",gap:3},
  legendSwatch:{width:10,height:10,borderRadius:5},
  legendLabel:{fontSize:11,fontWeight:"700"}
});

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";
import { SymbolView } from "expo-symbols";
import { getColors } from "./theme";
const {buildMapZones}=require("./mapFeatures.cjs");
const {valid}=require("./mapViewport.cjs");
const {distanceKm}=require("./userAlert.cjs");
const {TSUNAMI,readableTextOn}=require("./hazardSeverity.cjs");

const JAPAN={latitude:36.2048,longitude:138.2529};
const safe=(p)=>valid(p) ? {latitude:Number(p.latitude),longitude:Number(p.longitude)}:null;
const mapColor=(s)=>typeof s==="string" && /^#[a-fA-F0-9]{6}$/.test(s)?s:"#82909A";
// Keep the original Japanese name and the validated Romaji reading on separate
// Apple Maps callout lines; MapKit may truncate multiline marker titles.
function calloutLabel(value) {
  const lines=String(value||"").split("\n").map(s=>s.trim()).filter(Boolean);
  return {title:lines[0]||"",detail:lines.slice(1).join(" · ")};
}
function initialRegion(primary) {
  return {latitude:primary.latitude,longitude:primary.longitude,
    latitudeDelta:4,longitudeDelta:4};
}
// iOS MapKit via react-native-maps (default provider = Apple Maps).
// Android never mounts this component; it keeps the existing Leaflet WebView.
export default function AppleSafetyMap({
  location,points=[],selectedPoint,t,height=270,kind="hazard",zones=[],
  dark=false,selectedColor="#82909A",selectedLabel=null
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
      ...calloutLabel(String(p.title||p.name||"").slice(0,300)),
      tint:kind==="shelter"?"#238353":mapColor(p.color)
    })),[points,kind]);
  const coordinates=useMemo(()=>{
    const seen=new Set(),result=[];
    // A selected event frames only the user, the event and its JMA areas,
    // so both positions stay visible however far apart they are.
    for(const p of [user,selected,...(selected?[]:eventPoints.map(p=>p.coordinate)),
      ...mapZones.markers.map(m=>m.coordinate),
      ...mapZones.polygons.flatMap(p=>p.coordinates.length ? [
        p.coordinates.reduce((a,b)=>a.latitude<b.latitude?a:b),
        p.coordinates.reduce((a,b)=>a.latitude>b.latitude?a:b),
        p.coordinates.reduce((a,b)=>a.longitude<b.longitude?a:b),
        p.coordinates.reduce((a,b)=>a.longitude>b.longitude?a:b)
      ]:[]),
      ...mapZones.lines.flatMap(p=>p.coordinates.length ? [
        p.coordinates[0],p.coordinates[p.coordinates.length-1]
      ]:[])]) {
      if(!p)continue;
      const id=`${p.latitude.toFixed(6)}/${p.longitude.toFixed(6)}`;
      if(!seen.has(id)){seen.add(id);result.push(p);}
    }
    // Regional outlines are already represented by JMA-derived label anchors.
    return result;
  },[user?.latitude,user?.longitude,selected?.latitude,selected?.longitude,
      eventPoints,mapZones]);
  const viewportKey=coordinates.map(p=>`${p.latitude.toFixed(4)}:${p.longitude.toFixed(4)}`).join("|");
  const frame=useCallback((animated)=>{
    if(!coordinates.length)return;
    if(coordinates.length===1) {
      mapRef.current?.animateToRegion(initialRegion(coordinates[0]),350);
    } else {
      mapRef.current?.fitToCoordinates(coordinates,{
        edgePadding:{top:72,right:56,bottom:72,left:56},animated
      });
    }
  },[viewportKey]);
  useEffect(()=>{ if(ready)frame(false); },[ready,frame]);
  const km=user && selected ? distanceKm(user,selected) : null;
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
        title={calloutLabel(item.title).title}
        description={[calloutLabel(item.title).detail,item.value].filter(Boolean).join(" · ")}
        tracksViewChanges={false}
        accessibilityLabel={item.title+" · "+item.value}>
        {item.kind==="tsunami" ?
          <View style={[styles.waveMarker,{backgroundColor:item.color}]}>
            <Text style={[styles.waveText,{color:readableTextOn(item.color)}]}>{"≋ "+item.shortLabel}</Text>
          </View> :
          <View style={[styles.shindoMarker,{backgroundColor:item.color}]}>
            <Text style={[styles.shindoText,{color:readableTextOn(item.color)}]}>{item.shortLabel}</Text>
          </View>}
      </Marker>)}
      {eventPoints.map(item=>selected && item.coordinate.latitude===selected.latitude &&
          item.coordinate.longitude===selected.longitude?null:
        <Marker key={item.key} coordinate={item.coordinate} title={item.title}
          description={item.detail||undefined} pinColor={item.tint} />)}
      {selected && <Marker coordinate={selected}
        title={calloutLabel(kind==="earthquake"?t("earthquake"):t("map")).title}
        description={[calloutLabel(kind==="earthquake"?t("earthquake"):t("map")).detail,
          ...eventPoints.filter(item=>item.coordinate.latitude===selected.latitude &&
            item.coordinate.longitude===selected.longitude)
            .flatMap(item=>[item.title,item.detail].filter(Boolean))]
          .filter(Boolean).join(" · ")||undefined}
        anchor={{x:0.5,y:0.5}} tracksViewChanges={false}>
        <View style={styles.epicenterWrap}>
          <View style={[styles.epicenter,{backgroundColor:mapColor(selectedColor)}]}>
            <Text style={[styles.epicenterText,{color:readableTextOn(mapColor(selectedColor))}]}>
              {selectedLabel && /^[0-7][+-]?$/.test(selectedLabel) ? selectedLabel : "×"}
            </Text>
          </View>
          {kind==="earthquake" && <Text style={styles.epicenterCaption}>{t("epicenter")}</Text>}
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
    {kind==="tsunami" && !!mapZones.lines.length &&
      <View style={[styles.legend,{backgroundColor:colors.white}]} pointerEvents="none">
        <Text style={[styles.note,{color:colors.ink}]}>{t("tsunamiZoneLegend")}</Text>
        <View style={styles.legendItems}>
          {Object.entries(TSUNAMI).map(([grade,item])=><View key={grade} style={styles.legendItem}>
            <View style={[styles.legendLine,{backgroundColor:item.color}]}/>
            <Text style={[styles.legendLabel,{color:colors.ink}]}>{t(grade)}</Text>
          </View>)}
        </View>
        {mapZones.markers.some(m=>m.kind==="tsunami") &&
          <Text style={[styles.legendLabel,{color:colors.muted}]}>{t("tsunamiHeightLegend")}</Text>}
      </View>}
    {(km!==null || coordinates.length>1) && <View style={styles.controls} pointerEvents="box-none">
      {km!==null ? <View style={[styles.chip,{backgroundColor:colors.white}]}
        accessibilityLabel={t("distanceFromYou").replace(/\{km\}/g,String(Math.round(km)))}>
        <Text style={[styles.chipText,{color:colors.ink}]}>
          {t("distanceFromYou").replace(/\{km\}/g,String(Math.round(km)))}
        </Text>
      </View> : <View/>}
      <Pressable onPress={()=>frame(true)} accessibilityRole="button"
        accessibilityLabel={t("showBoth")} hitSlop={4}
        style={({pressed})=>[styles.fitButton,{backgroundColor:colors.white,opacity:pressed?0.7:1}]}>
        <SymbolView name="scope" size={22} tintColor={colors.teal} type="hierarchical"
          fallback={<Text style={{color:colors.teal,fontSize:20}}>◎</Text>}/>
      </Pressable>
    </View>}
    {!!mapZones.markers.length && kind==="earthquake" &&
      <View style={[styles.legend,{backgroundColor:colors.white}]}
        pointerEvents="none">
        <Text style={[styles.note,{color:colors.ink}]}>{t("quakeZoneLegend")}</Text>
        <View style={styles.legendItems}>
          {[...new Map(mapZones.markers.filter(m=>m.kind!=="tsunami")
            .map(m=>[m.shortLabel,m])).values()].slice(0,8)
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
  epicenterWrap:{alignItems:"center"},
  epicenter:{minWidth:40,height:40,borderWidth:3,borderColor:"#FFFFFF",borderRadius:20,
    alignItems:"center",justifyContent:"center",paddingHorizontal:4,
    shadowColor:"#000",shadowOpacity:0.35,shadowRadius:3,shadowOffset:{width:0,height:1}},
  epicenterText:{fontWeight:"900",fontSize:17},
  epicenterCaption:{marginTop:2,fontSize:11,fontWeight:"700",color:"#1C1C1E",textAlign:"center",
    backgroundColor:"#FFFFFFE6",borderRadius:6,paddingHorizontal:4,overflow:"hidden"},
  shindoMarker:{minWidth:32,height:32,borderRadius:16,borderWidth:2,borderColor:"#FFFFFF",
    justifyContent:"center",alignItems:"center",paddingHorizontal:4,
    shadowColor:"#000",shadowOpacity:0.3,shadowRadius:2,shadowOffset:{width:0,height:1}},
  shindoText:{fontSize:14,fontWeight:"900",textAlign:"center"},
  waveMarker:{height:28,borderRadius:14,borderWidth:2,borderColor:"#FFFFFF",
    justifyContent:"center",alignItems:"center",paddingHorizontal:8},
  waveText:{fontSize:13,fontWeight:"800"},
  controls:{position:"absolute",left:8,right:8,bottom:8,flexDirection:"row",
    alignItems:"flex-end",justifyContent:"space-between",gap:8},
  chip:{flexShrink:1,paddingHorizontal:10,paddingVertical:7,borderRadius:10},
  chipText:{fontSize:13,fontWeight:"600"},
  fitButton:{width:44,height:44,borderRadius:22,alignItems:"center",justifyContent:"center",
    shadowColor:"#000",shadowOpacity:0.2,shadowRadius:3,shadowOffset:{width:0,height:1}},
  legendLine:{width:16,height:4,borderRadius:2},
  gps:{position:"absolute",top:8,right:8,padding:9,borderRadius:8},
  note:{fontSize:12,fontWeight:"700"},
  legend:{position:"absolute",left:8,top:8,right:60,padding:7,borderRadius:8,gap:5},
  legendItems:{flexDirection:"row",gap:7,flexWrap:"wrap"},
  legendItem:{flexDirection:"row",alignItems:"center",gap:3},
  legendSwatch:{width:10,height:10,borderRadius:5},
  legendLabel:{fontSize:11,fontWeight:"700"}
});

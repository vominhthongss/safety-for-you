import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, AppState, Linking, Modal, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Localization from "expo-localization";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafetyMap from "./src/SafetyMap";
import { CATEGORIES, COLORS, CONFIG, SHELTER_LAYERS } from "./src/config";
import { LANGUAGE_NAMES, deviceLanguage, translate } from "./src/i18n";
import {
  getQuakeReports, getWeatherReports, getShelters,
  mergeReports, normalizeQuake, isVeryRecentUrgent
} from "./src/data";

SplashScreen.preventAutoHideAsync().catch(() => {});

const SMALL_TEXT = { color: COLORS.muted, fontSize: 13, lineHeight: 20 };
function TextLabel({ children, style, ...rest }) {
  return <Text {...rest} style={[{ fontSize: 16, lineHeight: 24, color: COLORS.ink }, style]}>{children}</Text>;
}
function Heading({ children }) {
  return <TextLabel accessibilityRole="header" style={{ fontWeight:"800", fontSize:22, lineHeight:30, marginBottom:12 }}>{children}</TextLabel>;
}
function Action({ label, onPress, subtle, disabled }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
    onPress={onPress} style={[styles.action, subtle && styles.subtle, disabled && { opacity:.5 }]}>
    <TextLabel style={{ color:subtle ? COLORS.teal : COLORS.white, fontSize:14, fontWeight:"800" }}>{label}</TextLabel>
  </Pressable>;
}
function Message({ text, warning=false }) {
  return <View style={[styles.message, warning && styles.warning]}><TextLabel style={{ fontSize:14, lineHeight:22 }}>{text}</TextLabel></View>;
}
function formatDate(time, locale) {
  if (!time) return "—";
  const parsed = new Date(String(time).replace(/^(\d{4})\/(\d\d)\/(\d\d) (\d\d:\d\d:\d\d)/, "$1-$2-$3T$4+09:00"));
  if (!Number.isFinite(parsed.getTime())) return String(time);
  try { return new Intl.DateTimeFormat(locale, { timeZone:"Asia/Tokyo", year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit" }).format(parsed); }
  catch { return parsed.toISOString(); }
}
function AppContent() {
  const detected = deviceLanguage(Localization.getLocales()?.[0]?.languageTag || "en");
  const [locale,setLocale] = useState(detected);
  const [languageOpen,setLanguageOpen] = useState(false);
  const [screen,setScreen] = useState("home");
  const [position,setPosition] = useState(null);
  const [place,setPlace] = useState("");
  const [permission,setPermission] = useState("checking");
  const [quake,setQuake] = useState([]);
  const [weather,setWeather] = useState([]);
  const [quakeState,setQuakeState] = useState("loading");
  const [weatherState,setWeatherState] = useState("loading");
  const [liveState,setLiveState] = useState("reconnecting");
  const [foreground,setForeground] = useState(true);
  const [lastUpdated,setLastUpdated] = useState(null);
  const [shelterHazard,setShelterHazard] = useState("earthquake");
  const [shelters,setShelters] = useState([]);
  const [shelterState,setShelterState] = useState("idle");
  const [selectedPoint,setSelectedPoint] = useState(null);
  const [friendlySplash,setFriendlySplash] = useState(CONFIG.splashMinMs > 0);
  const t = useMemo(() => translate(locale), [locale]);

  useEffect(() => {
    let live = true;
    AsyncStorage.getItem("sfy_language").then((saved) => {
      if (live && saved && LANGUAGE_NAMES[saved]) setLocale(saved);
    }).catch(() => {});
    // Never hold native splash waiting for permissions, geocoding, network or map tiles.
    SplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => { if (live) setFriendlySplash(false); }, CONFIG.splashMinMs);
    return () => { live=false; clearTimeout(timer); };
  }, []);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => setForeground(s === "active"));
    return () => sub.remove();
  }, []);

  const askLocation = useCallback(async () => {
    setPermission("checking");
    try {
      const permissionResult = await Location.requestForegroundPermissionsAsync();
      if (permissionResult.status !== "granted") { setPermission("denied"); return; }
      setPermission("granted");
      const previous = await Location.getLastKnownPositionAsync().catch(() => null);
      if (previous) setPosition(previous.coords);
      const next = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setPosition(next.coords);
      Location.reverseGeocodeAsync(next.coords).then((addresses) => {
        const address=addresses?.[0];
        setPlace([address?.city || address?.subregion, address?.region].filter(Boolean).join(", "));
      }).catch(() => {});
    } catch { setPermission("denied"); }
  }, []);
  useEffect(() => { askLocation(); }, [askLocation]);

  const refreshAll = useCallback(() => {
    setQuakeState("loading");
    getQuakeReports().then((list) => {
      setQuake((prev) => mergeReports(prev,list));
      setQuakeState("ready");
    }).catch(() => setQuakeState("error"));
    setWeatherState(CONFIG.jmaProxy ? "loading" : "unconfigured");
    if (CONFIG.jmaProxy) getWeatherReports().then((list) => {
      setWeather(list);
      setWeatherState("ready");
    }).catch(() => setWeatherState("error"));
    setLastUpdated(new Date());
  }, []);
  useEffect(() => {
    if (!foreground) return;
    refreshAll();
    const timer=setInterval(refreshAll,CONFIG.refreshMs);
    return () => clearInterval(timer);
  }, [refreshAll,foreground]);

  useEffect(() => {
    if (!foreground) { setLiveState("reconnecting"); return; }
    let ws, reconnectTimer, cancelled=false, retry=0;
    const connect = () => {
      if (cancelled) return;
      try {
        ws=new WebSocket(CONFIG.p2pWs);
        ws.onopen=()=> { retry=0; setLiveState("live"); };
        ws.onmessage=(message)=> {
          try {
            const item=normalizeQuake(JSON.parse(message.data));
            if (item) setQuake((prev)=>mergeReports(prev,[item]));
          } catch { /* malformed frames are safely ignored */ }
        };
        ws.onerror=()=>setLiveState("reconnecting");
        ws.onclose=()=> {
          if (!cancelled) {
            setLiveState("reconnecting");
            reconnectTimer=setTimeout(connect,Math.min(30000, 2000 * 2 ** Math.min(retry++,4)));
          }
        };
      } catch {
        reconnectTimer=setTimeout(connect,10000);
      }
    };
    connect();
    return ()=>{ cancelled=true;clearTimeout(reconnectTimer);ws?.close(); };
  }, [foreground]);

  useEffect(() => {
    setSelectedPoint(null);
    if (screen !== "shelter" || !position) return;
    let cancelled=false;
    setShelterState("loading");
    setShelters([]);
    getShelters(position,shelterHazard).then((items)=>{
      if (!cancelled) { setShelters(items);setShelterState("ready"); }
    }).catch(()=> { if(!cancelled) setShelterState("error"); });
    return ()=> { cancelled=true; };
  }, [position?.latitude,position?.longitude,screen,shelterHazard]);

  const reports = useMemo(() =>
    [...quake,...weather].sort((a,b)=>new Date(b.time)-new Date(a.time)), [quake,weather]);
  const latest = reports.slice(0,4);
  const category = CATEGORIES.find((c)=>c.id===screen);
  const detailReports = reports.filter((r)=>r.category===screen);
  const isQuakeCategory = ["earthquake","tsunami"].includes(screen);
  const currentState = isQuakeCategory ? quakeState : weatherState;
  const chooseLanguage = (lang) => {
    setLocale(lang);
    setLanguageOpen(false);
    AsyncStorage.setItem("sfy_language",lang).catch(()=>{});
  };
  const navigate = (id) => { setSelectedPoint(null);setScreen(id); };
  const openUrl = async (url) => {
    if (!/^https:\/\//.test(url || "")) return;
    try { await Linking.openURL(url); } catch { /* offline */ }
  };

  const renderCard = (report, inHome=false) => {
    const actionable = isVeryRecentUrgent(report);
    return <Pressable key={report.id} onPress={()=>navigate(report.category)}
      style={[styles.report,actionable && { borderColor:COLORS.alert }]}>
      <View style={styles.reportTop}>
        <TextLabel style={{ fontWeight:"800", fontSize:15, flex:1 }}>
          {CATEGORIES.find(c=>c.id===report.category)?.icon} {t(report.category)}
        </TextLabel>
        <TextLabel style={{ ...SMALL_TEXT,fontSize:12 }}>{formatDate(report.time,locale)}</TextLabel>
      </View>
      <TextLabel style={{ fontWeight:"700" }} numberOfLines={2}>{report.title}</TextLabel>
      <TextLabel style={SMALL_TEXT} numberOfLines={2}>{report.description}</TextLabel>
      <TextLabel style={{ ...SMALL_TEXT,fontSize:12,marginTop:3 }}>{t("sources")}: {report.source}</TextLabel>
      {actionable && <TextLabel style={{ color:COLORS.alert,fontWeight:"800",fontSize:13 }}>{t("active")}</TextLabel>}
      {!inHome && <View style={styles.rowButtons}>
        {report.coordinate && <Action label={t("openMap")} subtle onPress={()=>setSelectedPoint(report.coordinate)}/>}
        {report.url && <Action label={t("openOfficial")} subtle onPress={()=>openUrl(report.url)}/>}
      </View>}
    </Pressable>;
  };

  return (
    <SafeAreaView style={styles.root} edges={["top","bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg}/>
      {friendlySplash ? <View style={styles.boot}>
        <TextLabel style={{ fontSize:58 }}>🛟</TextLabel>
        <TextLabel style={{ fontSize:28,fontWeight:"900" }}>Safety For You</TextLabel>
      </View> :
      <>
        <View style={styles.header}>
          <Pressable onPress={()=>navigate("home")} accessibilityRole="button" accessibilityLabel={t("home")}>
            <TextLabel style={{ fontWeight:"900", fontSize:20 }}>🛟 Safety For You</TextLabel>
          </Pressable>
          <Pressable onPress={()=>setLanguageOpen(true)} style={styles.langButton} accessibilityRole="button" accessibilityLabel={t("language")}>
            <TextLabel style={{ fontWeight:"800",fontSize:13 }}>{LANGUAGE_NAMES[locale]} ▾</TextLabel>
          </Pressable>
        </View>
        <ScrollView key={screen} style={{ flex:1 }} contentContainerStyle={styles.body}>
          {screen !== "home" && <Pressable onPress={()=>navigate("home")} style={{ marginBottom:16 }} accessibilityRole="button">
            <TextLabel style={{ color:COLORS.teal,fontWeight:"800" }}>‹ {t("home")}</TextLabel>
          </Pressable>}
          {screen === "home" ? <>
            <View style={styles.intro}>
              <TextLabel style={{ ...SMALL_TEXT }}>{new Intl.DateTimeFormat(locale,{timeZone:"Asia/Tokyo",year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(new Date())}</TextLabel>
              <TextLabel style={{ fontSize:27,fontWeight:"900",marginTop:3 }}>👋 {t("today")}</TextLabel>
              <TextLabel style={{ ...SMALL_TEXT,marginTop:6 }}>📍 {place || (position ?
                position.latitude.toFixed(3) + ", " + position.longitude.toFixed(3) : t("locationDenied"))}</TextLabel>
              {!position && <Action label={t("allowLocation")} onPress={askLocation} />}
            </View>
            <Heading>{t("categories")}</Heading>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridScroller}>
              {Array.from({length:Math.ceil(CATEGORIES.length/2)},(_,col)=>
                <View key={col} style={{ gap:12 }}>
                  {CATEGORIES.slice(col*2,col*2+2).map((item)=>
                    <Pressable key={item.id} onPress={()=>navigate(item.id)} accessibilityRole="button"
                      accessibilityLabel={t(item.id)} style={[styles.category,{backgroundColor:item.color}]}>
                      <TextLabel style={{ fontSize:35,lineHeight:45 }}>{item.icon}</TextLabel>
                      <TextLabel style={{ textAlign:"center",fontWeight:"800",fontSize:15 }}>{t(item.id)}</TextLabel>
                    </Pressable>)}
                </View>)}
            </ScrollView>
            <View style={styles.sectionTop}>
              <Heading>{t("latest")}</Heading>
              <Pressable onPress={refreshAll} accessibilityRole="button"><TextLabel style={{color:COLORS.teal,fontWeight:"800"}}>↻ {t("refresh")}</TextLabel></Pressable>
            </View>
            <TextLabel style={{ ...SMALL_TEXT,marginBottom:10 }}>{t("recent")}</TextLabel>
            {latest.length ? latest.map((r)=>renderCard(r,true)) :
              <Message text={quakeState==="loading" ? t("loading") : t("unavailable")} warning={quakeState==="error"}/>}
            {latest.length > 0 && <Message text={t("noGuarantee")} />}
            <Message text={t("online")}/>
            <TextLabel style={{ ...SMALL_TEXT,marginTop:12,textAlign:"center" }}>
              {t("allSources")} · {liveState==="live" ? t("live") : t("reconnecting")}
            </TextLabel>
          </> : screen==="shelter" ? <>
            <View style={styles.pageTitle}><TextLabel style={styles.heroIcon}>🏠</TextLabel>
              <View style={{ flex:1 }}><Heading>{t("shelter")}</Heading><TextLabel style={SMALL_TEXT}>{t("chooseHazard")}</TextLabel></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8,marginBottom:14 }}>
              {Object.keys(SHELTER_LAYERS).map((hazard)=>
                <Pressable key={hazard} onPress={()=>setShelterHazard(hazard)}
                  accessibilityRole="button" style={[styles.chip,shelterHazard===hazard && styles.chipActive]}>
                  <TextLabel style={{fontSize:13,fontWeight:"800",color:shelterHazard===hazard?COLORS.white:COLORS.teal}}>{t(hazard)}</TextLabel>
                </Pressable>)}
            </ScrollView>
            {!position && <Message text={t("permission")} warning/>}
            <SafetyMap location={position} points={shelters} selectedPoint={selectedPoint} t={t} height={300}/>
            <Message text={"🎒 " + t("notes")}/>
            <Message text={t("notOpen")} warning/>
            {shelterState==="loading" && <ActivityIndicator color={COLORS.teal} style={{ margin:20 }}/>}
            {shelterState==="error" && <Message warning text={t("unavailable")}/>}
            {shelterState==="ready" && !shelters.length && <Message text={t("noPlace")}/>}
            {shelters.map((p)=><Pressable key={p.id} style={styles.report} onPress={()=>setSelectedPoint(p.coordinate)}
              accessibilityRole="button" accessibilityLabel={t("viewSite")+": "+p.name}>
              <TextLabel style={{fontWeight:"800"}}>📍 {p.name}</TextLabel>
              <TextLabel style={SMALL_TEXT}>{p.address}</TextLabel>
              <TextLabel style={{...SMALL_TEXT,color:COLORS.teal,fontWeight:"700"}}>{t("shelterType")}: {p.suitable.map(t).join(" · ")}</TextLabel>
              {!!p.remarks && <TextLabel style={SMALL_TEXT}>{p.remarks}</TextLabel>}
            </Pressable>)}
            <TextLabel style={{...SMALL_TEXT,marginTop:14}}>© Geospatial Information Authority of Japan (GSI)</TextLabel>
          </> : category ? <>
            <View style={styles.pageTitle}><TextLabel style={styles.heroIcon}>{category.icon}</TextLabel>
              <View style={{flex:1}}><Heading>{t(screen)}</Heading>
                <TextLabel style={SMALL_TEXT}>{t("recent")}</TextLabel>
              </View>
            </View>
            {screen==="tsunami" && <Message text={t("tsunamiMove")} warning/>}
            <SafetyMap t={t} location={position} points={detailReports} selectedPoint={selectedPoint} height={320}/>
            {!detailReports.some((r)=>r.coordinate) && <Message text={t("unknownPoint")}/>}
            <View style={[styles.sectionTop,{marginTop:18}]}>
              <Heading>{t("list")}</Heading>
              <Pressable onPress={refreshAll}><TextLabel style={{color:COLORS.teal,fontWeight:"800"}}>↻ {t("refresh")}</TextLabel></Pressable>
            </View>
            {currentState==="loading" && !detailReports.length && <ActivityIndicator style={{margin:12}} color={COLORS.teal}/>}
            {currentState==="unconfigured" && <Message warning text={t("notConfigured")}/>}
            {currentState==="error" && <Message warning text={t("unavailable")}/>}
            {currentState==="ready" && !detailReports.length && <Message text={t("empty")}/>}
            {detailReports.map((r)=>renderCard(r))}
            <Message text={t("noGuarantee")}/>
            {!isQuakeCategory && <Message text={t("jmaNote")}/>}
            <TextLabel style={{...SMALL_TEXT,marginTop:12}}>{t("refreshTime")}</TextLabel>
          </> : null}
          <TextLabel style={{...SMALL_TEXT,textAlign:"center",marginVertical:22}}>{t("about")}</TextLabel>
        </ScrollView>
      </>}
      <Modal visible={languageOpen} transparent animationType="slide" onRequestClose={()=>setLanguageOpen(false)}>
        <Pressable onPress={()=>setLanguageOpen(false)} style={styles.backdrop}>
          <View style={styles.languageSheet}>
            <Heading>{t("language")}</Heading>
            <ScrollView style={{maxHeight:420}}>
              {Object.entries(LANGUAGE_NAMES).map(([code,name])=><Pressable key={code} style={styles.languageItem}
                accessibilityRole="button" onPress={()=>chooseLanguage(code)}>
                <TextLabel style={{fontWeight:code===locale?"900":"500"}}>{name} {code===locale?"✓":""}</TextLabel>
              </Pressable>)}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
export default function App() { return <SafeAreaProvider><AppContent/></SafeAreaProvider>; }
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:COLORS.bg},body:{padding:18,paddingBottom:40},
  header:{paddingHorizontal:18,paddingVertical:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between",
    backgroundColor:COLORS.white,borderBottomWidth:1,borderColor:COLORS.border},
  langButton:{backgroundColor:COLORS.tealLight,paddingHorizontal:10,paddingVertical:9,borderRadius:12,maxWidth:"45%"},
  intro:{backgroundColor:COLORS.tealLight,borderRadius:22,padding:18,marginBottom:24,gap:2},
  gridScroller:{gap:12,paddingBottom:22,paddingRight:18},
  category:{width:140,height:120,borderRadius:22,padding:12,alignItems:"center",justifyContent:"center",gap:6},
  sectionTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},
  report:{backgroundColor:COLORS.white,borderRadius:16,padding:15,marginBottom:10,borderWidth:1,borderColor:COLORS.border,gap:5},
  reportTop:{flexDirection:"row",alignItems:"center",gap:8,justifyContent:"space-between"},
  message:{backgroundColor:COLORS.tealLight,borderRadius:14,padding:13,marginVertical:7},
  warning:{backgroundColor:COLORS.alertBg,borderWidth:1,borderColor:"#F4D3CE"},
  action:{backgroundColor:COLORS.teal,alignSelf:"flex-start",marginTop:9,borderRadius:12,paddingVertical:9,paddingHorizontal:14},
  subtle:{backgroundColor:COLORS.tealLight,marginTop:2},
  rowButtons:{flexDirection:"row",gap:8,flexWrap:"wrap",marginTop:4},
  pageTitle:{flexDirection:"row",alignItems:"center",gap:13,marginBottom:18},
  heroIcon:{fontSize:46,lineHeight:56},
  chip:{backgroundColor:COLORS.tealLight,borderRadius:30,paddingVertical:10,paddingHorizontal:14},
  chipActive:{backgroundColor:COLORS.teal},
  boot:{flex:1,alignItems:"center",justifyContent:"center",gap:16,backgroundColor:"#E8F5F4"},
  backdrop:{flex:1,justifyContent:"flex-end",backgroundColor:"#0007"},
  languageSheet:{backgroundColor:COLORS.white,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20},
  languageItem:{paddingVertical:13,borderBottomWidth:1,borderColor:COLORS.border}
});

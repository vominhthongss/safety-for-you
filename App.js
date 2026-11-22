import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, AppState, Linking, Modal, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, View, useWindowDimensions, useColorScheme
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Localization from "expo-localization";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafetyMap from "./src/SafetyMap";
import { SymbolView } from "expo-symbols";
import { showJapaneseWithRomaji, useJapaneseReadings } from "./src/romanization";
import { CATEGORIES, COLORS, CONFIG, SHELTER_LAYERS, CATEGORY_SYMBOLS } from "./src/config";
import { LANGUAGE_NAMES, deviceLanguage, translate } from "./src/i18n";
import {
  getQuakeReports, getWeatherReports, getShelters,
  mergeReports, normalizeQuake, isVeryRecentUrgent
} from "./src/data";

SplashScreen.preventAutoHideAsync().catch(() => {});

const SMALL_TEXT = { color: COLORS.muted, fontSize: 14, lineHeight: 20 };
function TextLabel({ children, style, ...rest }) {
  return <Text {...rest} style={[{ fontSize: 17, lineHeight: 24, color: COLORS.ink }, style]}>{children}</Text>;
}
function Heading({ children }) {
  return <TextLabel accessibilityRole="header" style={{ fontWeight:"700", fontSize:21, lineHeight:27, marginBottom:10 }}>{children}</TextLabel>;
}
function AppSymbol({ id, size = 24, color = COLORS.teal }) {
  return <SymbolView name={CATEGORY_SYMBOLS[id] || CATEGORY_SYMBOLS.shelter} size={size}
    tintColor={color} type="hierarchical"
    fallback={<TextLabel style={{ fontSize:size*0.85 }}>{CATEGORIES.find((item)=>item.id===id)?.icon || "●"}</TextLabel>} />;
}
function Action({ label, onPress, subtle, disabled }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
    onPress={onPress} style={[styles.action, subtle && styles.subtle, disabled && { opacity:.5 }]}>
    <TextLabel style={{ color:subtle ? COLORS.teal : COLORS.white, fontSize:15, fontWeight:"600" }}>{label}</TextLabel>
  </Pressable>;
}
function Message({ text, warning=false }) {
  return <View style={[styles.message, warning && styles.warning]}><TextLabel style={{ fontSize:15, lineHeight:22 }}>{text}</TextLabel></View>;
}
function formatDate(time, locale) {
  if (!time) return "—";
  const parsed = new Date(String(time).replace(/^(\d{4})\/(\d\d)\/(\d\d) (\d\d:\d\d:\d\d)/, "$1-$2-$3T$4+09:00"));
  if (!Number.isFinite(parsed.getTime())) return String(time);
  try { return new Intl.DateTimeFormat(locale === "ja" ? "en-US" : locale, { timeZone:"Asia/Tokyo", year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit" }).format(parsed); }
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
  const { width, fontScale } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const gridWidth = Math.min(Math.max(240, width - 36), 550);
  const columns = fontScale > 1.35 ? 3 : gridWidth >= 330 ? 5 : 4;
  const categoryWidth = (gridWidth - (columns - 1) * 8) / columns;
  const categoryHeight = (locale === "ja" ? 108 : 88) + (fontScale > 1.35 ? 25 : 0);

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
    [...quake,...weather].sort((a,b)=>Date.parse(String(b.time).replaceAll("/", "-"))-Date.parse(String(a.time).replaceAll("/", "-"))), [quake,weather]);
  const latest = reports.slice(0,4);
  const dynamicJapanese = useMemo(() => [
    place,
    ...reports.flatMap((item) => [item.title, item.description]),
    ...shelters.flatMap((item) => [item.name, item.address, item.remarks])
  ].filter(Boolean), [place, reports, shelters]);
  const readings = useJapaneseReadings(dynamicJapanese);
  const displayDynamic = (value) => showJapaneseWithRomaji(value, readings);
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
        <View style={{ flexDirection:"row",alignItems:"center",flex:1,gap:8 }}>
          <AppSymbol id={report.category} size={19}/>
          <TextLabel style={{ fontWeight:"600", fontSize:14, flexShrink:1 }}>{t(report.category)}</TextLabel>
        </View>
        <TextLabel style={{ ...SMALL_TEXT,fontSize:12,flexShrink:1,textAlign:"right" }}>{formatDate(report.time,locale)}</TextLabel>
      </View>
      <TextLabel style={{ fontWeight:"600" }}>{displayDynamic(report.title)}</TextLabel>
      {!!report.description && report.description !== report.title && <TextLabel style={SMALL_TEXT}>{displayDynamic(report.description)}</TextLabel>}
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
      <StatusBar barStyle={colorScheme==="dark" ? "light-content" : "dark-content"} backgroundColor={COLORS.bg}/>
      {friendlySplash ? <View style={styles.boot}>
        <TextLabel style={{ fontSize:58 }}>🛟</TextLabel>
        <TextLabel style={{ fontSize:28,fontWeight:"900" }}>Safety For You</TextLabel>
      </View> :
      <>
        <View style={styles.header}>
          {screen === "home" ?
            <TextLabel style={styles.brand} accessibilityRole="header">Safety For You</TextLabel> :
            <Pressable onPress={()=>navigate("home")} style={styles.backButton}
              accessibilityRole="button" accessibilityLabel={t("home")}>
              <AppSymbol id="back" size={18}/>
              <TextLabel style={{ color:COLORS.teal,fontSize:16 }}>{t("home")}</TextLabel>
            </Pressable>}
          <Pressable onPress={()=>setLanguageOpen(true)} style={styles.langButton}
            accessibilityRole="button" accessibilityLabel={t("language")}>
            <AppSymbol id="language" size={18}/>
            <TextLabel style={{ color:COLORS.teal,fontWeight:"600",fontSize:13,flexShrink:1 }}>{LANGUAGE_NAMES[locale]}</TextLabel>
          </Pressable>
        </View>
        <ScrollView key={screen} style={{ flex:1 }} contentContainerStyle={styles.body}>
          {screen === "home" ? <>
            <View style={styles.intro}>
              <TextLabel style={styles.date} accessibilityRole="header">
                {new Intl.DateTimeFormat(locale === "ja" ? "en-US" : locale,
                  {timeZone:"Asia/Tokyo",year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(new Date())}
              </TextLabel>
              <View style={styles.locationRow}>
                <AppSymbol id="pin" size={17} color={COLORS.muted}/>
                <TextLabel style={SMALL_TEXT}>{place ? displayDynamic(place) : (position ?
                  position.latitude.toFixed(3) + ", " + position.longitude.toFixed(3) : t("locationDenied"))}</TextLabel>
              </View>
              {!position && <Action label={t("allowLocation")} onPress={askLocation} subtle />}
            </View>
            <Heading>{t("categories")}</Heading>
            <View style={[styles.categoryGrid,{ width:gridWidth }]}>
              {CATEGORIES.map((item)=>
                <Pressable key={item.id} onPress={()=>navigate(item.id)} accessibilityRole="button"
                  accessibilityLabel={t(item.id)} style={[styles.category,{ width:categoryWidth,minHeight:categoryHeight }]}>
                  <AppSymbol id={item.id} size={26}/>
                  <TextLabel style={styles.categoryLabel}>{t(item.id)}</TextLabel>
                </Pressable>)}
            </View>
            <View style={styles.sectionTop}>
              <Heading>{t("latest")}</Heading>
              <Pressable onPress={refreshAll} accessibilityRole="button" accessibilityLabel={t("refresh")} style={styles.refresh}>
                <AppSymbol id="refresh" size={17}/>
                <TextLabel style={{color:COLORS.teal,fontWeight:"600",fontSize:15}}>{t("refresh")}</TextLabel>
              </Pressable>
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
            <View style={styles.pageTitle}><AppSymbol id="shelter" size={32}/>
              <View style={{ flex:1 }}><Heading>{t("shelter")}</Heading><TextLabel style={SMALL_TEXT}>{t("chooseHazard")}</TextLabel></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8,marginBottom:14 }}>
              {Object.keys(SHELTER_LAYERS).map((hazard)=>
                <Pressable key={hazard} onPress={()=>setShelterHazard(hazard)}
                  accessibilityRole="button" accessibilityState={{selected:shelterHazard===hazard}} style={[styles.chip,shelterHazard===hazard && styles.chipActive]}>
                  <TextLabel style={{fontSize:13,fontWeight:"800",color:shelterHazard===hazard?COLORS.white:COLORS.teal}}>{t(hazard)}</TextLabel>
                </Pressable>)}
            </ScrollView>
            {!position && <Message text={t("permission")} warning/>}
            <SafetyMap location={position} points={shelters.map((item)=>({...item,name:displayDynamic(item.name)}))} selectedPoint={selectedPoint} t={t} height={300}/>
            <Message text={"🎒 " + t("notes")}/>
            <Message text={t("notOpen")} warning/>
            {shelterState==="loading" && <ActivityIndicator color={COLORS.teal} style={{ margin:20 }}/>}
            {shelterState==="error" && <Message warning text={t("unavailable")}/>}
            {shelterState==="ready" && !shelters.length && <Message text={t("noPlace")}/>}
            {shelters.map((p)=><Pressable key={p.id} style={styles.report} onPress={()=>setSelectedPoint(p.coordinate)}
              accessibilityRole="button" accessibilityLabel={t("viewSite")+": "+p.name}>
              <TextLabel style={{fontWeight:"600"}}>{displayDynamic(p.name)}</TextLabel>
              <TextLabel style={SMALL_TEXT}>{displayDynamic(p.address)}</TextLabel>
              <TextLabel style={{...SMALL_TEXT,color:COLORS.teal,fontWeight:"700"}}>{t("shelterType")}: {p.suitable.map(t).join(" · ")}</TextLabel>
              {!!p.remarks && <TextLabel style={SMALL_TEXT}>{displayDynamic(p.remarks)}</TextLabel>}
            </Pressable>)}
            <TextLabel style={{...SMALL_TEXT,marginTop:14}}>© Geospatial Information Authority of Japan (GSI)</TextLabel>
          </> : category ? <>
            <View style={styles.pageTitle}><AppSymbol id={category.id} size={32}/>
              <View style={{flex:1}}><Heading>{t(screen)}</Heading>
                <TextLabel style={SMALL_TEXT}>{t("recent")}</TextLabel>
              </View>
            </View>
            {screen==="tsunami" && <Message text={t("tsunamiMove")} warning/>}
            <SafetyMap t={t} location={position} points={detailReports.map((item)=>({...item,title:displayDynamic(item.title)}))} selectedPoint={selectedPoint} height={320}/>
            {!detailReports.some((r)=>r.coordinate) && <Message text={t("unknownPoint")}/>}
            <View style={[styles.sectionTop,{marginTop:18}]}>
              <Heading>{t("list")}</Heading>
              <Pressable onPress={refreshAll} accessibilityRole="button" accessibilityLabel={t("refresh")} style={styles.refresh}>
                <AppSymbol id="refresh" size={17}/>
                <TextLabel style={{color:COLORS.teal,fontWeight:"600",fontSize:15}}>{t("refresh")}</TextLabel>
              </Pressable>
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
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={()=>setLanguageOpen(false)}
            accessibilityRole="button" accessibilityLabel="Close language selection"/>
          <View style={styles.languageSheet}>
            <View style={styles.sheetHeader}>
              <Heading>{t("language")}</Heading>
              <Pressable onPress={()=>setLanguageOpen(false)} accessibilityRole="button"
                accessibilityLabel="Close language selection" style={styles.sheetClose}>
                <TextLabel style={{color:COLORS.teal,fontWeight:"600"}}>✕</TextLabel>
              </Pressable>
            </View>
            <ScrollView style={{maxHeight:420}}>
              {Object.entries(LANGUAGE_NAMES).map(([code,name])=><Pressable key={code} style={styles.languageItem}
                accessibilityRole="button" accessibilityState={{selected:code===locale}}
                onPress={()=>chooseLanguage(code)}>
                <TextLabel style={{fontWeight:code===locale?"700":"400"}}>{name} {code===locale?"✓":""}</TextLabel>
              </Pressable>)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
export default function App() { return <SafeAreaProvider><AppContent/></SafeAreaProvider>; }
// Apple HIG-inspired hierarchy: native symbols, dynamic system colors, dynamic
// type and >=44pt touch targets. Grouped lists preserve content readability.
const styles=StyleSheet.create({
  root:{ flex:1, backgroundColor:COLORS.bg },
  body:{ paddingHorizontal:18, paddingTop:18, paddingBottom:36, alignItems:"stretch" },
  header:{ minHeight:56, paddingHorizontal:18, paddingVertical:6, flexDirection:"row",
    alignItems:"center",justifyContent:"space-between",backgroundColor:COLORS.white,
    borderBottomWidth:StyleSheet.hairlineWidth,borderColor:COLORS.border,gap:12 },
  brand:{ fontSize:18,fontWeight:"700",flexShrink:1 },
  backButton:{ minHeight:44,minWidth:60,flexDirection:"row",alignItems:"center",gap:5 },
  langButton:{ minHeight:44,flexDirection:"row",alignItems:"center",gap:7,justifyContent:"flex-end",maxWidth:"54%" },
  intro:{ paddingVertical:5,marginBottom:19,gap:6 },
  date:{ fontSize:26,lineHeight:33,fontWeight:"700",letterSpacing:-0.4 },
  locationRow:{ flexDirection:"row",gap:6,alignItems:"center",flexWrap:"wrap" },
  categoryGrid:{ flexDirection:"row", flexWrap:"wrap",columnGap:8,rowGap:8,alignSelf:"center",marginBottom:16 },
  category:{ borderRadius:12,paddingHorizontal:3,paddingVertical:9,backgroundColor:COLORS.white,
    justifyContent:"center",alignItems:"center",gap:5,
    borderWidth:StyleSheet.hairlineWidth,borderColor:COLORS.border },
  categoryLabel:{ fontSize:11.5,lineHeight:15,textAlign:"center",fontWeight:"600",maxWidth:"100%" },
  sectionTop:{ flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:2 },
  refresh:{ minHeight:44,minWidth:44,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:5 },
  report:{ backgroundColor:COLORS.white,borderRadius:12,padding:14,marginBottom:9,
    borderWidth:StyleSheet.hairlineWidth,borderColor:COLORS.border,gap:6 },
  reportTop:{ flexDirection:"row",alignItems:"center",gap:8,justifyContent:"space-between",marginBottom:3 },
  message:{ backgroundColor:COLORS.white,borderRadius:12,padding:14,marginVertical:6,
    borderWidth:StyleSheet.hairlineWidth,borderColor:COLORS.border },
  warning:{ borderLeftWidth:3,borderLeftColor:COLORS.alert },
  action:{ backgroundColor:COLORS.teal,alignSelf:"flex-start",minHeight:44,marginTop:8,
    borderRadius:11,paddingVertical:10,paddingHorizontal:15,justifyContent:"center" },
  subtle:{ backgroundColor:COLORS.tealLight },
  rowButtons:{ flexDirection:"row",gap:8,flexWrap:"wrap",marginTop:5 },
  pageTitle:{ flexDirection:"row",alignItems:"center",gap:14,marginBottom:16 },
  chip:{ backgroundColor:COLORS.white,borderRadius:20,paddingVertical:11,paddingHorizontal:15,minHeight:44,
    borderWidth:StyleSheet.hairlineWidth,borderColor:COLORS.border },
  chipActive:{ backgroundColor:COLORS.teal },
  boot:{ flex:1,alignItems:"center",justifyContent:"center",gap:16,backgroundColor:COLORS.bg },
  backdrop:{ flex:1,justifyContent:"flex-end",backgroundColor:"#0007" },
  languageSheet:{ backgroundColor:COLORS.white,borderTopLeftRadius:18,borderTopRightRadius:18,
    paddingHorizontal:20,paddingTop:14,paddingBottom:25 },
  sheetHeader:{ flexDirection:"row",alignItems:"center",justifyContent:"space-between" },
  sheetClose:{ minWidth:44,minHeight:44,justifyContent:"center",alignItems:"center" },
  languageItem:{ minHeight:50,paddingVertical:12,justifyContent:"center",
    borderBottomWidth:StyleSheet.hairlineWidth,borderColor:COLORS.border }
});

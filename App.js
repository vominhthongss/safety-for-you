import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, AppState, Linking, Modal, Platform, Pressable, RefreshControl, ScrollView,
  StatusBar, StyleSheet, Switch, Text, View, useColorScheme, Appearance
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DarkTheme, DefaultTheme, NavigationContainer, StackActions, createNavigationContainerRef
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import * as Localization from "expo-localization";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SymbolView } from "expo-symbols";
import SafetyMap from "./src/SafetyMap";
import { loadAlertZones, loadHazardZones } from "./src/hazardGeo";
import { getColors, navigationColors, TYPE } from "./src/theme";
import { SafetySteps, ShindoGuide } from "./src/SafetyGuide";
import { Bilingual, Icon, Notice, Row, Section, SectionFooter, ThemeContext, systemColor } from "./src/ui";
import {
  getAlarmPermission, presentAlarm, requestAlarmPermission,
  startAlarmVibration, stopAlarmVibration
} from "./src/alarmNotify";
import { showJapaneseWithRomaji, useJapaneseReadings } from "./src/romanization";
import { CATEGORIES, CATEGORY_SYMBOLS, CATEGORY_TINTS, CONFIG, SHELTER_LAYERS } from "./src/config";
import { LANGUAGE_NAMES, deviceLanguage, translate, translatePlain } from "./src/i18n";
import {
  getQuakeReports, getWeatherReports, getShelters,
  mergeReports, normalizeQuake, isVeryRecentUrgent
} from "./src/data";
const {reportMetrics,heightText} = require("./src/hazardView.cjs");
const {getReportSeverity,getAreaSeverity} = require("./src/hazardSeverity.cjs");
const {formatReportDate} = require("./src/dateTime.cjs");
const {alertCandidate,evaluateUserImpact} = require("./src/userAlert.cjs");
const fill = (text, values) => String(text).replace(/\{(\w+)\}/g,
  (match,key) => values[key] == null ? match : String(values[key]));
// "震度\nShindo" + "5+" -> "震度: 5+\nShindo: 5+" so both lines carry the value.
const withValue = (label, value) => String(label).split("\n").map((line) => line+": "+value).join("\n");
const firstLine = (text) => String(text ?? "").split("\n")[0];

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
const AppContext = React.createContext(null);
// Stable screen components; content comes from AppContent through context so
// screens re-render with app state without being re-created.
function HomeScreen() { return React.useContext(AppContext).renderHome(); }
function HazardScreen({ route }) { return React.useContext(AppContext).renderHazard(route.params?.id); }
function ShelterScreen() { return React.useContext(AppContext).renderShelter(); }

function formatDate(time, locale) {
  return formatReportDate(time,locale,translatePlain(locale,"today"));
}
function currentScreenId() {
  const route = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
  if (route?.name === "Hazard") return route.params?.id || "home";
  if (route?.name === "Shelter") return "shelter";
  return "home";
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
  const [selectedReportId,setSelectedReportId] = useState(null);
  const [hazardZones,setHazardZones] = useState([]);
  const [hazardZoneState,setHazardZoneState] = useState("idle");
  const scrollRefs = useRef({});
  const [alarm,setAlarm] = useState(null);
  const [alarmSound,setAlarmSound] = useState(false);
  const [alarmPermission,setAlarmPermission] = useState("undetermined");
  const alertedIds = useRef(new Set());
  const checkedIds = useRef(new Set());
  const alarmRef = useRef(null);
  const [friendlySplash,setFriendlySplash] = useState(CONFIG.splashMinMs > 0);
  const t = useMemo(() => translate(locale), [locale]);
  const plain = useCallback((key) => translatePlain(locale,key), [locale]);
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const [themeOverride,setThemeOverride] = useState(null);
  const effectiveScheme = themeOverride || systemScheme || "light";
  const dark = effectiveScheme === "dark";
  const COLORS = useMemo(() => getColors(dark), [dark]);
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const themeContext = useMemo(() => ({ colors:COLORS, styles }), [COLORS,styles]);
  const navTheme = useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {...base,dark,colors:{...base.colors,...navigationColors(dark)}};
  }, [dark]);

  useEffect(() => {
    let live = true;
    AsyncStorage.getItem("sfy_language").then((saved) => {
      if (live && saved && LANGUAGE_NAMES[saved]) setLocale(saved);
    }).catch(() => {});
    AsyncStorage.getItem("sfy_alerted_ids").then((saved) => {
      const ids = JSON.parse(saved || "[]");
      if (live && Array.isArray(ids)) ids.forEach((id) => alertedIds.current.add(String(id)));
    }).catch(() => {});
    AsyncStorage.getItem("sfy_alarm_sound").then(async (saved) => {
      if (!live || saved !== "on") return;
      const status = await getAlarmPermission();
      if (!live) return;
      setAlarmPermission(status);
      setAlarmSound(status === "granted");
    }).catch(() => {});
    AsyncStorage.getItem("sfy_color_scheme").then((saved) => {
      if (!live || (saved !== "light" && saved !== "dark")) return;
      setThemeOverride(saved);
      Appearance.setColorScheme(saved);
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
  // Keep the blue location marker current only while the app is foregrounded.
  useEffect(() => {
    if (permission !== "granted" || !foreground) return;
    let active=true, subscription=null;
    Location.watchPositionAsync({accuracy:Location.Accuracy.Balanced,
      distanceInterval:50,timeInterval:15000},(next)=>{
      if(active) setPosition(next.coords);
    }).then((watch)=>{if(active)subscription=watch;else watch.remove();})
      .catch(()=>{});
    return ()=>{active=false;subscription?.remove();};
  },[permission,foreground]);

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
    ...reports.flatMap((item) => [item.title, item.description,
      ...(item.tsunamiAreas || []).map((area)=>area.name),
      ...(item.shakingAreas || []).map((area)=>area.name)]),
    ...shelters.flatMap((item) => [item.name, item.address, item.remarks])
  ].filter(Boolean), [place, reports, shelters]);
  const readings = useJapaneseReadings(dynamicJapanese);
  const displayDynamic = (value) => showJapaneseWithRomaji(value, readings);
  const detailReports = reports.filter((r)=>r.category===screen);
  const selectedReport = selectedReportId ?
    detailReports.find((report) => report.id === selectedReportId) : null;

  useEffect(() => {
    let active=true;
    setHazardZones([]);
    if (!selectedReport) {
      setHazardZoneState("idle");
      return () => {active=false;};
    }
    if (!["earthquake","tsunami"].includes(selectedReport.category) ||
      selectedReport.cancelled) {
      setHazardZoneState("unavailable");
      return () => {active=false;};
    }
    setHazardZoneState("loading");
    loadHazardZones(selectedReport,displayDynamic,t).then((features)=>{
      if (!active) return;
      setHazardZones(features);
      setHazardZoneState(features.length ? "ready" : "unavailable");
    }).catch(()=>{
      if (active) setHazardZoneState("error");
    });
    return () => {active=false;};
  }, [selectedReportId, selectedReport?.time, readings,screen]);
  // Alarm when a fresh, source-verified bulletin covers the user's position.
  // Runs only in the foreground with consented location; see src/userAlert.cjs.
  const triggerAlarm = useCallback((report, impact) => {
    if (alertedIds.current.has(report.id)) return;
    alertedIds.current.add(report.id);
    AsyncStorage.setItem("sfy_alerted_ids",
      JSON.stringify([...alertedIds.current].slice(-200))).catch(()=>{});
    // A weaker notice never replaces (or silences) an alarm already on screen.
    if (alarmRef.current?.impact.level === "alarm" && impact.level !== "alarm") return;
    alarmRef.current = {report, impact};
    setAlarm(alarmRef.current);
    startAlarmVibration(impact.level === "alarm");
    if (alarmSound) {
      const plain = (key) => translatePlain(locale,key);
      presentAlarm({title:plain(alarmTitleKey(report,impact)),
        body:fill(plain(alarmReasonKey(impact)),impact)+" "+report.title});
    }
  }, [alarmSound,locale]);
  useEffect(() => {
    if (!position) return;
    const user = {latitude:position.latitude,longitude:position.longitude};
    for (const report of reports.slice(0,30)) {
      if (alertedIds.current.has(report.id) || checkedIds.current.has(report.id)) continue;
      if (!alertCandidate(report)) continue;
      checkedIds.current.add(report.id);
      loadAlertZones(report).catch(() => []).then((zones) => {
        const impact = evaluateUserImpact(report,user,zones);
        if (impact) triggerAlarm(report,impact);
      });
    }
  }, [reports,position?.latitude,position?.longitude,triggerAlarm]);
  const dismissAlarm = () => { stopAlarmVibration(); alarmRef.current = null; setAlarm(null); };
  const toggleAlarmSound = async (next) => {
    if (!next) {
      setAlarmSound(false);
      AsyncStorage.setItem("sfy_alarm_sound","off").catch(()=>{});
      return;
    }
    const status = await requestAlarmPermission();
    setAlarmPermission(status);
    setAlarmSound(status === "granted");
    AsyncStorage.setItem("sfy_alarm_sound",status === "granted" ? "on" : "off").catch(()=>{});
  };
  const isQuakeCategory = ["earthquake","tsunami"].includes(screen);
  const currentState = isQuakeCategory ? quakeState : weatherState;
  const openLanguagePicker = () => setLanguageOpen(true);
  const chooseLanguage = (lang) => {
    setLocale(lang);
    setLanguageOpen(false);
    AsyncStorage.setItem("sfy_language",lang).catch(()=>{});
  };
  const toggleTheme = () => {
    const next = effectiveScheme === "dark" ? "light" : "dark";
    setThemeOverride(next);
    Appearance.setColorScheme(next);
    AsyncStorage.setItem("sfy_color_scheme",next).catch(()=>{});
  };
  // Native stack navigation (UINavigationController on iOS).
  const navigate = (id) => {
    setSelectedPoint(null);
    setSelectedReportId(null);
    if (!navigationRef.isReady()) return;
    if (id === "home") navigationRef.dispatch(StackActions.popToTop());
    else if (id === "shelter") navigationRef.navigate("Shelter");
    else navigationRef.navigate("Hazard",{id});
  };
  const selectReport = (report) => {
    setSelectedReportId(report.id);
    setSelectedPoint(report.coordinate || null);
    if (screen === report.category) {
      scrollRefs.current[report.category]?.scrollTo({y:0,animated:true});
    } else if (navigationRef.isReady()) {
      navigationRef.navigate("Hazard",{id:report.category});
    }
  };
  const openUrl = async (url) => {
    if (!/^https:\/\//.test(url || "")) return;
    try { await Linking.openURL(url); } catch { /* offline */ }
  };

  // Inline form for one-line places (titles, labels): "地震 (Jishin)".
  const inline = (text) => {
    const [main, ...rest] = String(text ?? "").split("\n");
    return rest.length ? main + " (" + rest.join(" ") + ")" : main;
  };
  const severityText = (report) => {
    const severity = getReportSeverity(report);
    return severity.source === "observedShindo" ? withValue(t("intensity"),severity.label) :
      severity.source === "predictedShindo" ? withValue(t("predictedIntensity"),severity.label) :
      severity.source === "issuedTsunami" || severity.source === "verifiedJmaGrade" ? t(severity.label) :
      severity.source === "cancelled" ? t("cancelled") : null;
  };
  const [pulling,setPulling] = useState(false);
  useEffect(() => { if (quakeState !== "loading") setPulling(false); }, [quakeState]);
  const pullToRefresh = () => { setPulling(true); refreshAll(); };
  const refreshControl = <RefreshControl refreshing={pulling} onRefresh={pullToRefresh}/>;
  const refreshAction = { label:inline(t("refresh")), onPress:refreshAll };
  const counts = useMemo(() => reports.reduce((acc,r) => {
    acc[r.category] = (acc[r.category] || 0) + 1; return acc;
  }, {}), [reports]);
  const scrollProps = {
    contentInsetAdjustmentBehavior:"automatic", style:styles.screen,
    contentContainerStyle:[styles.body,{ paddingBottom:insets.bottom + 32 }]
  };
  const Caption = ({ text }) => <View style={styles.caption}>
    <Bilingual text={text} style={[TYPE.subhead,{ color:COLORS.muted }]}/>
  </View>;

  // One report = one list row; the selected report expands in place and is
  // followed by plain action rows (no nested buttons inside the row).
  const renderReport = (report, compact=false) => {
    const actionable = isVeryRecentUrgent(report);
    const severity = getReportSeverity(report);
    const severityLabel = severityText(report);
    const expanded = !compact && selectedReportId === report.id;
    const metrics = expanded ? reportMetrics(report,t) : [];
    const tsunamiAreas = (report.tsunamiAreas || []).slice(0, expanded ? 30 : compact ? 1 : 3);
    const remaining = Math.max(0,(report.tsunamiAreas?.length || 0)-tsunamiAreas.length);
    const rows = [
      <Row key={report.id} icon={CATEGORY_SYMBOLS[report.category]}
        iconColor={systemColor(CATEGORY_TINTS[report.category] || "systemGray")}
        chevron={compact} onPress={()=>selectReport(report)}
        accessibilityLabel={inline(t(report.category))+": "+report.title}
        accessibilityState={{ expanded }}>
        <Bilingual text={displayDynamic(report.title)} style={TYPE.headline}/>
        {!!severityLabel && <View style={styles.severityRow}>
          <View style={[styles.severityDot,{ backgroundColor:severity.color }]}/>
          <View style={{ flex:1 }}><Bilingual text={severityLabel} style={TYPE.subhead}/></View>
        </View>}
        <Text style={[TYPE.footnote,{ color:COLORS.muted }]}>
          {inline(t(report.category))} · {formatDate(report.time,locale)}
        </Text>
        {expanded && !!report.description && report.description !== report.title &&
          <Bilingual text={displayDynamic(report.description)} style={[TYPE.subhead,{ color:COLORS.muted }]}/>}
        {metrics.length > 0 && <View style={styles.metricRow}>
          {metrics.map((metric)=>(
            <View key={metric.key} style={styles.metricCell}>
              <Bilingual text={metric.label} style={[TYPE.caption1,{ color:COLORS.muted }]}/>
              <Text style={styles.metricValue}>{metric.value}</Text>
              {!!metric.area && <Bilingual text={displayDynamic(metric.area)} style={[TYPE.caption1,{ color:COLORS.muted }]}/>}
            </View>
          ))}
        </View>}
        {report.category === "tsunami" && tsunamiAreas.map((area,index)=>(
          <View key={area.name+"-"+index} style={styles.tsunamiArea}>
            <View style={styles.severityRow}>
              <View style={[styles.severityDot,{ backgroundColor:getAreaSeverity("tsunami",area).color }]}/>
              <View style={{ flex:1 }}><Bilingual text={displayDynamic(area.name)} style={TYPE.subhead}/></View>
            </View>
            <Text style={[TYPE.footnote,{ color:COLORS.muted }]}>{inline(t("status"))}: {inline(t(area.grade))}</Text>
            {!report.cancelled && <Text style={[TYPE.footnote,{ color:COLORS.muted }]}>
              {inline(t("forecastHeight"))}: {heightText(area.forecastHeight,t) ? inline(heightText(area.forecastHeight,t)) : inline(t("notPublished"))}
            </Text>}
            {expanded && !!area.arrivalTime && <Text style={[TYPE.footnote,{ color:COLORS.muted }]}>
              {inline(t("estimatedArrival"))}: <Text style={styles.timestamp}>{formatDate(area.arrivalTime,locale)}</Text>
            </Text>}
            {expanded && !!area.arrivalCondition && <Bilingual text={displayDynamic(area.arrivalCondition)} style={TYPE.footnote}/>}
          </View>
        ))}
        {remaining > 0 && <Text style={[TYPE.footnote,{ color:COLORS.muted }]}>{inline(t("moreRegions"))}: {remaining}</Text>}
        {expanded && <Text style={[TYPE.footnote,{ color:COLORS.muted }]}>
          {inline(t("sources"))}: {report.source} · {inline(t("issuedAt"))}: <Text style={styles.timestamp}>{formatDate(report.issuedAt || report.time,locale)}</Text>
        </Text>}
        {expanded && report.category === "tsunami" && <Bilingual text={t("asIssued")} style={[TYPE.footnote,{ color:COLORS.muted }]}/>}
        {actionable && <Bilingual text={t("active")} style={[TYPE.footnote,{ color:COLORS.alert,fontWeight:"600" }]}/>}
      </Row>
    ];
    if (expanded && report.url) rows.push(<Row key={report.id+"-official"} title={t("openOfficial")}
      titleColor={COLORS.teal} onPress={()=>openUrl(report.url)}
      accessory={<Icon name={{ ios:"arrow.up.right.square", android:"open_in_new", web:"open_in_new" }} size={17}/>}/>);
    return rows;
  };

  const renderHome = () => <ScrollView {...scrollProps} refreshControl={refreshControl}>
    <View style={styles.caption}>
      <Text style={[TYPE.subhead,{ color:COLORS.muted }]}>
        {new Intl.DateTimeFormat(locale === "ja" ? "en-US" : locale,
          {timeZone:"Asia/Tokyo",year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(new Date())}
      </Text>
    </View>
    <Section footer={!position ? t("permissionInfo") : null}>
      <Row icon={CATEGORY_SYMBOLS.pin} iconColor={systemColor("systemBlue")}
        title={place ? displayDynamic(place) : (position ?
          position.latitude.toFixed(3) + ", " + position.longitude.toFixed(3) : t("locationDenied"))}
        subtitle={inline(t("location"))}/>
      {!position && <Row title={t("allowLocation")} titleColor={COLORS.teal} onPress={askLocation}/>}
    </Section>
    <Section footer={[t("alarmToggleInfo"), alarmPermission === "denied" && t("alarmDenied"), t("alarmLimit")]}>
      <Row icon={CATEGORY_SYMBOLS.bell} iconColor={systemColor("systemRed")} title={t("alarmToggle")}
        accessory={<Switch value={alarmSound} onValueChange={toggleAlarmSound}
          accessibilityLabel={inline(t("alarmToggle"))} accessibilityHint={inline(t("alarmToggleInfo"))}/>}/>
    </Section>
    <Section header={t("categories")}>
      {CATEGORIES.map((item)=>
        <Row key={item.id} icon={CATEGORY_SYMBOLS[item.id]}
          iconColor={systemColor(CATEGORY_TINTS[item.id] || "systemGray")}
          title={t(item.id)} detail={item.id !== "shelter" && counts[item.id] ? String(counts[item.id]) : null}
          chevron onPress={()=>navigate(item.id)} accessibilityLabel={inline(t(item.id))}/>)}
    </Section>
    <Section header={t("latest")} headerAction={refreshAction}
      footer={[t("recent"), latest.length > 0 && t("noGuarantee"), t("online"),
        inline(t("allSources"))+" · "+inline(t(liveState === "live" ? "live" : "reconnecting"))]}>
      {latest.length ? latest.map((r)=>renderReport(r,true)) :
        quakeState === "error" ? <Notice key="err" text={t("unavailable")}/> :
        <Row key="loading" title={quakeState === "loading" ? t("loading") : t("unavailable")}/>}
    </Section>
    <Bilingual text={t("about")} style={styles.about} secondaryStyle={styles.aboutSecondary}/>
  </ScrollView>;

  const renderHazard = (id) => {
    const items = reports.filter((r)=>r.category===id);
    const isQuake = ["earthquake","tsunami"].includes(id);
    const state = isQuake ? quakeState : weatherState;
    const focused = screen === id;
    const selectedReport = focused && selectedReportId ? items.find((r)=>r.id===selectedReportId) : null;
    return <ScrollView ref={(el)=>{ scrollRefs.current[id]=el; }} {...scrollProps} refreshControl={refreshControl}>
      <Caption text={t("recent")}/>
      {id === "tsunami" && <Section><Notice tone="critical" text={t("tsunamiMove")}/></Section>}
      <View style={styles.mapWrap}>
        <SafetyMap t={t} location={position}
          points={(selectedReport ? [selectedReport] : items).map((item)=>({...item,
            title:[displayDynamic(item.title),severityText(item)].filter(Boolean).join("\n"),
            color:getReportSeverity(item).color}))}
          selectedPoint={selectedReport ? selectedReport.coordinate : null}
          zones={focused ? hazardZones : []} kind={id}
          selectedColor={getReportSeverity(selectedReport).color}
          selectedLabel={["observedShindo","predictedShindo"].includes(getReportSeverity(selectedReport).source) ?
            getReportSeverity(selectedReport).label : null}
          height={340} dark={dark}/>
        <SectionFooter>
          {selectedReport && isQuake && hazardZoneState==="loading" && t("zoneLoading")}
          {selectedReport && isQuake && hazardZoneState==="error" && t("zoneError")}
          {selectedReport && isQuake && hazardZoneState==="unavailable" && t("zoneNoData")}
          {focused && !!hazardZones.length && t("zoneNote")}
          {selectedReport && !selectedReport.coordinate && t("unknownPoint")}
        </SectionFooter>
      </View>
      <Section header={t("list")} headerAction={refreshAction}
        footer={[t("noGuarantee"), !isQuake && t("jmaNote"), t("refreshTime")]}>
        {state==="loading" && !items.length && <Row key="spin"><ActivityIndicator color={COLORS.teal}/></Row>}
        {state==="unconfigured" && <Notice key="cfg" text={t("notConfigured")}/>}
        {state==="error" && <Notice key="err" text={t("unavailable")}/>}
        {state==="ready" && !items.length && <Row key="empty" title={t("empty")}/>}
        {items.map((r)=>renderReport(r))}
      </Section>
      <SafetySteps hazard={id} locale={locale} t={t} colors={COLORS}/>
      {id==="earthquake" && <ShindoGuide locale={locale} t={t} colors={COLORS}
        highlight={selectedReport?.shindoCode ?? null}/>}
      <Bilingual text={t("about")} style={styles.about} secondaryStyle={styles.aboutSecondary}/>
    </ScrollView>;
  };

  const renderShelter = () => <ScrollView ref={(el)=>{ scrollRefs.current.shelter=el; }} {...scrollProps}>
    <Section header={t("chooseHazard")}>
      {Object.keys(SHELTER_LAYERS).map((hazard)=>
        <Row key={hazard} title={t(hazard)} selected={shelterHazard===hazard}
          onPress={()=>setShelterHazard(hazard)} accessibilityLabel={inline(t(hazard))}
          accessibilityState={{ selected:shelterHazard===hazard }}/>)}
    </Section>
    {!position && <Section><Notice text={t("permission")}/></Section>}
    <View style={styles.mapWrap}>
      <SafetyMap location={position} points={shelters.map((item)=>({...item,name:displayDynamic(item.name)}))}
        selectedPoint={selectedPoint} t={t} height={300} dark={dark} kind="shelter"/>
    </View>
    <Section header={t("shelter")} footer={[t("notOpen"),"© Geospatial Information Authority of Japan (GSI)"]}>
      {shelterState==="loading" && <Row key="spin"><ActivityIndicator color={COLORS.teal}/></Row>}
      {shelterState==="error" && <Notice key="err" text={t("unavailable")}/>}
      {shelterState==="ready" && !shelters.length && <Row key="none" title={t("noPlace")}/>}
      {shelters.map((p)=><Row key={p.id} onPress={()=>setSelectedPoint(p.coordinate)}
        selected={selectedPoint?.latitude===p.coordinate.latitude && selectedPoint?.longitude===p.coordinate.longitude}
        accessibilityLabel={inline(t("viewSite"))+": "+p.name}>
        <Bilingual text={displayDynamic(p.name)} style={TYPE.headline}/>
        {!!p.address && <Bilingual text={displayDynamic(p.address)} style={[TYPE.subhead,{ color:COLORS.muted }]}/>}
        <Text style={[TYPE.footnote,{ color:COLORS.muted }]}>
          {inline(t("shelterType"))}: {p.suitable.map((s)=>inline(t(s))).join(" · ")}
        </Text>
        {!!p.remarks && <Bilingual text={displayDynamic(p.remarks)} style={[TYPE.footnote,{ color:COLORS.muted }]}/>}
      </Row>)}
    </Section>
    <SafetySteps hazard="shelter" locale={locale} t={t} colors={COLORS}/>
    <SectionFooter>{t("notes")}</SectionFooter>
  </ScrollView>;

  const appContext = { renderHome, renderHazard, renderShelter };
  // iOS: native UIBarButtonItems (UIMenu for languages, SF Symbols).
  const homeOptions = Platform.OS === "ios" ? {
    unstable_headerRightItems:() => [
      { type:"menu", label:plain("language"), accessibilityLabel:inline(t("language")),
        icon:{ type:"sfSymbol", name:"globe" },
        menu:{ title:inline(t("language")), items:Object.entries(LANGUAGE_NAMES).map(([code,name])=>({
          type:"action", label:name, state:code===locale ? "on" : "off", onPress:()=>chooseLanguage(code)
        })) } },
      { type:"button", label:plain(dark ? "switchLight" : "switchDark"),
        accessibilityLabel:inline(t(dark ? "switchLight" : "switchDark")),
        icon:{ type:"sfSymbol", name:dark ? "sun.max" : "moon" }, onPress:toggleTheme }
    ]
  } : {
    headerRight:() => <View style={styles.headerActions}>
      <Pressable onPress={toggleTheme} style={styles.themeButton} accessibilityRole="button"
        accessibilityLabel={inline(t(dark ? "switchLight" : "switchDark"))}>
        <Icon name={CATEGORY_SYMBOLS[dark ? "sun" : "moon"]} size={22}/>
      </Pressable>
      <Pressable onPress={openLanguagePicker} style={styles.langButton} accessibilityRole="button"
        accessibilityLabel={inline(t("language"))}>
        <Icon name={CATEGORY_SYMBOLS.language} size={22}/>
      </Pressable>
    </View>
  };

  return (
    <ThemeContext.Provider value={themeContext}>
    <AppContext.Provider value={appContext}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"}/>
      {friendlySplash ? <View style={styles.boot}>
        <Icon name={{ ios:"shield.lefthalf.filled", android:"shield", web:"shield" }} size={64}/>
        <Text style={[TYPE.title1,{ color:COLORS.ink }]}>Safety For You</Text>
      </View> :
      <NavigationContainer ref={navigationRef} theme={navTheme}
        onReady={()=>setScreen(currentScreenId())} onStateChange={()=>setScreen(currentScreenId())}>
        <Stack.Navigator screenOptions={{
          headerLargeTitleEnabled:Platform.OS === "ios",
          headerLargeTitleShadowVisible:false,
          contentStyle:{ backgroundColor:navigationColors(dark).background }
        }}>
          <Stack.Screen name="Home" component={HomeScreen}
            options={{ title:"Safety For You", ...homeOptions }}/>
          <Stack.Screen name="Hazard" component={HazardScreen} getId={({ params })=>params?.id}
            options={({ route })=>({ title:inline(t(route.params?.id)) })}/>
          <Stack.Screen name="Shelter" component={ShelterScreen} options={{ title:inline(t("shelter")) }}/>
        </Stack.Navigator>
      </NavigationContainer>}
      <Modal visible={!!alarm} animationType="fade" presentationStyle="fullScreen"
        onRequestClose={dismissAlarm}>
        {/* A Modal is a separate native window; it needs its own safe-area provider. */}
        {alarm && <SafeAreaProvider><SafeAreaView style={[styles.alarmRoot,{ backgroundColor:COLORS.alarmBg }]}
          edges={["top","bottom"]}>
          <ScrollView contentContainerStyle={styles.alarmBody}>
            <View style={{ alignItems:"center" }}>
              <Icon name={alarm.report.category === "tsunami" ? CATEGORY_SYMBOLS.tsunami : CATEGORY_SYMBOLS.warning}
                size={64} color={COLORS.onAlert}/>
            </View>
            <Bilingual text={t(alarmTitleKey(alarm.report,alarm.impact))}
              style={[TYPE.largeTitle,styles.alarmText]} secondaryStyle={[TYPE.headline,styles.alarmText]}/>
            <Bilingual text={fill(t(alarmReasonKey(alarm.impact)),alarm.impact)}
              style={[TYPE.title3,styles.alarmText]} secondaryStyle={[TYPE.subhead,styles.alarmText]}/>
            <Bilingual text={displayDynamic(alarm.report.title)}
              style={[TYPE.body,styles.alarmText]} secondaryStyle={[TYPE.footnote,styles.alarmText]}/>
            <Text style={[TYPE.footnote,styles.alarmText]}>
              {inline(t("sources"))}: {alarm.report.source} · {formatDate(alarm.report.issuedAt || alarm.report.time,locale)}
            </Text>
            <SafetySteps hazard={alarm.report.category} locale={locale} t={t} colors={COLORS} onDark/>
            <Pressable onPress={dismissAlarm} accessibilityRole="button" accessibilityLabel={inline(t("alarmDismiss"))}
              style={({ pressed })=>[styles.alarmButton,{ backgroundColor:"#FFFFFF" },pressed && { opacity:.75 }]}>
              <Text style={[TYPE.headline,{ color:COLORS.alarmBg }]}>{inline(t("alarmDismiss"))}</Text>
            </Pressable>
            <Pressable onPress={()=>{ const report=alarm.report; dismissAlarm(); selectReport(report); }}
              accessibilityRole="button" accessibilityLabel={inline(t("openMap"))}
              style={({ pressed })=>[styles.alarmButton,styles.alarmSecondary,pressed && { opacity:.75 }]}>
              <Text style={[TYPE.headline,{ color:COLORS.onAlert }]}>{inline(t("openMap"))}</Text>
            </Pressable>
            <Bilingual text={t("alarmLimit")} style={[TYPE.footnote,styles.alarmText]}
              secondaryStyle={[TYPE.caption1,styles.alarmText]}/>
          </ScrollView>
        </SafeAreaView></SafeAreaProvider>}
      </Modal>
      {/* Android language sheet (iOS uses the native menu in the navigation bar). */}
      <Modal visible={languageOpen} transparent animationType="slide" onRequestClose={()=>setLanguageOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={()=>setLanguageOpen(false)}
            accessibilityRole="button" accessibilityLabel={plain("close")}/>
          <View style={[styles.languageSheet,{ paddingBottom:insets.bottom + 16 }]} accessibilityViewIsModal>
            <View style={styles.grabber} accessible={false}/>
            <ScrollView style={{ maxHeight:520 }}>
              <Section header={t("language")}>
                {Object.entries(LANGUAGE_NAMES).map(([code,name])=>
                  <Row key={code} title={name} selected={code===locale} onPress={()=>chooseLanguage(code)}
                    accessibilityState={{ selected:code===locale }}/>)}
              </Section>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AppContext.Provider>
    </ThemeContext.Provider>
  );
}
function alarmTitleKey(report, impact) {
  if (impact.category === "tsunami") return impact.grade === "advisory" ? "alarmTitleAdvisory" : "alarmTitleTsunami";
  return report.urgent || report.predicted ? "alarmTitleEew" : "alarmTitleQuake";
}
function alarmReasonKey(impact) {
  return {insideShindoArea:"alarmInside",insideForecastArea:"alarmInsideForecast",
    nearEpicenter:"alarmNear",nearTsunamiCoast:"alarmCoast"}[impact.reason] || "alarmNear";
}
export default function App() { return <SafeAreaProvider><AppContent/></SafeAreaProvider>; }
// UIKit inset-grouped layout: 16pt margins, system grouped backgrounds,
// 44pt minimum rows and Dynamic Type sizes from src/theme.js.
const createStyles = (COLORS) => StyleSheet.create({
  screen:{ flex:1 },
  body:{ paddingHorizontal:16, paddingTop:8 },
  caption:{ paddingHorizontal:16, marginBottom:16 },
  headerActions:{ flexDirection:"row",alignItems:"center",gap:4 },
  themeButton:{ minWidth:44,minHeight:44,alignItems:"center",justifyContent:"center" },
  langButton:{ minWidth:44,minHeight:44,alignItems:"center",justifyContent:"center" },
  mapWrap:{ marginBottom:24 },
  severityRow:{ flexDirection:"row",alignItems:"center",gap:8 },
  severityDot:{ width:10,height:10,borderRadius:5 },
  metricRow:{ flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:4 },
  metricCell:{ backgroundColor:COLORS.bg,borderRadius:10,paddingVertical:8,paddingHorizontal:12,
    minWidth:96,flexGrow:1,maxWidth:"100%" },
  metricValue:{ ...TYPE.headline,color:COLORS.ink },
  tsunamiArea:{ borderTopWidth:StyleSheet.hairlineWidth,borderColor:COLORS.border,marginTop:6,paddingTop:8,gap:2 },
  timestamp:{ ...TYPE.footnote,color:COLORS.timestamp,fontWeight:"600" },
  about:{ ...TYPE.footnote,color:COLORS.muted,textAlign:"center",marginTop:8 },
  aboutSecondary:{ ...TYPE.caption1,textAlign:"center" },
  boot:{ flex:1,alignItems:"center",justifyContent:"center",gap:16,backgroundColor:COLORS.bg },
  backdrop:{ flex:1,justifyContent:"flex-end",backgroundColor:"#0007" },
  languageSheet:{ backgroundColor:COLORS.bg,borderTopLeftRadius:12,borderTopRightRadius:12,
    paddingHorizontal:16,paddingTop:8 },
  grabber:{ alignSelf:"center",width:36,height:5,borderRadius:3,backgroundColor:COLORS.tertiary,marginBottom:12 },
  alarmRoot:{ flex:1 },
  alarmBody:{ padding:20,gap:14,paddingBottom:36 },
  alarmText:{ color:COLORS.onAlert,textAlign:"center" },
  alarmButton:{ minHeight:50,borderRadius:12,alignItems:"center",justifyContent:"center",paddingHorizontal:16 },
  alarmSecondary:{ borderWidth:2,borderColor:COLORS.onAlert }
});

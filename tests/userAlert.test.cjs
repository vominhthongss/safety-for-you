const test=require("node:test");
const assert=require("node:assert/strict");
const {evaluateUserImpact,alertCandidate,distanceKm,geometryContains,geometryDistanceKm}=
  require("../src/userAlert.cjs");
const {matchHazardZones,regionReports}=require("../src/hazardZones.cjs");
const {buildMapZones}=require("../src/mapFeatures.cjs");
const {readableTextOn}=require("../src/hazardSeverity.cjs");

// JST "YYYY/MM/DD HH:MM:SS" as published by P2PQuake.
const NOW=Date.parse("2026-11-24T10:05:00+09:00");
const user={latitude:36,longitude:138};
const square=(x,y)=>({type:"Polygon",coordinates:[[[x-1,y-1],[x+1,y-1],[x+1,y+1],[x-1,y+1],[x-1,y-1]]]});
const quake=(extra={})=>({id:"q1",category:"earthquake",time:"2026/11/24 10:02:00",
  coordinate:{latitude:37,longitude:140},shindoCode:50,cancelled:false,...extra});

test("Haversine distance and polygon containment use GeoJSON lon/lat order",()=>{
  assert.equal(Math.round(distanceKm({latitude:35,longitude:139},{latitude:36,longitude:139})),111);
  assert.ok(geometryContains(user,square(138,36)));
  assert.ok(!geometryContains(user,square(140,36)));
  const coast={type:"LineString",coordinates:[[138.05,35],[138.05,37]]};
  assert.ok(geometryDistanceKm(user,coast)<5);
});
test("User inside a JMA area with Shindo 4+ triggers an alarm",()=>{
  const zones=[{geometry:square(138,36),properties:{scale:50,value:"5+",kind:"observedIntensity"}}];
  const impact=evaluateUserImpact(quake(),user,zones,NOW);
  assert.equal(impact.level,"alarm");
  assert.equal(impact.reason,"insideShindoArea");
  assert.equal(impact.shindo,"5+");
});
test("Weak shaking areas or far epicenters do not alarm",()=>{
  const weak=[{geometry:square(138,36),properties:{scale:30,kind:"observedIntensity"}}];
  assert.equal(evaluateUserImpact(quake({shindoCode:30}),user,weak,NOW),null);
  assert.equal(evaluateUserImpact(quake(),user,[],NOW),null);
});
test("Near-epicenter fallback requires Shindo 4+ or an EEW",()=>{
  const near=quake({coordinate:{latitude:36.2,longitude:138.1}});
  assert.equal(evaluateUserImpact(near,user,[],NOW).reason,"nearEpicenter");
  assert.equal(evaluateUserImpact({...near,shindoCode:20},user,[],NOW),null);
  assert.equal(evaluateUserImpact({...near,shindoCode:null,urgent:true},user,[],NOW).level,"alarm");
});
test("Old, cancelled or location-less bulletins never alarm",()=>{
  const near=quake({coordinate:{latitude:36.2,longitude:138.1}});
  assert.equal(evaluateUserImpact({...near,time:"2026/11/24 09:00:00"},user,[],NOW),null);
  assert.equal(evaluateUserImpact({...near,cancelled:true},user,[],NOW),null);
  assert.equal(evaluateUserImpact(near,null,[],NOW),null);
  assert.equal(alertCandidate({...near,time:"2026/11/24 09:00:00"},NOW),false);
  assert.equal(alertCandidate(near,NOW),true);
});
test("Tsunami warning coast within 10 km alarms; advisory is a notice",()=>{
  const report={id:"t1",category:"tsunami",time:"2026/11/24 10:00:00",tsunamiStatus:"warning"};
  const coast=(grade)=>({geometry:{type:"LineString",coordinates:[[138.05,35],[138.05,37]]},
    properties:{grade,kind:"forecastCoast"}});
  assert.equal(evaluateUserImpact(report,user,[coast("warning")],NOW).level,"alarm");
  assert.equal(evaluateUserImpact(report,user,[coast("advisory")],NOW).level,"notice");
  const far={geometry:{type:"LineString",coordinates:[[139,35],[139,37]]},properties:{grade:"majorWarning"}};
  assert.equal(evaluateUserImpact(report,user,[far],NOW),null);
});
test("EEW forecast areas are matched for alarms but never drawn as observed shaking",()=>{
  const report={category:"earthquake",shakingAreas:[],
    forecastAreas:[{name:"長野県北部",scale:45,scaleLabel:"5-"}]};
  assert.equal(regionReports(report).length,0);
  const geojson={type:"FeatureCollection",features:[{type:"Feature",
    geometry:square(138,36),properties:{name:"長野県北部"}}]};
  const zones=matchHazardZones(geojson,report,(s)=>s,{includeForecast:true});
  assert.equal(zones.length,1);
  assert.equal(zones[0].properties.kind,"forecastIntensity");
  assert.equal(buildMapZones(zones).markers.length,0);
});
test("Tsunami coastline gets an official wave-height badge only when numeric",()=>{
  const report={category:"tsunami",tsunamiAreas:[
    {name:"岩手県",grade:"warning",forecastHeight:{type:"meters",meters:3}},
    {name:"宮城県",grade:"majorWarning",forecastHeight:{type:"description",description:"巨大"}}]};
  const line={type:"LineString",coordinates:[[141,39],[141.5,39.5],[142,40]]};
  const geojson={type:"FeatureCollection",features:[
    {type:"Feature",geometry:line,properties:{name:"岩手県"}},
    {type:"Feature",geometry:line,properties:{name:"宮城県"}}]};
  const markers=buildMapZones(matchHazardZones(geojson,report)).markers;
  assert.equal(markers.length,1);
  assert.equal(markers[0].kind,"tsunami");
  assert.equal(markers[0].shortLabel,"3m");
});
test("Badge text color stays readable on light and dark severity colors",()=>{
  assert.equal(readableTextOn("#E7BC30"),"#1C1C1E");
  assert.equal(readableTextOn("#722D7E"),"#FFFFFF");
});

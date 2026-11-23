const test=require("node:test");
const assert=require("node:assert/strict");
const {buildMapZones,downsample,polygonAnchor,ringContains}=require("../src/mapFeatures.cjs");
const square=[[[137,35],[139,35],[139,37],[137,37],[137,35]]];
const affected={type:"Feature",geometry:{type:"Polygon",coordinates:square},
  properties:{label:"愛知県",value:"Shindo 3",color:"#35A875",kind:"observedIntensity"}};
test("JMA polygon creates an actual area overlay with an intensity badge",()=>{
  const result=buildMapZones([affected]);
  assert.equal(result.polygons.length,1);
  assert.equal(result.lines.length,0);
  assert.equal(result.markers.length,1);
  assert.deepEqual(result.markers[0].coordinate,{latitude:36,longitude:138});
  assert.equal(result.markers[0].shortLabel,"3");
  assert.equal(result.markers[0].color,"#35A875");
});
test("Unverified intensity or coordinates must not get an invented pin",()=>{
  const unknown={...affected,properties:{...affected.properties,value:"Shindo unknown"}};
  const bad={...affected,geometry:{type:"Polygon",coordinates:[[[null,35],[null,36],[null,35]]]}};
  assert.equal(buildMapZones([unknown]).markers.length,0);
  assert.equal(buildMapZones([bad]).markers.length,0);
  assert.equal(buildMapZones([]).markers.length,0);
});
test("Tsunami line retains published coastline without earthquake marker",()=>{
  const features=[{type:"Feature",geometry:{type:"MultiLineString",coordinates:[
    [[140,39],[141,40]],[[139,38],[140,39]]]},
    properties:{label:"岩手県",value:"warning",color:"#E14A37",kind:"forecastCoast"}}];
  const rendered=buildMapZones(features);
  assert.equal(rendered.lines.length,2);
  assert.equal(rendered.markers.length,0);
});
test("Multipolygon and separate code labels do not claim station coordinates",()=>{
  const m={...affected,geometry:{type:"MultiPolygon",coordinates:[
    square,[[[140,38],[141,38],[141,39],[140,39],[140,38]]] ]}};
  const result=buildMapZones([m]);
  assert.equal(result.polygons.length,2);
  assert.equal(result.markers.length,1);
});
test("Large polygon simplification is bounded and region anchor lies inside",()=>{
  const ring=downsample(Array.from({length:2500},(_,i)=>{
    const theta=i/2499*Math.PI*2;
    return [138+Math.cos(theta),36+Math.sin(theta)];
  }));
  assert.ok(ring.length<=502);
  const anchor=polygonAnchor(ring);
  assert.ok(ringContains(anchor,ring));
});

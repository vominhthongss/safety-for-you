/**
 * One source-of-truth for reported severity color, labels and marker metadata.
 * Shindo (JMA observed local shaking) is NOT earthquake magnitude (M).
 * Null/unknown data stay neutral; no estimated disaster severity.
 */
const INTENSITY={
  0:{label:"0",color:"#9BA7B3"},
  10:{label:"1",color:"#8CCADF"},
  20:{label:"2",color:"#3A9BCC"},
  30:{label:"3",color:"#35A875"},
  40:{label:"4",color:"#E7BC30"},
  45:{label:"5-",color:"#EA8A2D"},
  // P2PQuake 46 = 5-lower or greater, but station detail not confirmed.
  46:{label:"≥5- (estimated)",color:"#EA8A2D"},
  50:{label:"5+",color:"#DD6531"},
  55:{label:"6-",color:"#D73B44"},
  60:{label:"6+",color:"#AF2B69"},
  70:{label:"7",color:"#722D7E"}
};
const TSUNAMI={
  advisory:{color:"#D7A122",label:"advisory",rank:1},
  warning:{color:"#E14A37",label:"warning",rank:2},
  majorWarning:{color:"#9F276E",label:"majorWarning",rank:3}
};
const METEO_GRADES={
  advisory:{color:"#D7A122",label:"advisory",rank:1},
  warning:{color:"#E14A37",label:"warning",rank:2},
  emergency:{color:"#9F276E",label:"emergencyWarning",rank:3}
};
const NEUTRAL={color:"#82909A",label:null,rank:0,source:"unknown"};
const SHINDO_CODES=Object.keys(INTENSITY).map(Number);
function validShindo(code) {
  if (code===null || code===undefined || code==="") return null;
  const num=Number(code);
  return SHINDO_CODES.includes(num) ? num : null;
}
function shindoFromLabel(label) {
  if (label===null || label===undefined) return null;
  return SHINDO_CODES.find((key)=>INTENSITY[key].label === String(label)) ?? null;
}
function getReportSeverity(report) {
  if (!report) return NEUTRAL;
  if (report.cancelled) return {color:"#82909A",label:"cancelled",rank:0,source:"cancelled"};
  if (report.category==="earthquake") {
    const scale=validShindo(report.shindoCode) ?? shindoFromLabel(report.shindo);
    if (scale!==null) {
      const item=INTENSITY[scale];
      return {color:item.color,label:item.label,rank:scale,source:report.predicted?"predictedShindo":"observedShindo"};
    }
  }
  if (report.category==="tsunami" && TSUNAMI[report.tsunamiStatus]) {
    return {...TSUNAMI[report.tsunamiStatus],source:"issuedTsunami"};
  }
  // Weather adapter currently only parses bulletin headlines, not active
  // warning grades. A recent headline alone must NEVER become red.
  if (report.source==="JMA" && report.severityVerified === true &&
    report.warningGrade && METEO_GRADES[report.warningGrade]) {
    return {...METEO_GRADES[report.warningGrade],source:"verifiedJmaGrade"};
  }
  return NEUTRAL;
}
function getAreaSeverity(category, report) {
  if (category==="earthquake") {
    const code=validShindo(report?.scale);
    if(code===null)return NEUTRAL;
    return {color:INTENSITY[code].color,label:INTENSITY[code].label,rank:code,source:"areaShindo"};
  }
  if(category==="tsunami") {
    return TSUNAMI[report?.grade] ? {...TSUNAMI[report.grade],source:"areaTsunami"}:NEUTRAL;
  }
  return NEUTRAL;
}
// Picks dark or white text for a severity color by WCAG relative luminance,
// so a Shindo/tsunami badge number stays readable on every palette color.
function readableTextOn(hex) {
  const m=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex||""));
  if(!m)return "#FFFFFF";
  const [r,g,b]=m.slice(1).map((x)=>parseInt(x,16)/255)
    .map((c)=>c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4);
  return 0.2126*r+0.7152*g+0.0722*b>0.19 ? "#1C1C1E" : "#FFFFFF";
}
module.exports={readableTextOn,INTENSITY,TSUNAMI,METEO_GRADES,NEUTRAL,validShindo,shindoFromLabel,getReportSeverity,getAreaSeverity};

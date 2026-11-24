import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TYPE } from "./theme";
const {guideFor,localText,SHINDO_GUIDE}=require("./safetyGuide.cjs");
const {INTENSITY,readableTextOn:badgeTextColor}=require("./hazardSeverity.cjs");

// Large pictogram + one short sentence per step. Emoji render as full-color
// pictures on both iOS and Android without bundling image assets.
function Pictogram({icon,dont,colors,size}) {
  return <View style={[styles.picture,{width:size,height:size,borderRadius:size*0.24,
      backgroundColor:dont ? "#FDE7E5" : "#E3F4E8"}]}
    accessible={false} importantForAccessibility="no-hide-descendants">
    <Text style={{fontSize:size*0.52}}>{icon}</Text>
    <View style={[styles.mark,{backgroundColor:dont ? colors.alarmBg : "#1E7B3A"}]}>
      <Text style={styles.markText}>{dont ? "✕" : "✓"}</Text>
    </View>
  </View>;
}
export function SafetySteps({hazard,locale,t,colors,compact=false,onDark=false}) {
  const steps=guideFor(hazard);
  if(!steps.length)return null;
  const ink=onDark ? colors.onAlert : colors.ink;
  return <View style={[styles.card,!onDark && {backgroundColor:colors.white,borderColor:colors.border,
      borderWidth:StyleSheet.hairlineWidth}]}>
    <Text accessibilityRole="header" style={[TYPE.headline,{color:ink,marginBottom:4}]}>
      {t("whatToDo")}
    </Text>
    {steps.map((step,index)=>{
      const label=localText(step.text,locale);
      return <View key={index} style={styles.step} accessible
        accessibilityLabel={(index+1)+". "+(step.dont ? t("guideDont")+": " : "")+label}>
        <Pictogram icon={step.icon} dont={step.dont} colors={colors} size={compact ? 52 : 64}/>
        <View style={{flex:1,gap:2}}>
          <Text style={[TYPE.footnote,{fontWeight:"700",
            color:onDark ? colors.onAlert : step.dont ? colors.alert : colors.success}]}>
            {index+1} · {step.dont ? t("guideDont") : t("guideDo")}
          </Text>
          <Text style={[compact ? TYPE.callout : TYPE.body,{color:ink,fontWeight:"600"}]}>{label}</Text>
        </View>
      </View>;
    })}
  </View>;
}
export function ShindoGuide({locale,t,colors,highlight=null}) {
  return <View style={[styles.card,{backgroundColor:colors.white,borderColor:colors.border,
      borderWidth:StyleSheet.hairlineWidth}]}>
    <Text accessibilityRole="header" style={[TYPE.headline,{color:colors.ink,marginBottom:4}]}>
      {t("shindoGuide")}
    </Text>
    {SHINDO_GUIDE.map((row)=>{
      const color=INTENSITY[row.codes[row.codes.length-1]].color;
      const active=highlight!==null && row.codes.includes(Number(highlight));
      const text=localText(row.text,locale);
      return <View key={row.label} accessible
        accessibilityLabel={"Shindo "+row.label+". "+text}
        style={[styles.shindoRow,active && {backgroundColor:colors.tealLight,borderRadius:12}]}>
        <View style={[styles.shindoBadge,{backgroundColor:color}]}>
          <Text style={[styles.shindoBadgeText,{color:badgeTextColor(color)}]}>{row.label}</Text>
        </View>
        <Text style={{fontSize:30}} accessible={false}>{row.icon}</Text>
        <Text style={[TYPE.subhead,{color:colors.ink,flex:1}]}>{text}</Text>
      </View>;
    })}
    <Text style={[TYPE.caption1,{color:colors.muted,marginTop:6}]}>{t("shindoSource")}</Text>
  </View>;
}
const styles=StyleSheet.create({
  card:{borderRadius:12,padding:14,marginVertical:6,gap:10},
  step:{flexDirection:"row",alignItems:"center",gap:12,minHeight:56},
  picture:{alignItems:"center",justifyContent:"center"},
  mark:{position:"absolute",right:-4,bottom:-4,width:24,height:24,borderRadius:12,
    alignItems:"center",justifyContent:"center",borderWidth:2,borderColor:"#FFFFFF"},
  markText:{color:"#FFFFFF",fontSize:13,fontWeight:"900"},
  shindoRow:{flexDirection:"row",alignItems:"center",gap:10,minHeight:48,paddingHorizontal:4,paddingVertical:4},
  shindoBadge:{minWidth:54,minHeight:34,borderRadius:10,alignItems:"center",justifyContent:"center",paddingHorizontal:6},
  shindoBadgeText:{color:"#FFFFFF",fontSize:16,fontWeight:"800"}
});

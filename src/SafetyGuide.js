import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TYPE } from "./theme";
import { Bilingual, Icon, IconTile, Row, Section, systemColor } from "./ui";
const {guideFor,localText,SHINDO_GUIDE}=require("./safetyGuide.cjs");
const {INTENSITY,readableTextOn}=require("./hazardSeverity.cjs");

const XMARK={ios:"xmark.circle.fill",android:"cancel",web:"cancel"};

// Protective actions as an inset-grouped list: one native symbol and one
// short sentence per row. "Do not" rows use a red tile and a red label.
export function SafetySteps({hazard,locale,t,colors,onDark=false}) {
  const steps=guideFor(hazard);
  if(!steps.length)return null;
  if(onDark) {
    return <View style={styles.darkList}>
      <Text accessibilityRole="header" style={[TYPE.headline,{color:colors.onAlert}]}>
        {t("whatToDo").split("\n").join(" · ")}
      </Text>
      {steps.map((step,index)=>{
        const label=localText(step.text,locale);
        return <View key={index} style={styles.darkRow} accessible
          accessibilityLabel={(step.dont ? t("guideDont")+": " : "")+label.replace(/\n/g," ")}>
          <View style={styles.darkTile}>
            <Icon name={step.icon} size={22} color={colors.onAlert}/>
          </View>
          <View style={{flex:1}}>
            {step.dont && <Text style={[TYPE.footnote,{color:colors.onAlert,fontWeight:"700"}]}>
              {t("guideDont").split("\n")[0]}
            </Text>}
            <Bilingual text={label} style={[TYPE.headline,{color:colors.onAlert}]}
              secondaryStyle={{color:colors.onAlert,opacity:0.85}}/>
          </View>
        </View>;
      })}
    </View>;
  }
  return <Section header={t("whatToDo")}>
    {steps.map((step,index)=>{
      const label=localText(step.text,locale);
      return <Row key={index} icon={step.icon}
        iconColor={systemColor(step.dont ? "systemRed" : "systemBlue")}
        accessibilityLabel={(step.dont ? t("guideDont")+": " : "")+label.replace(/\n/g," ")}
        accessory={step.dont ? <Icon name={XMARK} size={20} color={systemColor("systemRed")}/> : null}>
        {step.dont && <Text style={[TYPE.footnote,{color:colors.alert,fontWeight:"600"}]}>
          {t("guideDont").split("\n")[0]}
        </Text>}
        <Bilingual text={label}/>
      </Row>;
    })}
  </Section>;
}
// JMA Shindo scale summary: colored intensity capsule + one sentence.
export function ShindoGuide({locale,t,colors,highlight=null}) {
  return <Section header={t("shindoGuide")} footer={t("shindoSource")}>
    {SHINDO_GUIDE.map((row)=>{
      const color=INTENSITY[row.codes[row.codes.length-1]].color;
      const active=highlight!==null && row.codes.includes(Number(highlight));
      const text=localText(row.text,locale);
      return <Row key={row.label} selected={active}
        accessibilityLabel={"Shindo "+row.label+". "+text.replace(/\n/g," ")}
        accessory={null}>
        <View style={styles.shindoLine}>
          <View style={[styles.capsule,{backgroundColor:color}]}>
            <Text style={[TYPE.subhead,{fontWeight:"700",color:readableTextOn(color)}]}>{row.label}</Text>
          </View>
          <View style={{flex:1}}><Bilingual text={text} style={TYPE.subhead}/></View>
        </View>
      </Row>;
    })}
  </Section>;
}
const styles=StyleSheet.create({
  shindoLine:{flexDirection:"row",alignItems:"center",gap:12},
  capsule:{minWidth:52,minHeight:28,borderRadius:14,alignItems:"center",justifyContent:"center",paddingHorizontal:8},
  darkList:{gap:12,paddingVertical:4},
  darkRow:{flexDirection:"row",alignItems:"center",gap:12,minHeight:44},
  darkTile:{width:40,height:40,borderRadius:10,alignItems:"center",justifyContent:"center",
    backgroundColor:"#FFFFFF33"}
});

// Native-looking building blocks that follow UIKit's inset-grouped list:
// section header/footer, 44pt rows, Settings-style icon tiles and chevrons.
import React from "react";
import { Platform, PlatformColor, Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { TYPE } from "./theme";

export const ThemeContext = React.createContext(null);
export const useTheme = () => React.useContext(ThemeContext);

// UIKit system colors on iOS; matching hex values elsewhere.
const SYSTEM_HEX = {
  systemBlue:"#007AFF", systemGreen:"#34C759", systemIndigo:"#5856D6", systemOrange:"#FF9500",
  systemPink:"#FF2D55", systemPurple:"#AF52DE", systemRed:"#FF3B30", systemTeal:"#30B0C7",
  systemYellow:"#FFCC00", systemCyan:"#32ADE6", systemMint:"#00C7BE", systemBrown:"#A2845E",
  systemGray:"#8E8E93"
};
export function systemColor(name) {
  return Platform.OS === "ios" ? PlatformColor(name) : (SYSTEM_HEX[name] || SYSTEM_HEX.systemGray);
}

// SF Symbol on iOS, Material Symbol on Android (same name object as config).
export function Icon({ name, size = 17, color, accessibilityLabel }) {
  const { colors } = useTheme();
  return <SymbolView name={name} size={size} tintColor={color || colors.teal}
    type="monochrome" accessibilityLabel={accessibilityLabel}
    accessible={!!accessibilityLabel}/>;
}
// Rounded-square tile with a white glyph, as in the Settings app.
export function IconTile({ name, color, size = 30 }) {
  return <View style={[styles.tile,{ width:size,height:size,borderRadius:size*0.23,
      backgroundColor:color }]} accessible={false} importantForAccessibility="no-hide-descendants">
    <Icon name={name} size={size*0.6} color="#FFFFFF"/>
  </View>;
}
// Japanese strings arrive as "原文\nRomaji"; the reading is set as secondary text.
export function Bilingual({ text, style, secondaryStyle, numberOfLines }) {
  const { colors } = useTheme();
  const [main, ...rest] = String(text ?? "").split("\n");
  return <>
    <Text style={[TYPE.body,{ color:colors.ink },style]} numberOfLines={numberOfLines}>{main}</Text>
    {!!rest.length && <Text style={[TYPE.footnote,{ color:colors.muted },secondaryStyle]}>
      {rest.join(" ")}
    </Text>}
  </>;
}
export function SectionHeader({ title, action }) {
  const { colors } = useTheme();
  if (!title && !action) return null;
  return <View style={styles.header}>
    {!!title && <Text accessibilityRole="header"
      style={[TYPE.footnote,{ color:colors.muted,textTransform:"uppercase",flex:1 }]}>
      {String(title).split("\n").join(" · ")}
    </Text>}
    {!!action && <Pressable onPress={action.onPress} accessibilityRole="button"
      accessibilityLabel={action.label} hitSlop={8} style={styles.headerAction}>
      <Text style={[TYPE.subhead,{ color:colors.teal }]}>{action.label}</Text>
    </Pressable>}
  </View>;
}
export function SectionFooter({ children }) {
  const { colors } = useTheme();
  if (children == null || children === false || children === "") return null;
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  if (!items.length) return null;
  return <View style={styles.footer}>
    {items.map((item, i) => typeof item === "string" ?
      <Text key={i} style={[TYPE.footnote,{ color:colors.muted }]}>{item}</Text> :
      <React.Fragment key={i}>{item}</React.Fragment>)}
  </View>;
}
// Inset-grouped section. Separators are inset to the text column like UIKit.
export function Section({ header, headerAction, footer, children, style, inset = 16 }) {
  const { colors } = useTheme();
  const rows = React.Children.toArray(children).filter(Boolean);
  return <View style={[styles.section,style]}>
    <SectionHeader title={header} action={headerAction}/>
    {!!rows.length && <View style={[styles.card,{ backgroundColor:colors.white }]}>
      {rows.map((row, i) => <React.Fragment key={row.key ?? i}>
        {i > 0 && <View style={[styles.separator,{ marginLeft:row.props?.icon ? 62 : inset,
          backgroundColor:colors.border }]}/>}
        {row}
      </React.Fragment>)}
    </View>}
    <SectionFooter>{footer}</SectionFooter>
  </View>;
}
export function Row({
  icon, iconColor, title, subtitle, detail, chevron = false, accessory, onPress,
  titleColor, children, accessibilityLabel, accessibilityHint, accessibilityState, selected
}) {
  const { colors } = useTheme();
  const body = <>
    {!!icon && <IconTile name={icon} color={iconColor || systemColor("systemBlue")}/>}
    <View style={styles.rowText}>
      {title != null && <Bilingual text={title} style={titleColor && { color:titleColor }}/>}
      {subtitle != null && <Text style={[TYPE.subhead,{ color:colors.muted }]}>{subtitle}</Text>}
      {children}
    </View>
    {detail != null && <Text style={[TYPE.body,{ color:colors.muted }]}>{detail}</Text>}
    {selected && <Icon name={{ ios:"checkmark", android:"check", web:"check" }} size={17}/>}
    {accessory}
    {chevron && <Icon name={{ ios:"chevron.right", android:"chevron_right", web:"chevron_right" }}
      size={14} color={colors.tertiary}/>}
  </>;
  if (!onPress) return <View style={styles.row} accessible={!!accessibilityLabel}
    accessibilityLabel={accessibilityLabel}>{body}</View>;
  return <Pressable onPress={onPress} accessibilityRole="button"
    accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint}
    accessibilityState={accessibilityState}
    style={({ pressed }) => [styles.row, pressed && { backgroundColor:colors.highlight }]}>
    {body}
  </Pressable>;
}
// Inline caution shown inside a section row (no colored boxes).
export function Notice({ text, tone = "warning" }) {
  const color = systemColor(tone === "critical" ? "systemRed" : tone === "info" ? "systemBlue" : "systemOrange");
  const name = tone === "info" ?
    { ios:"info.circle.fill", android:"info", web:"info" } :
    { ios:"exclamationmark.triangle.fill", android:"warning", web:"warning" };
  return <View style={styles.notice} accessible accessibilityLabel={String(text).replace(/\n/g," ")}>
    <Icon name={name} size={20} color={color}/>
    <View style={{ flex:1 }}><Bilingual text={text} style={TYPE.subhead}/></View>
  </View>;
}
const styles = StyleSheet.create({
  section:{ marginBottom:24 },
  header:{ flexDirection:"row",alignItems:"flex-end",paddingHorizontal:16,marginBottom:6,minHeight:20,gap:8 },
  headerAction:{ minHeight:28,justifyContent:"flex-end" },
  footer:{ paddingHorizontal:16,paddingTop:6,gap:6 },
  card:{ borderRadius:12,overflow:"hidden" },
  separator:{ height:StyleSheet.hairlineWidth },
  row:{ minHeight:44,flexDirection:"row",alignItems:"center",gap:14,paddingHorizontal:16,paddingVertical:10 },
  rowText:{ flex:1,gap:2 },
  tile:{ alignItems:"center",justifyContent:"center" },
  notice:{ flexDirection:"row",alignItems:"flex-start",gap:12,paddingHorizontal:16,paddingVertical:12 }
});

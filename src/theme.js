// Explicit palette for both Android and iOS when the user overrides Light/Dark.
// iOS platform semantic colors track the Appearance override and high contrast.
import { Platform, PlatformColor } from "react-native";

export function getColors(dark = false) {
  const ios = (semantic, light, darkValue) =>
    Platform.OS === "ios" ? PlatformColor(semantic) : (dark ? darkValue : light);
  return {
    ink: ios("label", "#1C1C1E", "#F5F5F7"),
    muted: ios("secondaryLabel", "#636366", "#A8A8AF"),
    bg: ios("systemGroupedBackground", "#F2F2F7", "#101114"),
    white: ios("secondarySystemGroupedBackground", "#FFFFFF", "#1C1C20"),
    border: ios("separator", "#D1D1D6", "#44444C"),
    teal: ios("systemBlue", "#007AFF", "#77B5FF"),
    tealLight: ios("tertiarySystemFill", "#E7F2FA", "#2A3644"),
    // Distinguishable report dates without implying an emergency warning level.
    timestamp: ios("systemIndigo", "#44449B", "#C6C3FF"),
    alert: ios("systemRed", "#D92D20", "#FF8174"),
    alertBg: ios("secondarySystemGroupedBackground", "#FFF2EF", "#352523"),
    yellow: "#FDECC9",
    success: ios("systemGreen", "#248A3D", "#30D158"),
    onAlert: "#FFFFFF",
    // Fixed emergency red: white text keeps >= 4.5:1 contrast in both themes.
    alarmBg: "#B3261E"
  };
}

// Default surface colors for utilities mounted outside the app theme provider.
export const COLORS = getColors(false);

// Apple HIG Dynamic Type default (Large) sizes, in points. React Native scales
// these with the user's text-size setting because allowFontScaling is on.
// https://developer.apple.com/design/human-interface-guidelines/typography
export const TYPE = {
  largeTitle:{ fontSize:34, lineHeight:41, fontWeight:"700" },
  title1:{ fontSize:28, lineHeight:34, fontWeight:"700" },
  title2:{ fontSize:22, lineHeight:28, fontWeight:"700" },
  title3:{ fontSize:20, lineHeight:25, fontWeight:"600" },
  headline:{ fontSize:17, lineHeight:22, fontWeight:"600" },
  body:{ fontSize:17, lineHeight:22 },
  callout:{ fontSize:16, lineHeight:21 },
  subhead:{ fontSize:15, lineHeight:20 },
  footnote:{ fontSize:13, lineHeight:18 },
  caption1:{ fontSize:12, lineHeight:16 }
};

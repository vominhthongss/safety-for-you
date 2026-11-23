// Explicit palette for both Android and iOS when the user overrides Light/Dark.
// iOS platform semantic colors track the Appearance override and high contrast.
import { DynamicColorIOS, Platform, PlatformColor } from "react-native";

export function getColors(dark = false) {
  const ios = (semantic, light, darkValue) =>
    Platform.OS === "ios" ? PlatformColor(semantic) : (dark ? darkValue : light);
  const adaptive = (light, darkValue, highContrastLight, highContrastDark) =>
    Platform.OS === "ios" ? DynamicColorIOS({ light, dark:darkValue,
      highContrastLight, highContrastDark }) : (dark ? darkValue : light);
  return {
    ink: ios("label", "#1C1C1E", "#F5F5F7"),
    muted: ios("secondaryLabel", "#636366", "#A8A8AF"),
    bg: ios("systemGroupedBackground", "#F2F2F7", "#101114"),
    white: ios("secondarySystemGroupedBackground", "#FFFFFF", "#1C1C20"),
    border: ios("separator", "#D1D1D6", "#44444C"),
    teal: adaptive("#005AC2", "#8BC2FF", "#004494", "#BEDCFF"),
    actionFill: adaptive("#005AC2", "#8BC2FF", "#004494", "#BEDCFF"),
    onAction: adaptive("#FFFFFF", "#10243A", "#FFFFFF", "#071625"),
    tealLight: ios("tertiarySystemFill", "#E7F2FA", "#2A3644"),
    time: adaptive("#4338CA", "#C7CFFF", "#302092", "#E4E7FF"),
    timeBg: adaptive("#EEF2FF", "#242443", "#FFFFFF", "#111128"),
    alert: ios("systemRed", "#D92D20", "#FF8174"),
    alertBg: ios("secondarySystemGroupedBackground", "#FFF2EF", "#352523"),
    yellow: "#FDECC9"
  };
}

// Default surface colors for utilities mounted outside the app theme provider.
export const COLORS = getColors(false);

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
    yellow: "#FDECC9"
  };
}

// Default surface colors for utilities mounted outside the app theme provider.
export const COLORS = getColors(false);

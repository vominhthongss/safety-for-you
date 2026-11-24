// app.config.js is dynamic, so `eas init` cannot write the EAS project ID here.
// The ID below is the linked EAS project @vominhthongss/safety-for-you; a fork
// can override it with EAS_PROJECT_ID (shell or eas.json build env).
// It is an identifier, not a secret.
const DEFAULT_EAS_PROJECT_ID = "c112d170-b9c9-46ee-9368-084cd57158b3";
const easProjectId = (process.env.EAS_PROJECT_ID || "").trim() || DEFAULT_EAS_PROJECT_ID;

module.exports = {
  expo: {
    name: "Safety For You",
    slug: "safety-for-you",
    owner: process.env.EXPO_OWNER || "vominhthongss",
    scheme: "safetyforyou",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.IOS_BUNDLE_ID || "com.vominhthongss.safetyforyou",
      infoPlist: { NSLocationWhenInUseUsageDescription: "Show your position and nearby emergency evacuation places." }
    },
    android: {
      package: process.env.ANDROID_PACKAGE || "com.vominhthongss.safetyforyou",
      adaptiveIcon: { backgroundColor: "#E8F5F4" },
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION", "VIBRATE", "POST_NOTIFICATIONS"],
      userInterfaceStyle: "automatic"
    },
    plugins: [
      ["expo-location", {
        locationWhenInUsePermission: "Show your location on hazard maps and find nearby evacuation places.",
        isAndroidBackgroundLocationEnabled: false,
        isIosBackgroundLocationEnabled: false
      }],
      // Local notifications only (alarm sound while the app is open); no push token.
      "expo-notifications",
      ["expo-splash-screen", {
        backgroundColor: "#E8F5F4",
        imageWidth: 160
      }]
    ],
    extra: {
      nonprofit: true,
      eas: { projectId: easProjectId }
    }
  }
};

module.exports = {
  expo: {
    name: "Safety For You",
    slug: "safety-for-you",
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
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      userInterfaceStyle: "automatic"
    },
    plugins: [
      ["expo-location", {
        locationWhenInUsePermission: "Show your location on hazard maps and find nearby evacuation places.",
        isAndroidBackgroundLocationEnabled: false,
        isIosBackgroundLocationEnabled: false
      }],
      ["expo-splash-screen", {
        backgroundColor: "#E8F5F4",
        imageWidth: 160
      }]
    ],
    extra: { nonprofit: true }
  }
};

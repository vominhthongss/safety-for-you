import { Platform, Vibration } from "react-native";
import * as Notifications from "expo-notifications";

// Local (on-device) notifications only. No push token is created, so no
// server, account or credential is involved. Detection runs while the app is
// in the foreground; Japan's official Emergency Alerts remain the primary
// channel when the app is closed.
const CHANNEL_ID="hazard-alarm";
// Repeating pattern (ms): wait, vibrate, pause, vibrate ... until dismissed.
const ALARM_PATTERN=[0,900,500,900,500,900,1200];

Notifications.setNotificationHandler({
  handleNotification:async()=>({
    shouldPlaySound:true,shouldSetBadge:false,shouldShowBanner:true,shouldShowList:true
  })
});

async function ensureChannel() {
  if(Platform.OS!=="android")return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID,{
    name:"Hazard alarm",
    importance:Notifications.AndroidImportance.MAX,
    sound:"default",
    vibrationPattern:ALARM_PATTERN,
    lockscreenVisibility:Notifications.AndroidNotificationVisibility.PUBLIC
  });
}
export async function getAlarmPermission() {
  try {
    const current=await Notifications.getPermissionsAsync();
    return current.granted ? "granted" : current.canAskAgain===false ? "denied" : "undetermined";
  } catch { return "denied"; }
}
// Called only after the user turns the alarm-sound switch on.
export async function requestAlarmPermission() {
  try {
    await ensureChannel();
    const current=await Notifications.getPermissionsAsync();
    if(current.granted)return "granted";
    const next=await Notifications.requestPermissionsAsync({
      ios:{allowAlert:true,allowSound:true,allowBadge:false}
    });
    return next.granted ? "granted" : "denied";
  } catch { return "denied"; }
}
export async function presentAlarm({title,body}) {
  try {
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      content:{title,body,sound:"default",
        priority:Notifications.AndroidNotificationPriority.MAX},
      trigger:Platform.OS==="android" ? {channelId:CHANNEL_ID} : null
    });
  } catch { /* the in-app alarm screen is still shown */ }
}
export function startAlarmVibration(repeat=true) {
  Vibration.vibrate(ALARM_PATTERN,repeat);
}
export function stopAlarmVibration() {
  Vibration.cancel();
}

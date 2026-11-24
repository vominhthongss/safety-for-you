#!/usr/bin/env bash
# Captures one store screenshot from the booted iOS Simulator or the connected
# Android device/emulator, with a clean status bar.
#
# Usage:
#   bash scripts/capture-store-screenshot.sh <slot> <name>
# Slots and the device to run:
#   iphone-6.9     iOS Simulator "iPhone 17 Pro Max" or "iPhone 16 Pro Max" (1320 x 2868)
#   iphone-6.5     iOS Simulator "iPhone 11 Pro Max" (1242 x 2688), optional
#   ipad-13        iOS Simulator "iPad Pro 13-inch (M4)" (2064 x 2752)
#   android-phone  Android emulator or device (e.g. Pixel, 1080 x 2400)
# Output: store/screenshots/<slot>/<name>.png
set -euo pipefail
slot="${1:-}"; name="${2:-}"
case "$slot" in iphone-6.9|iphone-6.5|ipad-13|android-phone) ;; *)
  echo "usage: $0 <iphone-6.9|iphone-6.5|ipad-13|android-phone> <name>" >&2; exit 2;; esac
[[ "$name" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "name: letters, digits, . _ - only" >&2; exit 2; }
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/store/screenshots/$slot/$name.png"
mkdir -p "$(dirname "$out")"
if [ "$slot" = "android-phone" ]; then
  command -v adb >/dev/null || { echo "adb not found (Android SDK platform-tools)" >&2; exit 1; }
  # System UI demo mode: fixed clock, full battery and signal, no notifications.
  adb shell settings put global sysui_demo_allowed 1
  adb shell am broadcast -a com.android.systemui.demo -e command enter >/dev/null
  adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0941 >/dev/null
  adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false >/dev/null
  adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 -e mobile show -e datatype none -e level 4 >/dev/null
  adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false >/dev/null
  sleep 1
  adb exec-out screencap -p > "$out"
  adb shell am broadcast -a com.android.systemui.demo -e command exit >/dev/null
else
  command -v xcrun >/dev/null || { echo "xcrun not found (requires macOS with Xcode)" >&2; exit 1; }
  xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100 \
    --cellularMode active --cellularBars 4 --wifiBars 3 --dataNetwork wifi
  sleep 1
  xcrun simctl io booted screenshot --type=png "$out"
  xcrun simctl status_bar booted clear
fi
echo "saved $out"
node "$root/scripts/check-store-screenshots.cjs" --quiet "$out" || true

import React from "react";
import { Pressable as NativePressable } from "react-native";

// Consistent tactile feedback without a motion effect or a new native module.
export default function Pressable({ style, disabled, accessibilityState, ...props }) {
  return <NativePressable {...props} disabled={disabled}
    accessibilityState={{ ...accessibilityState, disabled:!!disabled }}
    style={(state) => [typeof style === "function" ? style(state) : style,
      state.pressed && !disabled && { opacity:0.65 }]} />;
}

import React from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

type FeatherIconName = keyof typeof Feather.glyphMap;
type IoniconsIconName = keyof typeof Ionicons.glyphMap;

interface AppIconProps {
  name: FeatherIconName;
  size: number;
  color: string;
  style?: any;
}

const symbolMap: Record<string, string> = {
  "home": "⌂",
  "book-open": "≡",
  "calendar": "▦",
  "user": "●",
  "moon": "☽",
  "zap": "⚡",
  "cpu": "◎",
  "clock": "○",
  "feather": "✧",
  "wind": "~",
  "play": "▶",
  "pause": "❚❚",
  "x": "✕",
  "heart": "♥",
  "music": "♪",
  "skip-back": "◀◀",
  "skip-forward": "▶▶",
  "lock": "◈",
  "check": "✓",
  "chevron-right": "›",
  "chevron-left": "‹",
  "bell": "♪",
  "log-out": "→",
  "settings": "✦",
  "mail": "@",
  "info": "i",
  "credit-card": "▭",
  "sun": "☀",
  "sunrise": "☀",
  "sunset": "☀",
  "star": "★",
  "check-circle": "✓",
  "alert-circle": "!",
  "help-circle": "?",
  "plus": "+",
  "minus": "-",
  "search": "○",
  "edit": "✎",
  "trash": "✕",
  "share": "↗",
  "download": "↓",
  "upload": "↑",
  "refresh-cw": "↻",
  "volume-2": "♪",
  "volume-x": "♪",
  "mic": "●",
  "camera": "◎",
  "image": "▭",
  "file": "▭",
  "folder": "▭",
  "award": "★",
  "target": "◎",
  "activity": "≡",
  "trending-up": "↗",
  "eye": "◎",
  "eye-off": "○",
  "phone": "☎",
  "smartphone": "▭",
  "arrow-left": "←",
  "key": "◆",
  "headphones": "♪",
};

export function AppIcon({ name, size, color, style }: AppIconProps) {
  if (Platform.OS === "android") {
    const symbol = symbolMap[name] || "●";
    const fontSize = size * 0.7;
    
    // Play icon needs slight right offset to look centered
    const isPlay = name === "play";
    const offsetStyle = isPlay ? { paddingLeft: size * 0.08 } : {};
    
    return (
      <View style={[styles.container, { width: size, height: size }, offsetStyle, style]}>
        <Text 
          style={[
            styles.text, 
            { 
              fontSize, 
              lineHeight: size,
              color,
            }
          ]}
          allowFontScaling={false}
        >
          {symbol}
        </Text>
      </View>
    );
  }
  
  return <Feather name={name} size={size} color={color} style={style} />;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  text: {
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});

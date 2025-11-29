import { Platform } from "react-native";

const primaryLight = "#6B5B95";
const primaryDark = "#9575CD";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#6B6B6B",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B6B6B",
    tabIconSelected: primaryLight,
    link: primaryLight,
    primary: primaryLight,
    accent: "#9575CD",
    success: "#4CAF50",
    error: "#E53935",
    warning: "#FF9800",
    border: "#E0E0E0",
    backgroundRoot: "#FAFAFA", // Elevation 0
    backgroundDefault: "#FFFFFF", // Elevation 1
    backgroundSecondary: "#F5F5F5", // Elevation 2
    backgroundTertiary: "#EEEEEE", // Elevation 3
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#B0B0B0",
    tabIconSelected: primaryDark,
    link: primaryDark,
    primary: primaryDark,
    accent: "#6B5B95",
    success: "#66BB6A",
    error: "#EF5350",
    warning: "#FFB74D",
    border: "#2C2C2C",
    backgroundRoot: "#121212", // Elevation 0
    backgroundDefault: "#1E1E1E", // Elevation 1
    backgroundSecondary: "#252525", // Elevation 2
    backgroundTertiary: "#2C2C2C", // Elevation 3
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "500" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

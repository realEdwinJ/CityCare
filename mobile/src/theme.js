import { createContext, useContext, useState, useCallback } from "react";
import { useColorScheme } from "react-native";

// Design tokens ported verbatim from the CityCare design (light + dark).
const LIGHT = {
  dark: false,
  canvas: "#F2F2F7",
  surface: "#FFFFFF",
  surfaceRaised: "#FFFFFF",
  sheet: "#FFFFFF",
  card: "#F2F2F7",
  primary: "#1C1C1E",
  secondary: "rgba(60,60,67,0.6)",
  tertiary: "rgba(60,60,67,0.3)",
  separator: "rgba(60,60,67,0.18)",
  grabber: "rgba(60,60,67,0.3)",
  tabBarBg: "rgba(255,255,255,0.94)",
  segmentBg: "rgba(120,120,128,0.12)",
  mapBg: "#E9EDE7",
  mapBlock: "#DCE3DA",
  mapRoad: "#ffffff",
  stripeA: "#e5e7eb",
  stripeB: "#eef0f2",
};

const DARK = {
  dark: true,
  canvas: "#000000",
  surface: "#1C1C1E",
  surfaceRaised: "#2C2C2E",
  sheet: "#1C1C1E",
  card: "#2C2C2E",
  primary: "#FFFFFF",
  secondary: "rgba(235,235,245,0.6)",
  tertiary: "rgba(235,235,245,0.3)",
  separator: "rgba(84,84,88,0.4)",
  grabber: "rgba(255,255,255,0.3)",
  tabBarBg: "rgba(28,28,30,0.94)",
  segmentBg: "rgba(120,120,128,0.24)",
  mapBg: "#16181a",
  mapBlock: "#1f2226",
  mapRoad: "#2a2d31",
  stripeA: "#242426",
  stripeB: "#2c2c2e",
};

export const ACCENT = "#0A84FF";
export const INK = "#0B1F3A";
export const EMERGENCY = "#FF3B30";

export function severityMeta(severity, dark = false) {
  const key = String(severity || "MEDIUM").toUpperCase();
  return {
    CRITICAL: { label: "Critical", color: dark ? "#FF453A" : "#FF3B30" },
    MEDIUM: { label: "Medium", color: "#FF9F0A" },
    LIGHT: { label: "Light", color: "#8E8E93" },
  }[key] || { label: "Medium", color: "#FF9F0A" };
}

// Backend statuses → design labels/colors. Received → Reviewed (IN_PROGRESS) → Resolved.
export function statusMeta(status, dark = false) {
  const key = String(status || "RECEIVED").toUpperCase();
  return {
    RECEIVED: { label: "Received", color: "#0A84FF", step: 0 },
    IN_PROGRESS: { label: "Reviewed", color: "#FF9F0A", step: 1 },
    RESOLVED: { label: "Resolved", color: dark ? "#30D158" : "#34C759", step: 2 },
    REJECTED: { label: "Rejected", color: "#8E8E93", step: 1 },
    PENDING: { label: "Pending", color: "#FF9F0A", step: 0 },
  }[key] || { label: "Received", color: "#0A84FF", step: 0 };
}

// Theme context: resolves system scheme unless the user manually overrides it.
const ThemeContext = createContext({ t: LIGHT, dark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [override, setOverride] = useState(null); // null = follow system
  const dark = override ? override === "dark" : system === "dark";
  const t = dark ? DARK : LIGHT;
  const toggle = useCallback(() => setOverride(dark ? "light" : "dark"), [dark]);
  return <ThemeContext.Provider value={{ t, dark, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext).t; }
export function useThemeControl() { const c = useContext(ThemeContext); return { dark: c.dark, toggle: c.toggle }; }

export { LIGHT, DARK };

import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Path, Line } from "react-native-svg";
import { ACCENT, EMERGENCY, severityMeta, statusMeta, useThemeControl } from "../theme";

// Red SOS pill shown top-right on the main screens.
export function SosPill({ onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.sos}>
      <Text style={styles.sosText}>SOS</Text>
    </Pressable>
  );
}

// Circular light/dark toggle. Shows a moon in light mode (tap → dark) and a sun in dark mode.
export function ThemeToggle({ t }) {
  const { dark, toggle } = useThemeControl();
  const color = t.primary;
  return (
    <Pressable onPress={toggle} style={[styles.toggle, { backgroundColor: t.surface }]}>
      {dark ? (
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={4.5} fill="none" stroke={color} strokeWidth={1.8} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180;
            const x1 = 12 + Math.cos(r) * 7.5, y1 = 12 + Math.sin(r) * 7.5;
            const x2 = 12 + Math.cos(r) * 9.8, y2 = 12 + Math.sin(r) * 9.8;
            return <Line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.8} strokeLinecap="round" />;
          })}
        </Svg>
      ) : (
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path d="M20 14.5A8 8 0 019.5 4 7 7 0 1020 14.5z" fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
      )}
    </Pressable>
  );
}

// Right-hand header cluster: theme toggle + SOS pill.
export function HeaderActions({ t, onSos }) {
  return (
    <View style={styles.headerActions}>
      <ThemeToggle t={t} />
      <SosPill onPress={onSos} />
    </View>
  );
}

// Large iOS-style screen title row with an optional right slot (usually the SOS pill).
export function LargeTitle({ title, t, right }) {
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.title, { color: t.primary }]}>{title}</Text>
      {right}
    </View>
  );
}

export function SeverityBadge({ severity, t }) {
  const m = severityMeta(severity, t.dark);
  return (
    <View style={[styles.badge, { backgroundColor: m.color }]}>
      <Text style={styles.badgeText}>{m.label}</Text>
    </View>
  );
}

export function StatusPill({ status, t }) {
  const m = statusMeta(status, t.dark);
  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(m.color, 0.16) }]}>
      <Text style={[styles.badgeText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

// The Received → Reviewed → Resolved 3-dot timeline used on report cards + detail.
export function StatusTimeline({ status, t }) {
  const step = statusMeta(status, t.dark).step;
  const active = ACCENT;
  const idle = t.separator;
  const dot = (i) => (step >= i ? active : idle);
  const line = (i) => (step > i ? active : idle);
  return (
    <View>
      <View style={styles.timelineRow}>
        <View style={[styles.dot, { backgroundColor: dot(0) }]} />
        <View style={[styles.line, { backgroundColor: line(0) }]} />
        <View style={[styles.dot, { backgroundColor: dot(1) }]} />
        <View style={[styles.line, { backgroundColor: line(1) }]} />
        <View style={[styles.dot, { backgroundColor: dot(2) }]} />
      </View>
      <View style={styles.timelineLabels}>
        <Text style={[styles.timelineLabel, { color: t.tertiary }]}>Received</Text>
        <Text style={[styles.timelineLabel, { color: t.tertiary }]}>Reviewed</Text>
        <Text style={[styles.timelineLabel, { color: t.tertiary }]}>Resolved</Text>
      </View>
    </View>
  );
}

export function Segmented({ options, value, onChange, t }) {
  return (
    <View style={[styles.segment, { backgroundColor: t.segmentBg }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segmentBtn, active && { backgroundColor: ACCENT }]}
          >
            <Text style={[styles.segmentText, { color: active ? "#fff" : t.primary }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionLabel({ children, t }) {
  return <Text style={[styles.sectionLabel, { color: t.secondary }]}>{children}</Text>;
}

// Convert a hex color to an rgba() string at the given alpha.
export function withAlpha(hex, alpha) {
  if (!hex?.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  sos: { backgroundColor: EMERGENCY, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999 },
  sosText: { color: "#fff", fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
  toggle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.4 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  line: { flex: 1, height: 2 },
  timelineLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  timelineLabel: { fontSize: 10 },
  segment: { flexDirection: "row", borderRadius: 10, padding: 2 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  segmentText: { fontSize: 14, fontWeight: "600" },
  sectionLabel: { fontSize: 13, textTransform: "uppercase", paddingHorizontal: 20, marginBottom: 8, marginTop: 6 },
});

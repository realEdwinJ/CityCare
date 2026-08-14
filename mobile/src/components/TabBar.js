import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Rect, Path, Circle } from "react-native-svg";
import { useTheme, ACCENT } from "../theme";

function ReportIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Rect x={3} y={3} width={14} height={14} rx={3} fill="none" stroke={color} strokeWidth={1.7} />
      <Path d="M13 13l6-6M19 7v3M19 7h-3" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function MapIcon({ color }) {
  return <View style={[styles.mapPin, { backgroundColor: color }]} />;
}
function ParticipateIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Rect x={2} y={9} width={4} height={10} fill={color} />
      <Rect x={9} y={4} width={4} height={15} fill={color} />
      <Rect x={16} y={7} width={4} height={12} fill={color} />
    </Svg>
  );
}
function ActivityIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Circle cx={11} cy={11} r={8.5} fill="none" stroke={color} strokeWidth={1.7} />
      <Path d="M11 6v5l4 2" stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

const TABS = [
  { key: "report", label: "Report", Icon: ReportIcon },
  { key: "map", label: "Map", Icon: MapIcon },
  { key: "participate", label: "Participate", Icon: ParticipateIcon },
  { key: "activity", label: "Activity", Icon: ActivityIcon },
];

export default function TabBar({ active, onChange }) {
  const t = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: t.tabBarBg, borderTopColor: t.separator }]}>
      {TABS.map(({ key, label, Icon }) => {
        const color = key === active ? ACCENT : t.secondary;
        return (
          <Pressable key={key} onPress={() => onChange(key)} style={styles.item}>
            <Icon color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    paddingTop: 8, paddingBottom: 26, borderTopWidth: 0.5,
  },
  item: { alignItems: "center", gap: 3, width: 72 },
  label: { fontSize: 10, fontWeight: "600" },
  mapPin: { width: 15, height: 15, borderRadius: 999, borderBottomLeftRadius: 0, transform: [{ rotate: "-45deg" }] },
});

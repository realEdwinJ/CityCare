import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { fetchPublicReports, fetchReport, submitReport } from "../lib/api";
import { useTheme, ACCENT, EMERGENCY, severityMeta, statusMeta } from "../theme";
import { SeverityBadge, StatusPill, StatusTimeline, withAlpha, ThemeToggle } from "../components/ui";
import MapSurface from "../components/MapSurface";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "Water Leak", label: "Water" },
  { key: "Power Outage", label: "Power" },
  { key: "Pothole", label: "Roads" },
  { key: "Garbage", label: "Waste" },
];

function haversine(a, b) {
  const R = 6371000, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude), dLng = toRad(b.longitude - a.longitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function fmtDist(m) { return m == null ? "Windhoek" : m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`; }

export default function MapScreen({ onSos, onReportHere }) {
  const t = useTheme();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [userLoc, setUserLoc] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => { try { setReports(await fetchPublicReports()); } catch { /* keep */ } }, []);
  useEffect(() => { load(); }, [load]);

  async function locate() {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      const pos = await Location.getCurrentPositionAsync({});
      setUserLoc({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch { /* ignore */ }
  }

  async function openDetail(r) {
    setDetailLoading(true);
    setSelected({ ...r });
    try { const full = await fetchReport(r.id); setSelected((p) => ({ ...p, ...full })); }
    catch { /* use summary */ } finally { setDetailLoading(false); }
  }
  const openDetailById = useCallback((id) => {
    setReports((cur) => { const r = cur.find((x) => x.id === id); if (r) openDetail(r); return cur; });
  }, []);

  async function confirmSeeing() {
    if (!selected) return;
    try {
      await submitReport({ title: selected.title, description: "Confirmed by another citizen via map.", category: selected.category, latitude: selected.latitude, longitude: selected.longitude });
      await load();
      setSelected((p) => ({ ...p, duplicate_count: (p.duplicate_count || 1) + 1, confirmed: true }));
    } catch { /* ignore */ }
  }

  const filtered = reports.filter((r) => filter === "all" ? true : filter === "critical" ? r.severity === "CRITICAL" : r.category === filter);
  const nearby = [...filtered].map((r) => ({ ...r, dist: userLoc && r.latitude != null ? haversine(userLoc, r) : null }))
    .sort((a, b) => (a.dist != null && b.dist != null) ? a.dist - b.dist : (b.duplicate_count || 1) - (a.duplicate_count || 1))
    .slice(0, 8);

  const sheetHeight = expanded ? 420 : 200;

  return (
    <View style={{ flex: 1, backgroundColor: t.mapBg }}>
      <View style={styles.mapArea}>
        <View style={StyleSheet.absoluteFill}>
          <MapSurface reports={filtered} filter="all" dark={t.dark} userLoc={userLoc} onSelect={openDetailById} />
        </View>

        {/* filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterChip, { backgroundColor: active ? ACCENT : withAlpha(t.surface, 0.92) }]}>
                <Text style={[styles.filterText, { color: active ? "#fff" : t.primary }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* theme toggle + SOS */}
        <View style={styles.topRight}>
          <ThemeToggle t={t} />
          <Pressable onPress={onSos} style={styles.sosMap}><Text style={styles.sosMapText}>SOS</Text></Pressable>
        </View>

        {/* status legend */}
        <View style={[styles.legend, { backgroundColor: withAlpha(t.surface, 0.95) }]}>
          <LegendItem t={t} label="Received" />
          <LegendItem t={t} label="Reviewed" ring />
          <LegendItem t={t} label="Resolved" check />
        </View>

        <Pressable onPress={locate} style={[styles.locate, { backgroundColor: t.surface, bottom: sheetHeight + 68 }]}>
          <View style={styles.locateRing} /><View style={styles.locateCore} />
        </Pressable>
        <Pressable onPress={() => onReportHere?.({ coords: userLoc })} style={[styles.fab, { bottom: sheetHeight + 14 }]}>
          <Text style={styles.fabPlus}>＋</Text><Text style={styles.fabText}>Report here</Text>
        </Pressable>
      </View>

      {/* bottom sheet */}
      <View style={[styles.sheet, { height: sheetHeight, backgroundColor: t.sheet }]}>
        <Pressable onPress={() => setExpanded((e) => !e)} style={styles.grabWrap}><View style={[styles.grab, { backgroundColor: t.grabber }]} /></Pressable>
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: t.primary }]}>Nearby reports</Text>
          <Text onPress={() => setExpanded((e) => !e)} style={styles.sheetToggle}>{expanded ? "Collapse" : "See all"}</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 10 }}>
          {nearby.length === 0 && <Text style={{ color: t.secondary, paddingVertical: 20 }}>No reports match this filter.</Text>}
          {nearby.map((r) => {
            const m = severityMeta(r.severity, t.dark);
            const sm = statusMeta(r.status, t.dark);
            return (
              <Pressable key={r.id} onPress={() => openDetail(r)} style={[styles.reportCard, { backgroundColor: t.card }]}>
                <View style={[styles.reportIcon, { backgroundColor: m.color }]}><Text style={styles.reportInitial}>{(r.category || "?")[0]}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={[styles.reportTitle, { color: t.primary }]}>{r.title}</Text>
                  <Text style={[styles.reportMeta, { color: t.secondary }]}>{fmtDist(r.dist)} · {sm.label} · {r.duplicate_count || 1} reported</Text>
                </View>
                <View style={[styles.reportDot, { backgroundColor: m.color }]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* pin detail */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.detailBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setSelected(null)} />
          <View style={[styles.detailSheet, { backgroundColor: t.sheet }]}>
            <Pressable onPress={() => setSelected(null)} style={styles.grabWrap}><View style={[styles.grab, { backgroundColor: t.grabber }]} /></Pressable>
            {selected && (
              <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6 }}>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  <SeverityBadge severity={selected.severity || selected.severity_final} t={t} />
                  <StatusPill status={selected.status} t={t} />
                </View>
                <Text style={[styles.detailTitle, { color: t.primary }]}>{selected.title}</Text>
                <Text style={[styles.detailAddr, { color: t.secondary }]}>{selected.address_text || "Windhoek"}</Text>
                {detailLoading ? <ActivityIndicator style={{ marginVertical: 16 }} color={ACCENT} /> : (
                  <Text style={[styles.detailSummary, { color: t.primary, backgroundColor: t.card }]}>{selected.description || selected.ai_summary || "A citizen reported this issue in this area."}</Text>
                )}
                <View style={{ marginBottom: 18 }}><StatusTimeline status={selected.status} t={t} /></View>
                <View style={styles.avatarRow}>
                  <View style={{ flexDirection: "row" }}>
                    {["#8E8E93", "#6b6b70", "#4a4a4d"].map((c, i) => (<View key={i} style={[styles.avatar, { backgroundColor: c, borderColor: t.sheet, marginLeft: i ? -8 : 0 }]} />))}
                  </View>
                  <Text style={{ color: t.secondary, fontSize: 14 }}>{selected.duplicate_count || 1} citizens reported this</Text>
                </View>
                <Pressable onPress={confirmSeeing} disabled={selected.confirmed} style={[styles.detailBtn, { backgroundColor: selected.confirmed ? t.card : ACCENT }]}>
                  <Text style={[styles.detailBtnText, { color: selected.confirmed ? t.secondary : "#fff" }]}>{selected.confirmed ? "Thanks — recorded" : "I'm seeing this too"}</Text>
                </Pressable>
                <Pressable onPress={() => { const s = selected; setSelected(null); onReportHere?.({ category: s.category, coords: { latitude: s.latitude, longitude: s.longitude } }); }} style={styles.detailBtnGhost}>
                  <Text style={[styles.detailBtnText, { color: ACCENT }]}>Report a new issue here</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LegendItem({ t, label, ring, check }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: "#8E8E93" }]}>
        {ring && <View style={styles.legendRing} />}
        {check && <Text style={styles.legendCheck}>✓</Text>}
      </View>
      <Text style={[styles.legendText, { color: t.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapArea: { flex: 1, overflow: "hidden" },
  filters: { position: "absolute", top: 60, left: 16, right: 16, maxHeight: 40, zIndex: 5 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  filterText: { fontSize: 14, fontWeight: "600" },
  topRight: { position: "absolute", top: 12, right: 16, flexDirection: "row", alignItems: "center", gap: 8, zIndex: 6 },
  sosMap: { backgroundColor: EMERGENCY, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999 },
  sosMapText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  legend: { position: "absolute", bottom: 8, left: 16, flexDirection: "row", gap: 12, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, zIndex: 5 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  legendRing: { width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: "#fff" },
  legendCheck: { color: "#fff", fontSize: 8, fontWeight: "800" },
  legendText: { fontSize: 10, fontWeight: "600" },
  locate: { position: "absolute", right: 16, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, elevation: 4, zIndex: 5 },
  locateRing: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.6, borderColor: ACCENT },
  locateCore: { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: ACCENT },
  fab: { position: "absolute", right: 16, height: 50, paddingHorizontal: 20, borderRadius: 25, backgroundColor: ACCENT, flexDirection: "row", alignItems: "center", gap: 6, shadowColor: ACCENT, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6, zIndex: 5, justifyContent: "center" },
  fabPlus: { color: "#fff", fontSize: 20 },
  fabText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: -6 }, elevation: 10 },
  grabWrap: { paddingTop: 9, paddingBottom: 4, alignItems: "center" },
  grab: { width: 36, height: 5, borderRadius: 3 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 10 },
  sheetTitle: { fontSize: 20, fontWeight: "700" },
  sheetToggle: { fontSize: 13, color: ACCENT, fontWeight: "600" },
  reportCard: { borderRadius: 16, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" },
  reportIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reportInitial: { color: "#fff", fontSize: 12, fontWeight: "700" },
  reportTitle: { fontSize: 15, fontWeight: "600" },
  reportMeta: { fontSize: 12, marginTop: 2 },
  reportDot: { width: 8, height: 8, borderRadius: 4 },
  detailBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  detailSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%" },
  detailTitle: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  detailAddr: { fontSize: 14, marginBottom: 14 },
  detailSummary: { fontSize: 16, lineHeight: 22, borderRadius: 16, padding: 14, marginBottom: 16 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  avatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  detailBtn: { height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  detailBtnGhost: { height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  detailBtnText: { fontSize: 16, fontWeight: "600" },
});

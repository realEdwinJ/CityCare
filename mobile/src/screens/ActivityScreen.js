import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { getHistory } from "../lib/storage";
import { syncPending, refreshReportStatuses } from "../lib/sync";
import { useTheme, ACCENT, statusMeta } from "../theme";
import { LargeTitle, StatusTimeline, withAlpha } from "../components/ui";

export default function ActivityScreen({ refreshKey, onChanged }) {
  const t = useTheme();
  const [history, setHistory] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => setHistory(await getHistory()), []);
  const sync = useCallback(async () => {
    setSyncing(true);
    await syncPending();
    await refreshReportStatuses();
    await load();
    onChanged?.();
    setSyncing(false);
  }, [load, onChanged]);

  useEffect(() => { load(); }, [load, refreshKey]);
  useEffect(() => { sync(); /* eslint-disable-next-line */ }, [refreshKey]);

  const pending = history.filter((h) => h.status === "PENDING").length;

  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={sync} />}
      >
        <LargeTitle
          title="Activity" t={t}
          right={
            <Pressable onPress={sync} style={[styles.syncBtn, { backgroundColor: t.surface }]}>
              {syncing ? <ActivityIndicator size="small" color={ACCENT} /> : <Text style={{ color: ACCENT, fontSize: 16 }}>⟳</Text>}
            </Pressable>
          }
        />

        {pending > 0 && (
          <Pressable style={styles.pendingBanner} onPress={sync}>
            <Text style={styles.pendingText}>Some items are waiting to send</Text>
            <Text style={styles.pendingRetry}>Retry now</Text>
          </Pressable>
        )}

        {history.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📥</Text>
            <Text style={[styles.emptyTitle, { color: t.primary }]}>No activity yet</Text>
            <Text style={[styles.emptySub, { color: t.secondary }]}>Your reports and feedback will appear here.</Text>
          </View>
        ) : (
          <View style={[styles.group, { backgroundColor: t.surface }]}>
            {history.map((h, i) => {
              const isReport = h.type === "Report";
              const status = isReport ? (h.serverStatus || "RECEIVED") : h.status;
              const sm = statusMeta(h.status === "PENDING" ? "PENDING" : status, t.dark);
              return (
                <View key={h.id} style={[styles.row, i < history.length - 1 && { borderBottomColor: t.separator, borderBottomWidth: 0.5 }]}>
                  <View style={styles.rowHead}>
                    <Text style={[styles.kind, { color: t.secondary }]}>{h.type}</Text>
                    <View style={[styles.statusChip, { backgroundColor: withAlpha(sm.color, 0.16) }]}>
                      <Text style={[styles.statusChipText, { color: sm.color }]}>{h.status === "PENDING" ? "Pending" : sm.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.rowTitle, { color: t.primary }]}>{h.title}</Text>
                  <Text numberOfLines={1} style={[styles.rowSub, { color: t.secondary }]}>{h.subtitle}</Text>
                  <Text style={[styles.rowDate, { color: t.tertiary }]}>{fmt(h.createdAt)}</Text>
                  {isReport && h.status !== "PENDING" && (
                    <View style={{ marginTop: 10 }}><StatusTimeline status={status} t={t} /></View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) +
    " at " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  syncBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  pendingBanner: { marginHorizontal: 16, marginTop: 6, marginBottom: 14, backgroundColor: "#FF9F0A", borderRadius: 14, padding: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pendingText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  pendingRetry: { color: "#fff", fontSize: 14, fontWeight: "700" },
  emptyWrap: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "600", marginBottom: 6 },
  emptySub: { fontSize: 14, textAlign: "center" },
  group: { marginHorizontal: 16, borderRadius: 20, overflow: "hidden" },
  row: { padding: 16 },
  rowHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  kind: { flex: 1, fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  statusChip: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  statusChipText: { fontSize: 12, fontWeight: "700" },
  rowTitle: { fontSize: 17, fontWeight: "600", marginBottom: 2 },
  rowSub: { fontSize: 14, marginBottom: 6 },
  rowDate: { fontSize: 12 },
});

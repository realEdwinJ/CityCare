import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, AppState } from "react-native";
import { StatusBar } from "expo-status-bar";

import TabBar from "./src/components/TabBar";
import EmergencySheet from "./src/components/EmergencySheet";
import ReportScreen from "./src/screens/ReportScreen";
import MapScreen from "./src/screens/MapScreen";
import ParticipateScreen from "./src/screens/ParticipateScreen";
import ActivityScreen from "./src/screens/ActivityScreen";
import ProfileSetup from "./src/screens/ProfileSetup";
import { getProfile } from "./src/lib/profile";
import { syncPending } from "./src/lib/sync";
import { useTheme, ThemeProvider } from "./src/theme";

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

function AppInner() {
  const t = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [tab, setTab] = useState("report");
  const [sosOpen, setSosOpen] = useState(false);
  const [reportPrefill, setReportPrefill] = useState(null);
  const [reportKey, setReportKey] = useState(0);
  const [activityKey, setActivityKey] = useState(0);

  useEffect(() => {
    (async () => { setProfile(await getProfile()); setLoading(false); })();
  }, []);

  // Retry offline drafts when the app returns to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") syncPending(); });
    return () => sub.remove();
  }, []);

  const bumpActivity = useCallback(() => setActivityKey((k) => k + 1), []);
  const openSos = useCallback(() => setSosOpen(true), []);

  const goReportHere = useCallback((prefill) => {
    setReportPrefill(prefill || null);
    setReportKey((k) => k + 1);
    setTab("report");
  }, []);

  if (loading) {
    return <View style={[styles.center, { backgroundColor: t.canvas }]}><ActivityIndicator size="large" color="#0A84FF" /></View>;
  }

  if (!profile || editingProfile) {
    return (
      <ProfileSetup
        existing={editingProfile ? profile : null}
        onSaved={(p) => { setProfile(p); setEditingProfile(false); }}
        onCancel={editingProfile ? () => setEditingProfile(false) : null}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.canvas }]}>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <View style={styles.screen}>
        {tab === "report" && (
          <ReportScreen
            key={reportKey}
            profile={profile}
            prefill={reportPrefill}
            onEditProfile={() => setEditingProfile(true)}
            onSubmitted={bumpActivity}
            onSos={openSos}
          />
        )}
        {tab === "map" && <MapScreen onSos={openSos} onReportHere={goReportHere} />}
        {tab === "participate" && <ParticipateScreen profile={profile} onSubmitted={bumpActivity} onSos={openSos} />}
        {tab === "activity" && <ActivityScreen refreshKey={activityKey} onChanged={() => {}} />}
      </View>
      <TabBar active={tab} onChange={setTab} />
      <EmergencySheet visible={sosOpen} onClose={() => setSosOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});

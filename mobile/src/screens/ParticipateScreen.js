import { useEffect, useState, useCallback } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator, Modal, RefreshControl,
} from "react-native";
import { fetchLaws, fetchMinistries, submitLawComment, submitSuggestion } from "../lib/api";
import { addHistoryEntry } from "../lib/storage";
import { useTheme, ACCENT } from "../theme";
import { HeaderActions, LargeTitle, Segmented } from "../components/ui";

export default function ParticipateScreen({ profile, onSubmitted, onSos }) {
  const t = useTheme();
  const [segment, setSegment] = useState("laws");
  const [laws, setLaws] = useState(null);
  const [ministries, setMinistries] = useState(null);
  const [law, setLaw] = useState(null);       // open law detail
  const [ministry, setMinistry] = useState(null); // open suggestion form
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setLaws(await fetchLaws()); } catch { setLaws([]); }
    try { setMinistries(await fetchMinistries()); } catch { setMinistries([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  if (law) return <LawDetail law={law} profile={profile} t={t} onBack={() => setLaw(null)} onSubmitted={onSubmitted} />;
  if (ministry) return <SuggestionForm ministry={ministry} profile={profile} t={t} onBack={() => setMinistry(null)} onSubmitted={onSubmitted} />;

  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LargeTitle title="Participate" t={t} right={<HeaderActions t={t} onSos={onSos} />} />
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18 }}>
          <Segmented
            t={t} value={segment} onChange={setSegment}
            options={[{ value: "laws", label: "Laws" }, { value: "ministries", label: "Ministries" }]}
          />
        </View>

        {segment === "laws" ? (
          laws === null ? <ActivityIndicator style={{ marginTop: 30 }} color={ACCENT} /> : (
            <View style={[styles.group, { backgroundColor: t.surface }]}>
              {laws.length === 0 && <Text style={[styles.empty, { color: t.secondary }]}>No laws published yet.</Text>}
              {laws.map((l, i) => (
                <Pressable key={l.id} onPress={() => setLaw(l)} style={[styles.lawRow, i < laws.length - 1 && { borderBottomColor: t.separator, borderBottomWidth: 0.5 }]}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.lawTitle, { color: t.primary }]}>{l.title}</Text>
                    <Text style={{ color: t.tertiary, fontSize: 18 }}>›</Text>
                  </View>
                  <Text numberOfLines={2} style={[styles.lawSummary, { color: t.secondary }]}>{l.summary}</Text>
                  <Text style={[styles.lawMeta, { color: t.secondary }]}>★ 4.2 · Public input open</Text>
                </Pressable>
              ))}
            </View>
          )
        ) : (
          ministries === null ? <ActivityIndicator style={{ marginTop: 30 }} color={ACCENT} /> : (
            <View style={[styles.group, { backgroundColor: t.surface }]}>
              {ministries.length === 0 && <Text style={[styles.empty, { color: t.secondary }]}>No ministries available.</Text>}
              {ministries.map((m, i) => (
                <Pressable key={m.id} onPress={() => setMinistry(m)} style={[styles.minRow, i < ministries.length - 1 && { borderBottomColor: t.separator, borderBottomWidth: 0.5 }]}>
                  <View style={styles.minCode}><Text style={styles.minCodeText}>{m.code}</Text></View>
                  <Text style={[styles.minName, { color: t.primary }]}>{m.name}</Text>
                  <Text style={{ color: t.tertiary, fontSize: 18 }}>›</Text>
                </Pressable>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

function LawDetail({ law, profile, t, onBack, onSubmitted }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit() {
    setSubmitting(true);
    const payload = { lawId: law.id, rating: rating || null, commentText: comment, commenterName: profile?.fullName };
    const subtitle = `My comment is that ${comment.slice(0, 40)}${comment.length > 40 ? "…" : ""}`;
    try {
      await submitLawComment(law.id, payload);
      await addHistoryEntry({ type: "Feedback", title: law.title, subtitle, createdAt: new Date().toISOString(), status: "SYNCED", payload: null });
      setSaved(true);
    } catch {
      await addHistoryEntry({ type: "Feedback", title: law.title, subtitle, createdAt: new Date().toISOString(), status: "PENDING", payload });
      setSaved(true);
    } finally { setSubmitting(false); onSubmitted?.(); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <NavHeader title={law.title} t={t} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={[styles.detailLabel, { color: t.secondary }]}>{law.title}</Text>
        <Text style={[styles.detailBody, { color: t.primary, backgroundColor: t.surface }]}>{law.summary}</Text>
        <Text style={[styles.detailSentiment, { color: t.secondary }]}>Public input open · your voice counts</Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)}>
              <Text style={[styles.star, { color: n <= rating ? "#FF9F0A" : t.tertiary }]}>★</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.detailLabel, { color: t.secondary }]}>Your comment</Text>
        <TextInput
          style={[styles.textareaLg, { backgroundColor: t.surface, color: t.primary }]}
          placeholder="Share your view…" placeholderTextColor={t.tertiary}
          value={comment} onChangeText={setComment} multiline
        />
        <Pressable style={[styles.primaryBtn, { opacity: comment.trim() && !submitting ? 1 : 0.5 }]} onPress={submit} disabled={!comment.trim() || submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Submit feedback</Text>}
        </Pressable>
      </ScrollView>
      <SavedDialog visible={saved} t={t} title="Feedback saved" body={`Your feedback on ${law.title} is being uploaded.`} onClose={onBack} />
    </View>
  );
}

function SuggestionForm({ ministry, profile, t, onBack, onSubmitted }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const canSend = subject.trim() && body.trim() && !submitting;

  async function send() {
    setSubmitting(true);
    const payload = { ministryId: ministry.id, subject, content: body, reporterName: profile?.fullName, reporterPhone: profile?.phoneNumber };
    const local = await addHistoryEntry({ type: "Suggestion", title: ministry.name, subtitle: subject, createdAt: new Date().toISOString(), status: "PENDING", payload });
    try {
      await submitSuggestion(payload);
      const { updateHistoryEntry } = await import("../lib/storage");
      await updateHistoryEntry(local.id, { status: "SYNCED", payload: null });
    } catch { /* stays pending */ } finally { setSubmitting(false); setSaved(true); onSubmitted?.(); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <NavHeader title={ministry.code} t={t} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={[styles.suggestName, { color: t.primary }]}>{ministry.name}</Text>
        <Text style={[styles.detailSentiment, { color: t.secondary, marginBottom: 20 }]}>Send a suggestion directly to this ministry.</Text>
        <View style={[styles.group, { backgroundColor: t.surface, marginHorizontal: 0, paddingHorizontal: 16, marginBottom: 20 }]}>
          <TextInput style={[styles.inputRow, { color: t.primary }]} placeholder="Subject" placeholderTextColor={t.tertiary} value={subject} onChangeText={setSubject} />
        </View>
        <TextInput style={[styles.textareaLg, { backgroundColor: t.surface, color: t.primary }]} placeholder="Your proposal…" placeholderTextColor={t.tertiary} value={body} onChangeText={setBody} multiline />
        <Pressable style={[styles.primaryBtn, { opacity: canSend ? 1 : 0.5 }]} onPress={send} disabled={!canSend}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send to ministry</Text>}
        </Pressable>
      </ScrollView>
      <SavedDialog visible={saved} t={t} title="Suggestion sent" body={`${ministry.name} will review your proposal.`} onClose={onBack} />
    </View>
  );
}

function NavHeader({ title, t, onBack }) {
  return (
    <View style={styles.navHeader}>
      <Pressable onPress={onBack} style={styles.backBtn}><Text style={[styles.backChevron, { color: t.primary }]}>‹</Text></Pressable>
      <Text numberOfLines={1} style={[styles.navTitle, { color: t.primary }]}>{title}</Text>
    </View>
  );
}

function SavedDialog({ visible, t, title, body, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogBackdrop}>
        <View style={[styles.dialog, { backgroundColor: t.surfaceRaised }]}>
          <Text style={[styles.dialogTitle, { color: t.primary }]}>{title}</Text>
          <Text style={[styles.dialogBody, { color: t.secondary }]}>{body}</Text>
          <Pressable style={[styles.dialogBtn, { backgroundColor: t.canvas }]} onPress={onClose}>
            <Text style={styles.dialogBtnText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  group: { marginHorizontal: 16, borderRadius: 20, overflow: "hidden" },
  empty: { padding: 24, textAlign: "center" },
  lawRow: { padding: 16 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  lawTitle: { fontSize: 17, fontWeight: "600" },
  lawSummary: { fontSize: 14, lineHeight: 19, marginBottom: 6 },
  lawMeta: { fontSize: 13 },
  minRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  minCode: { width: 34, height: 34, borderRadius: 9, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  minCodeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  minName: { flex: 1, fontSize: 16, fontWeight: "600" },
  navHeader: { flexDirection: "row", alignItems: "center", paddingTop: 60, paddingBottom: 14, paddingHorizontal: 8, position: "relative" },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", zIndex: 2 },
  backChevron: { fontSize: 32, fontWeight: "300", marginTop: -4 },
  navTitle: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 17, fontWeight: "600" },
  detailLabel: { fontSize: 13, textTransform: "uppercase", marginBottom: 8, marginTop: 4 },
  detailBody: { fontSize: 16, lineHeight: 22, borderRadius: 18, padding: 16, marginBottom: 8 },
  detailSentiment: { fontSize: 13, marginBottom: 24 },
  stars: { flexDirection: "row", gap: 6, marginBottom: 24 },
  star: { fontSize: 30 },
  textareaLg: { minHeight: 120, borderRadius: 18, padding: 16, fontSize: 17, marginBottom: 20, textAlignVertical: "top" },
  primaryBtn: { height: 50, borderRadius: 14, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  suggestName: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  inputRow: { fontSize: 17, paddingVertical: 14 },
  dialogBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
  dialog: { borderRadius: 20, padding: 24, width: 260, alignItems: "center" },
  dialogTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  dialogBody: { fontSize: 14, lineHeight: 19, textAlign: "center", marginBottom: 18 },
  dialogBtn: { alignSelf: "stretch", height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dialogBtnText: { color: ACCENT, fontSize: 16, fontWeight: "600" },
});

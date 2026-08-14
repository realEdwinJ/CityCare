import { useState } from "react";
import {
  View, Text, TextInput, ScrollView, Pressable, Image, StyleSheet, Alert, ActivityIndicator, Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { submitReport } from "../lib/api";
import { addHistoryEntry, updateHistoryEntry } from "../lib/storage";
import { useTheme, ACCENT, severityMeta } from "../theme";
import { HeaderActions, SectionLabel } from "../components/ui";

const CATEGORIES = ["Pothole", "Water Leak", "Power Outage", "Traffic Light", "Streetlight", "Garbage", "Other"];
const SUBURBS = [
  "Windhoek Central", "Klein Windhoek", "Katutura", "Khomasdal", "Eros",
  "Pioneers Park", "Olympia", "Academia", "Wanaheda", "Havana", "Dorado Park",
];

export default function ReportScreen({ profile, onEditProfile, onSubmitted, onSos, prefill }) {
  const t = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(prefill?.category || CATEGORIES[0]);
  const [photo, setPhoto] = useState(null);
  const [coords, setCoords] = useState(prefill?.coords || null);
  const [addressText, setAddressText] = useState(prefill?.addressText || "");
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const suggestions = addressText.length > 0
    ? SUBURBS.filter((s) => s.toLowerCase().includes(addressText.toLowerCase()) && s.toLowerCase() !== addressText.toLowerCase()).slice(0, 4)
    : [];

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !submitting;

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Photo library access is needed to attach a photo.");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!result.canceled) setPhoto(result.assets[0]);
  }

  async function fetchLocation() {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return Alert.alert("Permission needed", "Location access is needed to attach the report's position.");
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch (e) {
      Alert.alert("Couldn't get location", String(e.message || e));
    } finally {
      setLocating(false);
    }
  }

  function reset() {
    setTitle(""); setDescription(""); setPhoto(null); setCoords(null); setAddressText(""); setCategory(CATEGORIES[0]);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload = {
      title, description, category,
      latitude: coords?.latitude, longitude: coords?.longitude,
      addressText: addressText || undefined, photo,
      reporterName: profile?.fullName, reporterPhone: profile?.phoneNumber,
    };
    const local = await addHistoryEntry({
      type: "Report", title, subtitle: category, createdAt: new Date().toISOString(), status: "PENDING", payload,
    });
    try {
      const result = await submitReport(payload);
      await updateHistoryEntry(local.id, { status: "SYNCED", serverId: result.id, serverStatus: result.status, payload: null });
      setSuccess({
        severity: result.severity_final,
        summary: result.ai_summary,
        merged: result.merged,
        count: result.duplicate_count,
      });
      reset();
    } catch (e) {
      Alert.alert("Saved offline", "Couldn't reach the server, so this report was saved as a draft. Pull down on Activity to retry.");
      reset();
    } finally {
      setSubmitting(false);
      onSubmitted?.();
    }
  }

  const sev = success ? severityMeta(success.severity, t.dark) : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.h1, { color: t.primary }]}>Report an issue</Text>
          <HeaderActions t={t} onSos={onSos} />
        </View>
        {profile && (
          <Text style={[styles.identity, { color: t.secondary }]}>
            Reporting as <Text style={{ color: t.primary, fontWeight: "600" }}>{profile.fullName}</Text>
            {"  ·  "}
            <Text style={{ color: ACCENT }} onPress={onEditProfile}>edit</Text>
          </Text>
        )}

        <SectionLabel t={t}>Details</SectionLabel>
        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <TextInput
            style={[styles.input, { color: t.primary, borderBottomColor: t.separator, borderBottomWidth: 0.5 }]}
            placeholder="Title" placeholderTextColor={t.tertiary} value={title} onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textarea, { color: t.primary, borderBottomColor: t.separator, borderBottomWidth: 0.5 }]}
            placeholder="Description" placeholderTextColor={t.tertiary} value={description} onChangeText={setDescription} multiline
          />
          <View style={styles.categoryRow}>
            <Text style={[styles.categoryLabel, { color: t.primary }]}>Category</Text>
            <Text style={{ color: t.secondary, fontSize: 17 }}>{category}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, { backgroundColor: active ? ACCENT : t.surface }]}>
                <Text style={[styles.chipText, { color: active ? "#fff" : t.primary }]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionLabel t={t}>Photo</SectionLabel>
        <View style={[styles.card, { backgroundColor: t.surface, paddingVertical: 0 }]}>
          <Pressable style={styles.rowAction} onPress={pickPhoto}>
            <Text style={styles.link}>{photo ? "Change photo" : "Select photo"}</Text>
          </Pressable>
          {photo && <Image source={{ uri: photo.uri }} style={styles.photo} />}
        </View>

        <SectionLabel t={t}>Location</SectionLabel>
        <View style={[styles.card, { backgroundColor: t.surface, paddingVertical: 0, overflow: "visible" }]}>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[styles.input, { color: t.primary, paddingHorizontal: 0 }]}
              placeholder="Type an address to search…" placeholderTextColor={t.tertiary}
              value={addressText} onChangeText={setAddressText}
            />
            {suggestions.length > 0 && (
              <View style={[styles.suggestions, { backgroundColor: t.surfaceRaised }]}>
                {suggestions.map((s, i) => (
                  <Pressable
                    key={s} onPress={() => setAddressText(s)}
                    style={[styles.suggestion, i < suggestions.length - 1 && { borderBottomColor: t.separator, borderBottomWidth: 0.5 }]}
                  >
                    <Text style={{ color: t.primary, fontSize: 15 }}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          <Pressable style={[styles.rowAction, { borderTopColor: t.separator, borderTopWidth: 0.5 }]} onPress={fetchLocation}>
            {locating ? <ActivityIndicator color={ACCENT} /> : <Text style={styles.link}>Use my location</Text>}
          </Pressable>
          {coords && (
            <View style={[styles.locPreview, { borderTopColor: t.separator, borderTopWidth: 0.5 }]}>
              <View style={[styles.miniMap, { backgroundColor: t.mapBg }]}>
                <View style={[styles.miniRoad, { backgroundColor: t.mapRoad }]} />
                <View style={styles.miniPin} />
              </View>
              <Text style={[styles.coords, { color: t.secondary }]}>{coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Pressable style={[styles.submit, { opacity: canSubmit ? 1 : 0.5 }]} onPress={handleSubmit} disabled={!canSubmit}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit report</Text>}
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={!!success} transparent animationType="fade" onRequestClose={() => setSuccess(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.successCard, { backgroundColor: t.surfaceRaised }]}>
            <View style={styles.check}><Text style={{ fontSize: 30 }}>✓</Text></View>
            <Text style={[styles.successTitle, { color: t.primary }]}>Thanks — that's on its way</Text>
            {sev && (
              <Text style={[styles.successBody, { color: t.secondary }]}>
                Classified as <Text style={{ fontWeight: "700", color: sev.color }}>{sev.label}</Text> priority.
                {success.merged ? `\n${success.count} citizens have now reported this.` : ""}
                {success.summary ? `\n\n${success.summary}` : ""}
              </Text>
            )}
            <Pressable style={styles.successBtn} onPress={() => setSuccess(null)}>
              <Text style={styles.successBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 60, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 2 },
  h1: { fontSize: 30, fontWeight: "800", letterSpacing: -0.4 },
  identity: { paddingHorizontal: 20, paddingBottom: 12, fontSize: 14 },
  card: { marginHorizontal: 16, marginBottom: 20, borderRadius: 20, paddingHorizontal: 16, overflow: "hidden" },
  input: { fontSize: 17, paddingVertical: 14 },
  textarea: { minHeight: 84, textAlignVertical: "top" },
  categoryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  categoryLabel: { fontSize: 17, fontWeight: "600" },
  chipRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999 },
  chipText: { fontSize: 14, fontWeight: "600" },
  rowAction: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  link: { color: ACCENT, fontSize: 17, fontWeight: "500" },
  photo: { width: "100%", height: 160, borderRadius: 16, marginBottom: 16 },
  suggestions: { position: "absolute", left: 0, right: 0, top: 48, borderRadius: 14, zIndex: 10, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  suggestion: { paddingVertical: 12, paddingHorizontal: 14 },
  locPreview: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  miniMap: { width: 52, height: 52, borderRadius: 12, overflow: "hidden" },
  miniRoad: { position: "absolute", top: 8, left: 0, right: 0, height: 2 },
  miniPin: { position: "absolute", top: "40%", left: "44%", width: 8, height: 8, backgroundColor: ACCENT, borderRadius: 4, borderWidth: 1.5, borderColor: "#fff" },
  coords: { fontSize: 14, fontFamily: "monospace" },
  submit: { height: 50, borderRadius: 14, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  successCard: { borderRadius: 24, padding: 24, width: 300, alignItems: "center" },
  check: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: "#34C759", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  successTitle: { fontSize: 19, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  successBody: { fontSize: 14, textAlign: "center", marginBottom: 18, lineHeight: 19 },
  successBtn: { alignSelf: "stretch", height: 44, borderRadius: 12, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

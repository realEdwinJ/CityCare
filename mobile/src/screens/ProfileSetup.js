import { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { saveProfile } from "../lib/profile";
import { useTheme, ACCENT } from "../theme";
import { withAlpha as _wa } from "../components/ui";

export default function ProfileSetup({ existing, onSaved, onCancel }) {
  const t = useTheme();
  const [fullName, setFullName] = useState(existing?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(existing?.phoneNumber || "");
  const [error, setError] = useState("");

  const canSave = fullName.trim().length > 1 && phoneNumber.trim().length >= 6;

  async function handleSave() {
    if (!canSave) {
      setError("Please enter your full name and a valid phone number.");
      return;
    }
    const profile = await saveProfile({ fullName, phoneNumber });
    onSaved?.(profile);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.canvas }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.hero, { backgroundColor: _wa(ACCENT, 0.12) }]} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.brand, { color: t.primary }]}>{existing ? "Edit your details" : "CityCare"}</Text>
        <Text style={[styles.subtitle, { color: t.secondary }]}>
          {existing
            ? "Update the name and number attached to your submissions."
            : "Report issues around Windhoek, track their progress, and have your voice heard by the City."}
        </Text>

        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <View style={[styles.field, { borderBottomColor: t.separator, borderBottomWidth: 0.5 }]}>
            <Text style={[styles.fieldLabel, { color: t.secondary }]}>Full name</Text>
            <TextInput
              style={[styles.input, { color: t.primary }]}
              placeholder="Your name"
              placeholderTextColor={t.tertiary}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: t.secondary }]}>Phone number</Text>
            <TextInput
              style={[styles.input, { color: t.primary }]}
              placeholder="+264 81 234 5678"
              placeholderTextColor={t.tertiary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Text style={[styles.disclaimer, { color: t.tertiary }]}>
          Your name and number stay on this device and are attached to your submissions only so the City can follow up.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.btn, !canSave && { opacity: 0.5 }]} onPress={handleSave} disabled={!canSave}>
          <Text style={styles.btnText}>{existing ? "Save" : "Get started"}</Text>
        </Pressable>

        {existing && onCancel && (
          <Pressable style={styles.cancel} onPress={onCancel}>
            <Text style={[styles.cancelText, { color: t.secondary }]}>Cancel</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { position: "absolute", top: 0, left: 0, right: 0, height: 220 },
  content: { padding: 24, paddingTop: 96, paddingBottom: 48 },
  brand: { fontSize: 30, fontWeight: "800", letterSpacing: -0.4, marginBottom: 8 },
  subtitle: { fontSize: 17, lineHeight: 22, marginBottom: 36, maxWidth: 300 },
  card: { borderRadius: 20, paddingHorizontal: 16, marginBottom: 16 },
  field: { paddingVertical: 14 },
  fieldLabel: { fontSize: 13, marginBottom: 4 },
  input: { fontSize: 17, padding: 0 },
  disclaimer: { fontSize: 13, lineHeight: 17, marginBottom: 28 },
  error: { color: "#FF3B30", marginBottom: 16 },
  btn: { height: 50, borderRadius: 14, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center", marginTop: 8 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  cancel: { alignItems: "center", marginTop: 16 },
  cancelText: { fontSize: 15 },
});

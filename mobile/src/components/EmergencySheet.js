import { View, Text, Pressable, StyleSheet, Modal, Linking } from "react-native";
import { useTheme } from "../theme";

const SERVICES = [
  { name: "Police", number: "10111", color: "#0A84FF", icon: "🛡️" },
  { name: "Ambulance", number: "112", color: "#FF3B30", icon: "🚑" },
  { name: "Fire Brigade", number: "999", color: "#FF9F0A", icon: "🔥" },
];

export default function EmergencySheet({ visible, onClose }) {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: t.sheet }]}>
          <Pressable onPress={onClose} style={styles.grabWrap}><View style={[styles.grab, { backgroundColor: t.grabber }]} /></Pressable>
          <Text style={[styles.title, { color: t.primary }]}>Emergency</Text>
          <Text style={[styles.subtitle, { color: t.secondary }]}>Tap a service to call immediately.</Text>
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {SERVICES.map((s) => (
              <Pressable key={s.name} onPress={() => Linking.openURL(`tel:${s.number}`)} style={[styles.card, { backgroundColor: s.color }]}>
                <Text style={styles.icon}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.name}</Text>
                  <Text style={styles.number}>{s.number}</Text>
                </View>
                <Text style={styles.phone}>📞</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34 },
  grabWrap: { paddingTop: 10, paddingBottom: 6, alignItems: "center" },
  grab: { width: 36, height: 5, borderRadius: 3 },
  title: { fontSize: 24, fontWeight: "800", paddingHorizontal: 20, paddingTop: 6 },
  subtitle: { fontSize: 14, paddingHorizontal: 20, marginBottom: 14, marginTop: 6 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, padding: 16 },
  icon: { fontSize: 24 },
  name: { color: "#fff", fontSize: 18, fontWeight: "700" },
  number: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 2 },
  phone: { fontSize: 20 },
});

import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "onevoice.history";

// Local-first activity log. Every submission is written here immediately with status
// PENDING, then flipped to SYNCED (with the server id) once the network call resolves —
// or left PENDING with its payload so it can be retried later. This mirrors the offline
// drafts behavior from the spec without needing a full local relational store for the MVP.
//
// Entry shape:
//   { id, type: 'Report'|'Feedback'|'Suggestion', title, subtitle, createdAt,
//     status: 'PENDING'|'SYNCED', serverId, serverStatus, payload }
export async function getHistory() {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addHistoryEntry(entry) {
  const history = await getHistory();
  const withId = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...entry };
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([withId, ...history]));
  return withId;
}

export async function updateHistoryEntry(id, patch) {
  const history = await getHistory();
  const updated = history.map((h) => (h.id === id ? { ...h, ...patch } : h));
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function countPending() {
  const history = await getHistory();
  return history.filter((h) => h.status === "PENDING").length;
}

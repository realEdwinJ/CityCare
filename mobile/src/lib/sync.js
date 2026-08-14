import { getHistory, updateHistoryEntry } from "./storage";
import { submitReport, submitSuggestion, submitLawComment, fetchReport } from "./api";

// Resend every PENDING entry using its stored payload. Returns how many synced.
// Called on app foreground, from the History refresh, and after any new submission.
export async function syncPending() {
  const history = await getHistory();
  const pending = history.filter((h) => h.status === "PENDING" && h.payload);
  let synced = 0;

  for (const entry of pending) {
    try {
      let result;
      if (entry.type === "Report") result = await submitReport(entry.payload);
      else if (entry.type === "Suggestion") result = await submitSuggestion(entry.payload);
      else if (entry.type === "Feedback") result = await submitLawComment(entry.payload.lawId, entry.payload);
      else continue;

      await updateHistoryEntry(entry.id, {
        status: "SYNCED",
        serverId: result?.id || null,
        serverStatus: result?.status || null,
        payload: null,
      });
      synced++;
    } catch {
      // still offline / server down — leave it PENDING for the next attempt
    }
  }
  return synced;
}

// Pull the latest server-side status for each synced Report so the citizen sees
// admin progress (RECEIVED → IN_PROGRESS → RESOLVED). This is the trust-loop payoff.
export async function refreshReportStatuses() {
  const history = await getHistory();
  const tracked = history.filter((h) => h.type === "Report" && h.serverId);

  for (const entry of tracked) {
    try {
      const report = await fetchReport(entry.serverId);
      if (report?.status && report.status !== entry.serverStatus) {
        await updateHistoryEntry(entry.id, { serverStatus: report.status });
      }
    } catch {
      // ignore transient fetch errors
    }
  }
}

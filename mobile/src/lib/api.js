import { API_BASE_URL } from "./config";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

export function fetchLaws() {
  return request("/api/v1/laws");
}

export function fetchMinistries() {
  return request("/api/v1/ministries");
}

export function fetchReport(id) {
  return request(`/api/v1/reports/${id}`);
}

export function fetchPublicReports() {
  return request("/api/v1/reports/public");
}

export function submitLawComment(lawId, { rating, commentText, commenterName }) {
  return request(`/api/v1/laws/${lawId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, commentText, commenterName }),
  });
}

// multipart submission for a report — photo is a local file URI from expo-image-picker
export async function submitReport({
  title, description, category, latitude, longitude, addressText, photo, reporterName, reporterPhone,
}) {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  form.append("category", category);
  if (latitude != null) form.append("latitude", String(latitude));
  if (longitude != null) form.append("longitude", String(longitude));
  if (addressText) form.append("addressText", addressText);
  if (reporterName) form.append("reporterName", reporterName);
  if (reporterPhone) form.append("reporterPhone", reporterPhone);
  if (photo) {
    form.append("photo", {
      uri: photo.uri,
      name: photo.fileName || "photo.jpg",
      type: photo.mimeType || "image/jpeg",
    });
  }
  return postForm("/api/v1/reports", form);
}

export async function submitSuggestion({ ministryId, subject, content, attachment, reporterName, reporterPhone }) {
  const form = new FormData();
  form.append("ministryId", ministryId);
  form.append("subject", subject);
  form.append("content", content);
  if (reporterName) form.append("reporterName", reporterName);
  if (reporterPhone) form.append("reporterPhone", reporterPhone);
  if (attachment) {
    form.append("attachment", {
      uri: attachment.uri,
      name: attachment.name || attachment.fileName || "attachment",
      type: attachment.mimeType || "application/octet-stream",
    });
  }
  return postForm("/api/v1/suggestions", form);
}

async function postForm(path, form) {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

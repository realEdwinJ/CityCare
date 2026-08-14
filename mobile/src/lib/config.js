// Point this at your backend before demoing on a physical device:
// - Simulator/emulator on the same machine as the backend: http://localhost:4000 works for iOS
//   simulator; Android emulator needs http://10.0.2.2:4000 instead.
// - A real phone on Expo Go (same wifi as your dev machine): use your machine's LAN IP,
//   e.g. http://192.168.1.23:4000 — "localhost" on a phone means the phone itself.
// - After EC2 deployment: http://<EC2_PUBLIC_IP> (no port — nginx proxies :80 to the app).
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

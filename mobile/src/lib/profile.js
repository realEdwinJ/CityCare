import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_KEY = "onevoice.profile";

// Local UserProfile per the spec: full name + phone number, stored only on the device.
// Attached to reports / suggestions / law comments so the admin side can show respondent names.
export async function getProfile() {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile({ fullName, phoneNumber }) {
  const existing = await getProfile();
  const profile = {
    id: existing?.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    fullName: fullName.trim(),
    phoneNumber: phoneNumber.trim(),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

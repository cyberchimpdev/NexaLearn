import { api } from "./api";

export async function getPersonalizationOptions() {
  const response = await api.get("/personalization/options/");
  return response.data;
}

export async function getStudentProfile() {
  const response = await api.get("/personalization/profile/");
  return response.data;
}

export async function updateStudentProfile(payload) {
  const response = await api.patch("/personalization/profile/", payload);
  return response.data;
}

export async function getStudentStreak() {
  const response = await api.get("/personalization/streak/");
  return response.data;
}

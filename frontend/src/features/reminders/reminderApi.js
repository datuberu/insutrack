import api from "../../api/axios";

export async function createMealReminder(data) {
  const response = await api.post("/meal-reminders/", data);
  return response.data;
}

export async function updateUserSettings(data) {
  const response = await api.patch("/settings/me/", data);
  return response.data;
}
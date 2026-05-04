import api from "../../api/axios";

export async function getInjectionLogs() {
  const response = await api.get("/injections/");
  return response.data;
}

export async function getInjectionLog(id) {
  const response = await api.get(`/injections/${id}/`);
  return response.data;
}

export async function createInjectionLog(data) {
  const response = await api.post("/injections/", data);
  return response.data;
}

export async function updateInjectionLog(id, data) {
  const response = await api.patch(`/injections/${id}/`, data);
  return response.data;
}

export async function deleteInjectionLog(id) {
  await api.delete(`/injections/${id}/`);
}
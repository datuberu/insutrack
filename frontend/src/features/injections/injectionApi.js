import api from "../../api/axios";

export async function getInjectionLogs() {
  const response = await api.get("/injections/");
  return response.data;
}

export async function createInjectionLog(data) {
  const response = await api.post("/injections/", data);
  return response.data;
}
import api from "../../api/axios";

export async function createInjectionLog(data) {
  const response = await api.post("/injections/", data);
  return response.data;
}
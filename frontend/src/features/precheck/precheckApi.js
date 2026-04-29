import api from "../../api/axios";

export async function runPreCheck(data) {
  const response = await api.post("/precheck/", data);
  return response.data;
}
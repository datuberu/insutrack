import api from "../../api/axios";

export async function getDashboardSummary() {
  const response = await api.get("/dashboard/summary/");
  return response.data;
}
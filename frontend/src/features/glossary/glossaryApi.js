import api from "../../api/axios";

export async function getGlossaryTerms({ language = "en", category = "", query = "" } = {}) {
  const params = new URLSearchParams();

  params.set("lang", language);

  if (category) {
    params.set("category", category);
  }

  if (query) {
    params.set("q", query);
  }

  const response = await api.get(`/glossary/?${params.toString()}`);
  return response.data;
}
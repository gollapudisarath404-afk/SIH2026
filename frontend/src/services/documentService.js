import { api, getApiError } from "./api.js";

export async function getDocumentChecklist(schemeId) {
  try {
    const response = await api.get(`/schemes/${schemeId}/documents`);
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function checkDocumentReadiness(schemeId, documents) {
  try {
    const response = await api.post(`/schemes/${schemeId}/documents/check`, { documents });
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

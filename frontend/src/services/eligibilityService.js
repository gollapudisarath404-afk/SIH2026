import { api, getApiError } from "./api.js";

export async function getEligibilityQuestions(schemeId) {
  try {
    const response = await api.get(`/schemes/${schemeId}/eligibility/questions`);
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function checkEligibility(schemeId, payload) {
  try {
    const response = await api.post(`/schemes/${schemeId}/eligibility/check`, payload);
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

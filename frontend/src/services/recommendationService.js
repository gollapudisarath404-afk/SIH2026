import { api, getApiError } from "./api.js";

export async function getRecommendations(userProfile) {
  try {
    const response = await api.post("/recommendations", userProfile);
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

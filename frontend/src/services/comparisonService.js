import { api, getApiError } from "./api.js";

export async function compareSchemes(schemeId1, schemeId2) {
  try {
    const response = await api.post("/schemes/compare", { schemeId1, schemeId2 });
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

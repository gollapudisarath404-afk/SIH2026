import { aiApi, getApiError } from "./api.js";

export async function explainScheme({ schemeId, language }) {
  try {
    const response = await aiApi.post("/ai/explain", { schemeId, language });
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function chatAboutScheme({ schemeId, language, question }) {
  try {
    const response = await aiApi.post("/ai/chat", { schemeId, language, question });
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

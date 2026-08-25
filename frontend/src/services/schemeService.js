import { api, getApiError } from "./api.js";

export async function listSchemes(params = {}) {
  try {
    const response = await api.get("/schemes", { params });
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function getSchemeById(schemeId) {
  try {
    const response = await api.get(`/schemes/${schemeId}`);
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function searchSchemes(query) {
  try {
    const response = await api.get("/schemes/search", { params: { query } });
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function listCategories() {
  try {
    const response = await api.get("/schemes/meta/categories");
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

export async function listStates() {
  try {
    const response = await api.get("/schemes/meta/states");
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

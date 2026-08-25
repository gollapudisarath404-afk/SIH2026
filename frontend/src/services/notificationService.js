import { api, getApiError } from "./api.js";

export async function getNotifications(userProfile) {
  try {
    const response = await api.post("/notifications", { userProfile });
    return response.data;
  } catch (error) {
    throw getApiError(error);
  }
}

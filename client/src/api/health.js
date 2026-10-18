import { http } from "./http.js";

export async function getApiHealth() {
  const response = await http.get("/health");
  return response.data.data;
}

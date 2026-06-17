import api from "./api";

export const reportItemDetails = (from?: string, to?: string) =>
  api.get("/reports/items-details", { params: { from, to } });
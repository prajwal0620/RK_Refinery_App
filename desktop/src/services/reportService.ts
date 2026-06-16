import api from "./api";

export const reportSummary = (from?: string, to?: string) =>
  api.get("/reports/summary", { params: { from, to } });

export const reportItems = (from?: string, to?: string) =>
  api.get("/reports/items", { params: { from, to } });
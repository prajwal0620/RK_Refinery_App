import api from "./api";

export const dashboardSummary = (date: string) =>
  api.get("/dashboard/summary", { params: { date } });
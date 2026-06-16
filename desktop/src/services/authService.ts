import api from "./api";

export type LoginPayload = { username: string; password: string };

export const loginApi = (payload: LoginPayload) => api.post("/auth/login", payload);
import api from "./api";

export const createBill = (payload: any) => api.post("/bills", payload);
export const getBill = (id: number) => api.get(`/bills/${id}`);
export const searchBills = (params: any) => api.get("/bills", { params });
export const deleteBill = (id: number) => api.delete(`/bills/${id}`);
export const duplicateBill = (id: number) => api.post(`/bills/${id}/duplicate`);
// src/api.ts
import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export async function searchRooms(params: {
  check_in: string;
  check_out: string;
  max_price?: number;
  amenities?: string[];
}) {
  const p = { ...params, amenities: params.amenities?.join(",") };
  return (await api.get("/rooms", { params: p })).data;
}
export async function createBooking(payload: any) {
  return (await api.post("/bookings", payload)).data;
}
export async function getBooking(id: number) {
  return (await api.get(`/bookings/${id}`)).data;
}
export async function cancelBooking(id: number) {
  return (await api.patch(`/bookings/${id}`, { status: "CANCELLED" })).data;
}
export async function confirmPayment(booking_id: number, provider_ref: string) {
  return (
    await api.post("/payments/confirm", {
      booking_id,
      provider_ref,
      success: true,
    })
  ).data;
}

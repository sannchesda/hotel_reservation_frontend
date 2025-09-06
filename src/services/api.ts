// src/api.ts
import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export async function searchRooms(params: {
  check_in: string;
  check_out: string;
  max_price?: number;
}) {
  return (await api.get("/rooms/", { params })).data;
}
export async function createBooking(payload: any) {
  return (await api.post("/bookings/", payload)).data;
}
export async function getBooking(id: number) {
  return (await api.get(`/bookings/${id}/`)).data;
}
export async function cancelBooking(id: number) {
  return (await api.patch(`/bookings/${id}/`, { status: "CANCELLED" })).data;
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

export async function createRoom(payload: {
  number: string;
  room_type: string;
  capacity: number;
  price_dollar: number;
}) {
  return (await api.post("/rooms/", payload)).data;
}

// Room CRUD operations
export async function getRooms() {
  return (await api.get("/rooms/")).data;
}

export async function getRoom(id: number) {
  return (await api.get(`/rooms/${id}/`)).data;
}

export async function updateRoom(id: number, payload: {
  number?: string;
  room_type?: string;
  capacity?: number;
  price_dollar?: number;
}) {
  return (await api.put(`/rooms/${id}/`, payload)).data;
}

export async function deleteRoom(id: number) {
  return (await api.delete(`/rooms/${id}/`)).data;
}

// Booking CRUD operations
export async function getBookings() {
  return (await api.get("/bookings/")).data;
}

export async function updateBooking(id: number, payload: {
  status?: string;
  check_in?: string;
  check_out?: string;
  room_id?: number;
  user_type: string;
}) {
  return (await api.put(`/bookings/${id}/`, payload)).data;
}

export async function getBookingsByEmail(email: string) {
  return (await api.get("/bookings/by_email/", { params: { email } })).data;
}

export async function getMyBookings() {
  // Get current user's bookings (requires authentication)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.email) {
    throw new Error('User not authenticated');
  }
  return (await api.get("/bookings/my_bookings/", { params: { user_email: user.email } })).data;
}

export async function deleteBooking(id: number) {
  return (await api.delete(`/bookings/${id}/`)).data;
}

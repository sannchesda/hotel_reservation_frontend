// Shared TypeScript interfaces for the hotel reservation system

export interface Amenity {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  number: string;
  room_type: string;
  capacity: number;
  price_dollar: number;
  amenities: Amenity[];
  available?: boolean;
  name?: string; // For compatibility with RoomItem component
  price?: number; // For compatibility with RoomItem component
  description?: string;
}

export interface Guest {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: number;
  guest: Guest;
  room: Room;
  check_in: string;
  check_out: string;
  total_dollar: number;
  status: BookingStatus;
  created_at?: string;
  updated_at?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';

export interface CreateBookingPayload {
  guest: {
    full_name: string;
    email: string;
    phone: string;
  };
  room_id: number;
  check_in: string;
  check_out: string;
}

export interface CreateRoomPayload {
  number: string;
  room_type: string;
  capacity: number;
  price_dollar: number;
  amenities?: number[];
}

export interface UpdateRoomPayload {
  number?: string;
  room_type?: string;
  capacity?: number;
  price_dollar?: number;
  amenities?: number[];
}

export interface UpdateBookingPayload {
  status?: BookingStatus;
  check_in?: string;
  check_out?: string;
  room_id?: number;
}

export interface SearchRoomsParams {
  check_in: string;
  check_out: string;
  max_price?: number;
  amenities?: string[];
}

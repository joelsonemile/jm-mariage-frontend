export type ReservationStatus = 'pending' | 'validated' | 'cancelled';

export interface MyReservation {
  id: string;
  status: ReservationStatus;
  seatNumber: number;
  table: { id: string; name: string; description: string };
  companionName: string;
  tableMates: string[];
}

export interface AdminReservation {
  _id: string;
  seatNumber: number;
  status: ReservationStatus;
  createdAt: string;
  companionName: string;
  guest: { _id: string; fullName: string; phone: string; email: string; linkToCouple: string };
  table: { _id: string; name: string };
}

export interface AdminGuest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  linkToCouple: string;
  rsvpStatus: string;
  groupSize: number;
  reservations: { id: string; tableName: string; seatNumber: number; status: ReservationStatus; companionName: string }[];
}

export interface TableSummary {
  id: string;
  name: string;
  description: string;
  isHonorTable: boolean;
  adminOnly: boolean;
  totalSeats: number;
  order: number;
  reservedCount: number;
  freeCount: number;
  isMyTable: boolean;
}

export type SeatStatus = 'available' | 'taken' | 'mine';

export interface Seat {
  seatNumber: number;
  status: SeatStatus;
  guestFirstName?: string | null;
  guestFullName?: string | null;
}

export interface TableDetail {
  table: {
    id: string;
    name: string;
    description: string;
    isHonorTable: boolean;
    adminOnly: boolean;
    totalSeats: number;
  };
  seats: Seat[];
}

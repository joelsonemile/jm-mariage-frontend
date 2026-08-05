export interface TableSummary {
  id: string;
  name: string;
  description: string;
  isHonorTable: boolean;
  totalSeats: number;
  order: number;
  reservedCount: number;
  freeCount: number;
  isMyTable: boolean;
  guestNames: string[];
}

export type SeatStatus = 'available' | 'taken' | 'mine';

export interface Seat {
  seatNumber: number;
  status: SeatStatus;
  guestFirstName?: string | null;
}

export interface TableDetail {
  table: {
    id: string;
    name: string;
    description: string;
    isHonorTable: boolean;
    totalSeats: number;
  };
  seats: Seat[];
}

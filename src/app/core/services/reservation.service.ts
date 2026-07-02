import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MyReservation } from '../models/reservation.model';

interface MyReservationResponse {
  data: { reservation: MyReservation | null; tableMates?: string[] };
}

interface TicketResponse {
  data: { qrDataUrl: string; tableName: string; seatNumber: number };
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  constructor(private http: HttpClient) {}

  async create(tableId: string, seatNumber: number) {
    const res = await firstValueFrom(
      this.http.post<{ data: { reservation: MyReservation } }>(`${environment.apiUrl}/reservations`, {
        tableId,
        seatNumber,
      })
    );
    return res.data.reservation;
  }

  async getMine(): Promise<MyReservationResponse['data']> {
    const res = await firstValueFrom(
      this.http.get<MyReservationResponse>(`${environment.apiUrl}/reservations/me`)
    );
    return res.data;
  }

  async cancel(): Promise<void> {
    await firstValueFrom(this.http.delete(`${environment.apiUrl}/reservations/me`));
  }

  async change(tableId: string, seatNumber: number) {
    const res = await firstValueFrom(
      this.http.put<{ data: { reservation: MyReservation } }>(`${environment.apiUrl}/reservations/me/change`, {
        tableId,
        seatNumber,
      })
    );
    return res.data.reservation;
  }

  async ticket(): Promise<TicketResponse['data']> {
    const res = await firstValueFrom(
      this.http.get<TicketResponse>(`${environment.apiUrl}/reservations/me/ticket`)
    );
    return res.data;
  }
}

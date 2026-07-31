import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MyReservation } from '../models/reservation.model';

interface MyReservationsResponse {
  data: { reservations: MyReservation[]; groupSize: number };
}

interface TicketResponse {
  data: { qrDataUrl: string; tableName: string; seatNumber: number };
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  constructor(private http: HttpClient) {}

  async create(tableId: string, seatNumber: number, companionName?: string) {
    const res = await firstValueFrom(
      this.http.post<{ data: { reservation: MyReservation } }>(`${environment.apiUrl}/reservations`, {
        tableId,
        seatNumber,
        companionName: companionName || '',
      })
    );
    return res.data.reservation;
  }

  async getMine(): Promise<MyReservationsResponse['data']> {
    const res = await firstValueFrom(
      this.http.get<MyReservationsResponse>(`${environment.apiUrl}/reservations/me`)
    );
    return res.data;
  }

  async cancel(reservationId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${environment.apiUrl}/reservations/${reservationId}`));
  }

  async change(reservationId: string, tableId: string, seatNumber: number) {
    const res = await firstValueFrom(
      this.http.put<{ data: { reservation: MyReservation } }>(
        `${environment.apiUrl}/reservations/${reservationId}/change`,
        { tableId, seatNumber }
      )
    );
    return res.data.reservation;
  }

  async ticket(reservationId: string): Promise<TicketResponse['data']> {
    const res = await firstValueFrom(
      this.http.get<TicketResponse>(`${environment.apiUrl}/reservations/${reservationId}/ticket`)
    );
    return res.data;
  }

  async updateCompanionName(reservationId: string, companionName: string) {
    const res = await firstValueFrom(
      this.http.put<{ data: { reservation: MyReservation } }>(
        `${environment.apiUrl}/reservations/${reservationId}/companion-name`,
        { companionName }
      )
    );
    return res.data.reservation;
  }
}

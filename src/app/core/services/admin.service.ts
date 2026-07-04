import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminGuest, AdminReservation, ReservationStatus } from '../models/reservation.model';
import { InvitedGuest } from '../models/invited-guest.model';
import { Category } from '../models/category.model';

export interface AdminDashboardStats {
  totalGuests: number;
  pendingCount: number;
  validatedCount: number;
  freeSeats: number;
  reservedSeats: number;
  totalSeats: number;
  fullTables: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  async dashboard(): Promise<AdminDashboardStats> {
    const res = await firstValueFrom(this.http.get<{ data: { stats: AdminDashboardStats } }>(`${this.base}/dashboard`));
    return res.data.stats;
  }

  async listReservations(status?: ReservationStatus): Promise<AdminReservation[]> {
    const url = status ? `${this.base}/reservations?status=${status}` : `${this.base}/reservations`;
    const res = await firstValueFrom(this.http.get<{ data: { reservations: AdminReservation[] } }>(url));
    return res.data.reservations;
  }

  async approveReservation(id: string): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/reservations/${id}/approve`, {}));
  }

  async deleteReservation(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/reservations/${id}`));
  }

  async createReservation(payload: { guestId: string; tableId: string; seatNumber: number; status?: ReservationStatus }) {
    await firstValueFrom(this.http.post(`${this.base}/reservations`, payload));
  }

  async moveReservation(id: string, tableId: string, seatNumber: number): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/reservations/${id}/move`, { tableId, seatNumber }));
  }

  async listGuests(search = ''): Promise<AdminGuest[]> {
    const url = search ? `${this.base}/guests?search=${encodeURIComponent(search)}` : `${this.base}/guests`;
    const res = await firstValueFrom(this.http.get<{ data: { guests: AdminGuest[] } }>(url));
    return res.data.guests;
  }

  async createGuest(payload: { fullName: string; email: string; phone: string; linkToCouple: string }): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/guests`, payload));
  }

  async updateGuest(id: string, payload: Partial<{ fullName: string; phone: string; linkToCouple: string; email: string }>): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/guests/${id}`, payload));
  }

  async deleteGuest(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/guests/${id}`));
  }

  async exportCsv(): Promise<Blob> {
    return firstValueFrom(this.http.get(`${this.base}/export/csv`, { responseType: 'blob' }));
  }

  async listInvitedGuests(search = ''): Promise<InvitedGuest[]> {
    const url = search
      ? `${this.base}/invited-guests?search=${encodeURIComponent(search)}`
      : `${this.base}/invited-guests`;
    const res = await firstValueFrom(this.http.get<{ data: { invitedGuests: InvitedGuest[] } }>(url));
    return res.data.invitedGuests;
  }

  async createInvitedGuest(payload: { nom: string; prenom: string; telephone: string; categorie: string }): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/invited-guests`, payload));
  }

  async updateInvitedGuest(id: string, payload: Partial<{ nom: string; prenom: string; telephone: string; categorie: string }>): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/invited-guests/${id}`, payload));
  }

  async deleteInvitedGuest(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/invited-guests/${id}`));
  }

  async listCategories(): Promise<Category[]> {
    const res = await firstValueFrom(this.http.get<{ data: { categories: Category[] } }>(`${this.base}/categories`));
    return res.data.categories;
  }

  async createCategory(nom: string): Promise<Category> {
    const res = await firstValueFrom(this.http.post<{ data: { category: Category } }>(`${this.base}/categories`, { nom }));
    return res.data.category;
  }

  async updateCategory(id: string, nom: string): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/categories/${id}`, { nom }));
  }

  async deleteCategory(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/categories/${id}`));
  }
}

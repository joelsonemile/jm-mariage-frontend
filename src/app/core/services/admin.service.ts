import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminGuest, AdminReservation, ReservationStatus } from '../models/reservation.model';
import { InvitedGuest } from '../models/invited-guest.model';
import { Category } from '../models/category.model';
import { CommitteeMember } from '../models/committee-member.model';
import { Commission } from '../models/commission.model';

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

  async exportTablesPdf(): Promise<Blob> {
    return firstValueFrom(this.http.get(`${this.base}/tables/pdf`, { responseType: 'blob' }));
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

  async assignInvitedGuestToSeat(invitedGuestId: string, tableId: string, seatNumber: number): Promise<AdminReservation> {
    const res = await firstValueFrom(
      this.http.post<{ data: { reservation: AdminReservation } }>(`${this.base}/reservations/assign-invited-guest`, {
        invitedGuestId,
        tableId,
        seatNumber,
      })
    );
    return res.data.reservation;
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

  async createInvitedGuest(payload: {
    nom: string;
    prenom: string;
    telephone: string;
    categorie: string;
    nombreAccompagnants: number;
  }): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/invited-guests`, payload));
  }

  async updateInvitedGuest(
    id: string,
    payload: Partial<{ nom: string; prenom: string; telephone: string; categorie: string; nombreAccompagnants: number }>
  ): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/invited-guests/${id}`, payload));
  }

  async deleteInvitedGuest(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/invited-guests/${id}`));
  }

  async markInvitationSent(id: string, sent: boolean): Promise<InvitedGuest> {
    const res = await firstValueFrom(
      this.http.put<{ data: { invitedGuest: InvitedGuest } }>(`${this.base}/invited-guests/${id}/invitation-sent`, { sent })
    );
    return res.data.invitedGuest;
  }

  async exportInvitedGuestsPdf(): Promise<Blob> {
    return firstValueFrom(this.http.get(`${this.base}/invited-guests/pdf`, { responseType: 'blob' }));
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

  async listCommitteeMembers(commission = ''): Promise<CommitteeMember[]> {
    const url = commission
      ? `${this.base}/committee?commission=${encodeURIComponent(commission)}`
      : `${this.base}/committee`;
    const res = await firstValueFrom(this.http.get<{ data: { committeeMembers: CommitteeMember[] } }>(url));
    return res.data.committeeMembers;
  }

  async createCommitteeMember(payload: { nom: string; role: string; description: string; commission: string }): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/committee`, payload));
  }

  async updateCommitteeMember(
    id: string,
    payload: Partial<{ nom: string; role: string; description: string; commission: string }>
  ): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/committee/${id}`, payload));
  }

  async deleteCommitteeMember(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/committee/${id}`));
  }

  async listCommissions(): Promise<Commission[]> {
    const res = await firstValueFrom(this.http.get<{ data: { commissions: Commission[] } }>(`${this.base}/commissions`));
    return res.data.commissions;
  }

  async createCommission(nom: string): Promise<Commission> {
    const res = await firstValueFrom(this.http.post<{ data: { commission: Commission } }>(`${this.base}/commissions`, { nom }));
    return res.data.commission;
  }

  async updateCommission(id: string, nom: string): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/commissions/${id}`, { nom }));
  }

  async deleteCommission(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/commissions/${id}`));
  }

  async exportCommitteePdf(): Promise<Blob> {
    return firstValueFrom(this.http.get(`${this.base}/committee/pdf`, { responseType: 'blob' }));
  }

  async setCommissionResponsables(commissionId: string, committeeMemberIds: string[]): Promise<Commission> {
    const res = await firstValueFrom(
      this.http.put<{ data: { commission: Commission } }>(`${this.base}/commissions/${commissionId}/responsables`, {
        committeeMemberIds,
      })
    );
    return res.data.commission;
  }
}

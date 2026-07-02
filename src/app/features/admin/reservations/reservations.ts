import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminReservation } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservations.html',
})
export class AdminReservationsComponent implements OnInit {
  readonly reservations = signal<AdminReservation[]>([]);
  readonly loading = signal(true);

  constructor(private adminService: AdminService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    await this.load();
    this.loading.set(false);
  }

  async load(): Promise<void> {
    this.reservations.set(await this.adminService.listReservations());
  }

  get pendingCount(): number {
    return this.reservations().filter((r) => r.status === 'pending').length;
  }

  async approve(reservation: AdminReservation): Promise<void> {
    await this.adminService.approveReservation(reservation._id);
    this.toast.show('Réservation validée, email envoyé à l\'invité.', 'success');
    await this.load();
  }

  async remove(reservation: AdminReservation): Promise<void> {
    await this.adminService.deleteReservation(reservation._id);
    this.toast.show('Réservation supprimée.', 'success');
    await this.load();
  }

  async exportCsv(): Promise<void> {
    const blob = await this.adminService.exportCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invites-jm-mariage.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

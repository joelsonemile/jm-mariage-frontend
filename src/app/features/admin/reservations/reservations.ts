import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminReservation } from '../../../core/models/reservation.model';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  templateUrl: './reservations.html',
})
export class AdminReservationsComponent implements OnInit {
  readonly reservations = signal<AdminReservation[]>([]);
  readonly loading = signal(true);
  readonly deleting = signal<AdminReservation | null>(null);

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

  async confirmRemove(): Promise<void> {
    const reservation = this.deleting();
    if (!reservation) return;
    await this.adminService.deleteReservation(reservation._id);
    this.toast.show('Réservation supprimée.', 'success');
    this.deleting.set(null);
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

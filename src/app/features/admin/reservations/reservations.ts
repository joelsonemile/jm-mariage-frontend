import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminReservation, ReservationStatus } from '../../../core/models/reservation.model';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';

type StatusFilter = 'all' | ReservationStatus;
type SortOption = 'recent' | 'oldest' | 'name';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, IconComponent],
  templateUrl: './reservations.html',
})
export class AdminReservationsComponent implements OnInit {
  readonly reservations = signal<AdminReservation[]>([]);
  readonly loading = signal(true);
  readonly deleting = signal<AdminReservation | null>(null);

  readonly search = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly tableFilter = signal<string>('all');
  readonly sortBy = signal<SortOption>('recent');

  readonly statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'validated', label: 'Validées' },
  ];

  readonly tableOptions = computed(() => {
    const map = new Map<string, string>();
    for (const r of this.reservations()) map.set(r.table._id, r.table.name);
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly filteredReservations = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const table = this.tableFilter();

    let list = this.reservations().filter((r) => {
      if (term && !r.guest.fullName.toLowerCase().includes(term)) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (table !== 'all' && r.table._id !== table) return false;
      return true;
    });

    const sort = this.sortBy();
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.guest.fullName.localeCompare(b.guest.fullName);
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sort === 'recent' ? diff : -diff;
    });

    return list;
  });

  constructor(private adminService: AdminService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    await this.load();
    this.loading.set(false);
  }

  async load(): Promise<void> {
    this.reservations.set(await this.adminService.listReservations());
  }

  resetFilters(): void {
    this.search.set('');
    this.statusFilter.set('all');
    this.tableFilter.set('all');
    this.sortBy.set('recent');
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

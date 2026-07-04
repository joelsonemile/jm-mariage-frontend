import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminGuest } from '../../../core/models/reservation.model';
import { LINKS_TO_COUPLE, LinkToCouple } from '../../../core/models/user.model';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { ButtonComponent } from '../../../shared/components/button/button';

type ReservationFilter = 'all' | 'reserved' | 'none' | 'pending' | 'validated';

@Component({
  selector: 'app-admin-guests',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './guests.html',
})
export class AdminGuestsComponent implements OnInit {
  readonly guests = signal<AdminGuest[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly links = LINKS_TO_COUPLE;

  readonly linkFilter = signal<'all' | LinkToCouple>('all');
  readonly reservationFilter = signal<ReservationFilter>('all');

  readonly linkOptions: { value: 'all' | LinkToCouple; label: string }[] = [
    { value: 'all', label: 'Tous les liens' },
    { value: 'Famille de Joelson', label: 'Famille Joelson' },
    { value: 'Famille de Marjorie', label: 'Famille Marjorie' },
    { value: 'Ami(e)s', label: 'Ami(e)s' },
    { value: 'Collègues', label: 'Collègues' },
    { value: 'Autres', label: 'Autres' },
  ];

  readonly editing = signal<AdminGuest | null>(null);
  readonly showCreate = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal<AdminGuest | null>(null);

  editForm = { fullName: '', phone: '', linkToCouple: 'Autres' as LinkToCouple };
  createForm = { fullName: '', email: '', phone: '', linkToCouple: 'Autres' as LinkToCouple };

  readonly filteredGuests = computed(() => {
    const link = this.linkFilter();
    const resa = this.reservationFilter();

    return this.guests().filter((g) => {
      if (link !== 'all' && g.linkToCouple !== link) return false;
      if (resa === 'reserved' && !g.reservation) return false;
      if (resa === 'none' && g.reservation) return false;
      if (resa === 'pending' && g.reservation?.status !== 'pending') return false;
      if (resa === 'validated' && g.reservation?.status !== 'validated') return false;
      return true;
    });
  });

  constructor(private adminService: AdminService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    await this.load();
    this.loading.set(false);
  }

  async load(): Promise<void> {
    this.guests.set(await this.adminService.listGuests(this.search()));
  }

  async onSearchChange(): Promise<void> {
    await this.load();
  }

  resetFilters(): void {
    this.search.set('');
    this.linkFilter.set('all');
    this.reservationFilter.set('all');
    this.load();
  }

  openEdit(guest: AdminGuest): void {
    this.editing.set(guest);
    this.editForm = { fullName: guest.fullName, phone: guest.phone, linkToCouple: guest.linkToCouple as LinkToCouple };
  }

  async saveEdit(): Promise<void> {
    const guest = this.editing();
    if (!guest) return;
    this.saving.set(true);
    try {
      await this.adminService.updateGuest(guest.id, this.editForm);
      this.toast.show('Invité mis à jour.', 'success');
      this.editing.set(null);
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async createGuest(): Promise<void> {
    this.saving.set(true);
    try {
      await this.adminService.createGuest(this.createForm);
      this.toast.show('Invité ajouté.', 'success');
      this.showCreate.set(false);
      this.createForm = { fullName: '', email: '', phone: '', linkToCouple: 'Autres' };
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async confirmRemove(): Promise<void> {
    const guest = this.deleting();
    if (!guest) return;
    await this.adminService.deleteGuest(guest.id);
    this.toast.show('Invité supprimé.', 'success');
    this.deleting.set(null);
    await this.load();
  }
}

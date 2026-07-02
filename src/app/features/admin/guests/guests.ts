import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminGuest } from '../../../core/models/reservation.model';
import { LINKS_TO_COUPLE, LinkToCouple } from '../../../core/models/user.model';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { ButtonComponent } from '../../../shared/components/button/button';

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

  readonly editing = signal<AdminGuest | null>(null);
  readonly showCreate = signal(false);
  readonly saving = signal(false);

  editForm = { fullName: '', phone: '', linkToCouple: 'Autres' as LinkToCouple };
  createForm = { fullName: '', email: '', phone: '', linkToCouple: 'Autres' as LinkToCouple };

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

  async remove(guest: AdminGuest): Promise<void> {
    await this.adminService.deleteGuest(guest.id);
    this.toast.show('Invité supprimé.', 'success');
    await this.load();
  }
}

import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { INVITED_GUEST_CATEGORIES, InvitedGuest, InvitedGuestCategory } from '../../../core/models/invited-guest.model';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-admin-invited-guests',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './invited-guests.html',
})
export class AdminInvitedGuestsComponent implements OnInit {
  readonly invitedGuests = signal<InvitedGuest[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly categories = INVITED_GUEST_CATEGORIES;

  readonly categoryFilter = signal<'all' | InvitedGuestCategory>('all');
  readonly categoryOptions: { value: 'all' | InvitedGuestCategory; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    ...INVITED_GUEST_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  readonly editing = signal<InvitedGuest | null>(null);
  readonly showCreate = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal<InvitedGuest | null>(null);

  editForm = { nom: '', prenom: '', telephone: '', categorie: 'Autres' as InvitedGuestCategory };
  createForm = { nom: '', prenom: '', telephone: '', categorie: 'Autres' as InvitedGuestCategory };

  readonly filteredInvitedGuests = computed(() => {
    const category = this.categoryFilter();
    if (category === 'all') return this.invitedGuests();
    return this.invitedGuests().filter((g) => g.categorie === category);
  });

  readonly categoryCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const g of this.invitedGuests()) counts.set(g.categorie, (counts.get(g.categorie) || 0) + 1);
    return counts;
  });

  constructor(private adminService: AdminService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    await this.load();
    this.loading.set(false);
  }

  async load(): Promise<void> {
    this.invitedGuests.set(await this.adminService.listInvitedGuests(this.search()));
  }

  async onSearchChange(): Promise<void> {
    await this.load();
  }

  resetFilters(): void {
    this.search.set('');
    this.categoryFilter.set('all');
    this.load();
  }

  openEdit(guest: InvitedGuest): void {
    this.editing.set(guest);
    this.editForm = { nom: guest.nom, prenom: guest.prenom, telephone: guest.telephone, categorie: guest.categorie };
  }

  async saveEdit(): Promise<void> {
    const guest = this.editing();
    if (!guest) return;
    this.saving.set(true);
    try {
      await this.adminService.updateInvitedGuest(guest._id, this.editForm);
      this.toast.show('Invité attendu mis à jour.', 'success');
      this.editing.set(null);
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async createInvitedGuest(): Promise<void> {
    this.saving.set(true);
    try {
      await this.adminService.createInvitedGuest(this.createForm);
      this.toast.show('Invité attendu ajouté.', 'success');
      this.showCreate.set(false);
      this.createForm = { nom: '', prenom: '', telephone: '', categorie: 'Autres' };
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async confirmRemove(): Promise<void> {
    const guest = this.deleting();
    if (!guest) return;
    await this.adminService.deleteInvitedGuest(guest._id);
    this.toast.show('Invité attendu supprimé.', 'success');
    this.deleting.set(null);
    await this.load();
  }
}

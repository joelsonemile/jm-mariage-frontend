import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { InvitedGuest } from '../../../core/models/invited-guest.model';
import { Category } from '../../../core/models/category.model';
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
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');

  readonly categoryFilter = signal<string>('all');
  readonly categoryOptions = computed(() => [
    { value: 'all', label: 'Toutes' },
    ...this.categories().map((c) => ({ value: c.nom, label: c.nom })),
  ]);

  readonly phoneFilter = signal<'all' | 'with' | 'without'>('all');
  readonly phoneOptions: { value: 'all' | 'with' | 'without'; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'with', label: 'Avec numéro' },
    { value: 'without', label: 'Sans numéro' },
  ];

  readonly editing = signal<InvitedGuest | null>(null);
  readonly showCreate = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal<InvitedGuest | null>(null);

  readonly downloadingPdf = signal(false);

  readonly showManageCategories = signal(false);
  readonly newCategoryName = signal('');
  readonly editingCategory = signal<Category | null>(null);
  readonly editingCategoryName = signal('');
  readonly deletingCategory = signal<Category | null>(null);
  readonly categorySaving = signal(false);

  editForm = { nom: '', prenom: '', telephone: '', categorie: '', nombreAccompagnants: 0 };
  createForm = { nom: '', prenom: '', telephone: '', categorie: '', nombreAccompagnants: 0 };

  readonly totalHeadcount = computed(() =>
    this.invitedGuests().reduce((sum, g) => sum + 1 + (g.nombreAccompagnants || 0), 0)
  );

  readonly filteredInvitedGuests = computed(() => {
    const category = this.categoryFilter();
    const phone = this.phoneFilter();

    return this.invitedGuests().filter((g) => {
      if (category !== 'all' && g.categorie !== category) return false;
      if (phone === 'with' && !g.telephone.trim()) return false;
      if (phone === 'without' && g.telephone.trim()) return false;
      return true;
    });
  });

  readonly categoryCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const g of this.invitedGuests()) counts.set(g.categorie, (counts.get(g.categorie) || 0) + 1);
    return counts;
  });

  constructor(private adminService: AdminService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.load(), this.loadCategories()]);
    this.loading.set(false);
  }

  async load(): Promise<void> {
    this.invitedGuests.set(await this.adminService.listInvitedGuests(this.search()));
  }

  async loadCategories(): Promise<void> {
    const categories = await this.adminService.listCategories();
    this.categories.set(categories);
    const firstName = categories[0]?.nom || '';
    if (!this.createForm.categorie) this.createForm.categorie = firstName;
  }

  async onSearchChange(): Promise<void> {
    await this.load();
  }

  resetFilters(): void {
    this.search.set('');
    this.categoryFilter.set('all');
    this.phoneFilter.set('all');
    this.load();
  }

  openEdit(guest: InvitedGuest): void {
    this.editing.set(guest);
    this.editForm = {
      nom: guest.nom,
      prenom: guest.prenom,
      telephone: guest.telephone,
      categorie: guest.categorie,
      nombreAccompagnants: guest.nombreAccompagnants,
    };
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
      this.createForm = { nom: '', prenom: '', telephone: '', categorie: this.categories()[0]?.nom || '', nombreAccompagnants: 0 };
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

  async downloadPdf(): Promise<void> {
    this.downloadingPdf.set(true);
    try {
      const blob = await this.adminService.exportInvitedGuestsPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invites-attendus-jm-mariage.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.downloadingPdf.set(false);
    }
  }

  async addCategory(): Promise<void> {
    const nom = this.newCategoryName().trim();
    if (!nom) return;
    this.categorySaving.set(true);
    try {
      await this.adminService.createCategory(nom);
      this.toast.show('Catégorie ajoutée.', 'success');
      this.newCategoryName.set('');
      await this.loadCategories();
    } finally {
      this.categorySaving.set(false);
    }
  }

  startEditCategory(category: Category): void {
    this.editingCategory.set(category);
    this.editingCategoryName.set(category.nom);
  }

  async saveCategory(): Promise<void> {
    const category = this.editingCategory();
    const nom = this.editingCategoryName().trim();
    if (!category || !nom) return;
    this.categorySaving.set(true);
    try {
      await this.adminService.updateCategory(category._id, nom);
      this.toast.show('Catégorie renommée. Les invités concernés ont été mis à jour.', 'success');
      this.editingCategory.set(null);
      await Promise.all([this.loadCategories(), this.load()]);
    } finally {
      this.categorySaving.set(false);
    }
  }

  async confirmDeleteCategory(): Promise<void> {
    const category = this.deletingCategory();
    if (!category) return;
    await this.adminService.deleteCategory(category._id);
    this.toast.show('Catégorie supprimée.', 'success');
    this.deletingCategory.set(null);
    await this.loadCategories();
  }
}

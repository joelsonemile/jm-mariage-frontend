import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { CommitteeMember } from '../../../core/models/committee-member.model';
import { Commission } from '../../../core/models/commission.model';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { ButtonComponent } from '../../../shared/components/button/button';

const PRINCIPAL_ROLE = '__principal__';

@Component({
  selector: 'app-admin-committee',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './committee.html',
})
export class AdminCommitteeComponent implements OnInit {
  readonly members = signal<CommitteeMember[]>([]);
  readonly commissions = signal<Commission[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');

  readonly commissionFilter = signal<string>('all');
  readonly commissionOptions = computed(() => [
    { value: 'all', label: 'Tous' },
    { value: PRINCIPAL_ROLE, label: 'Rôles principaux' },
    ...this.commissions().map((c) => ({ value: c.nom, label: c.nom })),
  ]);

  readonly editing = signal<CommitteeMember | null>(null);
  readonly showCreate = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal<CommitteeMember | null>(null);

  readonly showManageCommissions = signal(false);
  readonly newCommissionName = signal('');
  readonly editingCommission = signal<Commission | null>(null);
  readonly editingCommissionName = signal('');
  readonly deletingCommission = signal<Commission | null>(null);
  readonly commissionSaving = signal(false);

  editForm = { nom: '', role: '', commission: '' };
  createForm = { nom: '', role: '', commission: '' };

  readonly memberCountByCommission = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.members()) {
      if (m.commission) counts.set(m.commission, (counts.get(m.commission) || 0) + 1);
    }
    return counts;
  });

  readonly filteredMembers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const commission = this.commissionFilter();

    return this.members().filter((m) => {
      if (commission === PRINCIPAL_ROLE && m.commission) return false;
      if (commission !== 'all' && commission !== PRINCIPAL_ROLE && m.commission !== commission) return false;
      if (term && !m.nom.toLowerCase().includes(term) && !m.role.toLowerCase().includes(term)) return false;
      return true;
    });
  });

  constructor(private adminService: AdminService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.load(), this.loadCommissions()]);
    this.loading.set(false);
  }

  async load(): Promise<void> {
    this.members.set(await this.adminService.listCommitteeMembers());
  }

  async loadCommissions(): Promise<void> {
    this.commissions.set(await this.adminService.listCommissions());
  }

  resetFilters(): void {
    this.search.set('');
    this.commissionFilter.set('all');
  }

  openEdit(member: CommitteeMember): void {
    this.editing.set(member);
    this.editForm = { nom: member.nom, role: member.role, commission: member.commission };
  }

  async saveEdit(): Promise<void> {
    const member = this.editing();
    if (!member) return;
    this.saving.set(true);
    try {
      await this.adminService.updateCommitteeMember(member._id, this.editForm);
      this.toast.show('Membre du comité mis à jour.', 'success');
      this.editing.set(null);
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async createMember(): Promise<void> {
    if (!this.createForm.nom.trim()) return;
    this.saving.set(true);
    try {
      await this.adminService.createCommitteeMember(this.createForm);
      this.toast.show('Membre ajouté au comité.', 'success');
      this.showCreate.set(false);
      this.createForm = { nom: '', role: '', commission: '' };
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async confirmRemove(): Promise<void> {
    const member = this.deleting();
    if (!member) return;
    await this.adminService.deleteCommitteeMember(member._id);
    this.toast.show('Membre retiré du comité.', 'success');
    this.deleting.set(null);
    await this.load();
  }

  async addCommission(): Promise<void> {
    const nom = this.newCommissionName().trim();
    if (!nom) return;
    this.commissionSaving.set(true);
    try {
      await this.adminService.createCommission(nom);
      this.toast.show('Commission ajoutée.', 'success');
      this.newCommissionName.set('');
      await this.loadCommissions();
    } finally {
      this.commissionSaving.set(false);
    }
  }

  startEditCommission(commission: Commission): void {
    this.editingCommission.set(commission);
    this.editingCommissionName.set(commission.nom);
  }

  async saveCommission(): Promise<void> {
    const commission = this.editingCommission();
    const nom = this.editingCommissionName().trim();
    if (!commission || !nom) return;
    this.commissionSaving.set(true);
    try {
      await this.adminService.updateCommission(commission._id, nom);
      this.toast.show('Commission renommée. Les membres concernés ont été mis à jour.', 'success');
      this.editingCommission.set(null);
      await Promise.all([this.loadCommissions(), this.load()]);
    } finally {
      this.commissionSaving.set(false);
    }
  }

  async confirmDeleteCommission(): Promise<void> {
    const commission = this.deletingCommission();
    if (!commission) return;
    await this.adminService.deleteCommission(commission._id);
    this.toast.show('Commission supprimée.', 'success');
    this.deletingCommission.set(null);
    await this.loadCommissions();
  }
}

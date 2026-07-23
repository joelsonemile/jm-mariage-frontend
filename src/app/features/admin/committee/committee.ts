import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { CommitteeMember, COMMITTEE_COMMISSIONS } from '../../../core/models/committee-member.model';
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
  readonly loading = signal(true);
  readonly search = signal('');
  readonly commissions = COMMITTEE_COMMISSIONS;

  readonly commissionFilter = signal<string>('all');
  readonly commissionOptions = computed(() => [
    { value: 'all', label: 'Tous' },
    { value: PRINCIPAL_ROLE, label: 'Rôles principaux' },
    ...this.commissions.map((c) => ({ value: c, label: c })),
  ]);

  readonly editing = signal<CommitteeMember | null>(null);
  readonly showCreate = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal<CommitteeMember | null>(null);

  editForm = { nom: '', role: '', commission: '' };
  createForm = { nom: '', role: '', commission: '' };

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
    await this.load();
    this.loading.set(false);
  }

  async load(): Promise<void> {
    this.members.set(await this.adminService.listCommitteeMembers());
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
}

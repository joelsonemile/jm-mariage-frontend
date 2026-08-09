import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { InvitedGuest } from '../../../core/models/invited-guest.model';
import { Category } from '../../../core/models/category.model';
import { IconComponent } from '../../../shared/components/icon/icon';
import { toWhatsAppNumber } from '../../../core/utils/phone-format.util';

const INVITATION_LINK = 'https://jm-mariage.vercel.app';
const DEFAULT_MESSAGE =
  "Bonjour {{prenom}},\n\nNous avons le plaisir de vous inviter au mariage de Joelson & Marjorie ! Merci de confirmer votre présence et de réserver votre place via le lien ci-dessous.";

type SelectionMode = 'individual' | 'category' | 'all';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './messages.html',
})
export class AdminMessagesComponent implements OnInit {
  readonly invitationLink = INVITATION_LINK;

  readonly invitedGuests = signal<InvitedGuest[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);

  readonly mode = signal<SelectionMode>('all');
  readonly search = signal('');
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selectedCategory = signal('');
  readonly messageBody = signal(DEFAULT_MESSAGE);
  readonly sentIds = signal<Set<string>>(new Set());

  constructor(private adminService: AdminService) {}

  async ngOnInit(): Promise<void> {
    const [invitedGuests, categories] = await Promise.all([
      this.adminService.listInvitedGuests(),
      this.adminService.listCategories(),
    ]);
    this.invitedGuests.set(invitedGuests);
    this.categories.set(categories);
    this.loading.set(false);
  }

  setMode(mode: SelectionMode): void {
    this.mode.set(mode);
  }

  readonly filteredForPicker = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.invitedGuests();
    return this.invitedGuests().filter(
      (g) => `${g.nom} ${g.prenom}`.toLowerCase().includes(term) || g.telephone.includes(term)
    );
  });

  readonly categoryCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const g of this.invitedGuests()) {
      counts.set(g.categorie, (counts.get(g.categorie) || 0) + 1);
    }
    return counts;
  });

  readonly recipients = computed<InvitedGuest[]>(() => {
    const mode = this.mode();
    if (mode === 'all') return this.invitedGuests();
    if (mode === 'category') {
      const cat = this.selectedCategory();
      return cat ? this.invitedGuests().filter((g) => g.categorie === cat) : [];
    }
    const ids = this.selectedIds();
    return this.invitedGuests().filter((g) => ids.has(g._id));
  });

  readonly reachableCount = computed(
    () => this.recipients().filter((g) => !!toWhatsAppNumber(g.telephone)).length
  );

  readonly previewMessage = computed(() => {
    const sample = this.recipients()[0];
    const firstName = sample ? sample.prenom || sample.nom : 'Prénom';
    return `${this.messageBody().replaceAll('{{prenom}}', firstName)}\n\n${INVITATION_LINK}`;
  });

  toggleGuest(id: string): void {
    const next = new Set(this.selectedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedIds.set(next);
  }

  insertFirstNameToken(): void {
    this.messageBody.set(`${this.messageBody()} {{prenom}}`.trim());
  }

  hasValidPhone(guest: InvitedGuest): boolean {
    return !!toWhatsAppNumber(guest.telephone);
  }

  private buildMessageFor(guest: InvitedGuest): string {
    const firstName = guest.prenom || guest.nom || 'cher invité';
    const body = this.messageBody().replaceAll('{{prenom}}', firstName);
    return `${body}\n\n${INVITATION_LINK}`;
  }

  openWhatsApp(guest: InvitedGuest): void {
    const phone = toWhatsAppNumber(guest.telephone);
    if (!phone) return;
    const text = encodeURIComponent(this.buildMessageFor(guest));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener');
    const next = new Set(this.sentIds());
    next.add(guest._id);
    this.sentIds.set(next);
  }

  resetSent(): void {
    this.sentIds.set(new Set());
  }
}

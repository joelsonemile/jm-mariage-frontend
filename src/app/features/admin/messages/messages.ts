import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { InvitedGuest } from '../../../core/models/invited-guest.model';
import { Category } from '../../../core/models/category.model';
import { IconComponent } from '../../../shared/components/icon/icon';
import { toWhatsAppNumber } from '../../../core/utils/phone-format.util';

const INVITATION_LINK = 'https://jm-mariage.vercel.app';
const DEFAULT_MESSAGE =
  "Bonjour {{prenom}},\n\nNous avons le plaisir de vous inviter au mariage de Joelson & Marjorie ! Merci de confirmer votre présence et de réserver votre place via le lien ci-dessous.";

type SelectionMode = 'individual' | 'category' | 'all';
type SentFilter = 'all' | 'sent' | 'unsent';

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
  readonly sentFilter = signal<SentFilter>('all');
  readonly togglingId = signal<string | null>(null);

  constructor(private adminService: AdminService, private toast: ToastService) {}

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

  // Statistiques globales, indépendantes de la sélection en cours : donnent une
  // vue d'ensemble de la campagne d'envoi sur l'ensemble des invités attendus.
  readonly globalStats = computed(() => {
    const guests = this.invitedGuests();
    const sent = guests.filter((g) => !!g.invitationSentAt).length;
    return { total: guests.length, sent, unsent: guests.length - sent };
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

  readonly selectionSentCount = computed(
    () => this.recipients().filter((g) => !!g.invitationSentAt).length
  );

  readonly displayedRecipients = computed(() => {
    const filter = this.sentFilter();
    if (filter === 'sent') return this.recipients().filter((g) => !!g.invitationSentAt);
    if (filter === 'unsent') return this.recipients().filter((g) => !g.invitationSentAt);
    return this.recipients();
  });

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

  formatSentDate(iso: string): string {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} à ${hh}h${min}`;
  }

  private buildMessageFor(guest: InvitedGuest): string {
    const firstName = guest.prenom || guest.nom || 'cher invité';
    const body = this.messageBody().replaceAll('{{prenom}}', firstName);
    return `${body}\n\n${INVITATION_LINK}`;
  }

  private updateGuestLocally(updated: InvitedGuest): void {
    this.invitedGuests.set(this.invitedGuests().map((g) => (g._id === updated._id ? updated : g)));
  }

  async openWhatsApp(guest: InvitedGuest): Promise<void> {
    const phone = toWhatsAppNumber(guest.telephone);
    if (!phone) return;
    const text = encodeURIComponent(this.buildMessageFor(guest));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener');
    await this.setSent(guest, true);
  }

  async setSent(guest: InvitedGuest, sent: boolean): Promise<void> {
    this.togglingId.set(guest._id);
    try {
      const updated = await this.adminService.markInvitationSent(guest._id, sent);
      this.updateGuestLocally(updated);
    } catch {
      this.toast.show("Impossible de mettre à jour le statut d'envoi.", 'error');
    } finally {
      this.togglingId.set(null);
    }
  }
}

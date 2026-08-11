import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { TableService } from '../../../core/services/table.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminReservation } from '../../../core/models/reservation.model';
import { TableSummary } from '../../../core/models/table.model';
import { InvitedGuest } from '../../../core/models/invited-guest.model';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ModalComponent } from '../../../shared/components/modal/modal';

interface TableWithGuests extends TableSummary {
  guests: AdminReservation[];
}

type OccupancyFilter = 'all' | 'full' | 'available' | 'empty';

@Component({
  selector: 'app-admin-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  templateUrl: './tables.html',
})
export class AdminTablesComponent implements OnInit {
  readonly tables = signal<TableWithGuests[]>([]);
  readonly invitedGuests = signal<InvitedGuest[]>([]);
  readonly loading = signal(true);

  readonly search = signal('');
  readonly occupancyFilter = signal<OccupancyFilter>('all');

  readonly occupancyOptions: { value: OccupancyFilter; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'full', label: 'Complètes' },
    { value: 'available', label: 'Partiellement occupées' },
    { value: 'empty', label: 'Vides' },
  ];

  readonly filteredTables = computed(() => {
    const term = this.search().trim().toLowerCase();
    const occupancy = this.occupancyFilter();

    return this.tables().filter((t) => {
      if (occupancy === 'full' && t.reservedCount < t.totalSeats) return false;
      if (occupancy === 'available' && (t.reservedCount === 0 || t.reservedCount >= t.totalSeats)) return false;
      if (occupancy === 'empty' && t.reservedCount > 0) return false;

      if (term) {
        const matchesTable = t.name.toLowerCase().includes(term);
        const matchesGuest = t.guests.some((g) => g.guest.fullName.toLowerCase().includes(term));
        if (!matchesTable && !matchesGuest) return false;
      }

      return true;
    });
  });

  // Déplacer un invité vers une autre table/place, depuis n'importe quelle table.
  readonly movingReservationId = signal<string | null>(null);
  moveDraft = { tableId: '', seatNumber: 1 };
  readonly moving = signal(false);

  // Affecter un invité attendu (sans compte) à une place d'une table admin-only.
  readonly assigningTable = signal<TableWithGuests | null>(null);
  readonly assignSearch = signal('');
  assignSeatNumber = 1;
  readonly assigning = signal(false);

  readonly filteredForAssign = computed(() => {
    const term = this.assignSearch().trim().toLowerCase();
    if (!term) return this.invitedGuests();
    return this.invitedGuests().filter(
      (g) => `${g.nom} ${g.prenom}`.toLowerCase().includes(term) || g.telephone.includes(term)
    );
  });

  constructor(
    private adminService: AdminService,
    private tableService: TableService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
    this.loading.set(false);
  }

  private async load(): Promise<void> {
    const [tables, reservations, invitedGuests] = await Promise.all([
      this.tableService.list(),
      this.adminService.listReservations(),
      this.adminService.listInvitedGuests(),
    ]);
    this.invitedGuests.set(invitedGuests);
    this.tables.set(
      tables
        .filter((t) => !t.isHonorTable)
        .sort((a, b) => a.order - b.order)
        .map((t) => ({ ...t, guests: reservations.filter((r) => r.table._id === t.id) }))
    );
  }

  resetFilters(): void {
    this.search.set('');
    this.occupancyFilter.set('all');
  }

  freeSeatNumbers(table: TableWithGuests): number[] {
    const taken = new Set(table.guests.map((g) => g.seatNumber));
    return Array.from({ length: table.totalSeats }, (_, i) => i + 1).filter((n) => !taken.has(n));
  }

  startMove(reservation: AdminReservation): void {
    this.movingReservationId.set(reservation._id);
    this.moveDraft = { tableId: reservation.table._id, seatNumber: reservation.seatNumber };
  }

  cancelMove(): void {
    this.movingReservationId.set(null);
  }

  async confirmMove(reservationId: string): Promise<void> {
    this.moving.set(true);
    try {
      await this.adminService.moveReservation(reservationId, this.moveDraft.tableId, this.moveDraft.seatNumber);
      this.toast.show('Invité déplacé.', 'success');
      this.movingReservationId.set(null);
      await this.load();
    } catch {
      // Message d'erreur précis déjà affiché par l'intercepteur HTTP global.
    } finally {
      this.moving.set(false);
    }
  }

  openAssign(table: TableWithGuests): void {
    this.assigningTable.set(table);
    this.assignSearch.set('');
    this.assignSeatNumber = this.freeSeatNumbers(table)[0] || 1;
  }

  closeAssign(): void {
    this.assigningTable.set(null);
  }

  async assignGuest(invitedGuest: InvitedGuest): Promise<void> {
    const table = this.assigningTable();
    if (!table) return;
    this.assigning.set(true);
    try {
      await this.adminService.assignInvitedGuestToSeat(invitedGuest._id, table.id, this.assignSeatNumber);
      this.toast.show(`${invitedGuest.nom} ${invitedGuest.prenom} affecté(e) à ${table.name}.`, 'success');
      this.assigningTable.set(null);
      await this.load();
    } catch {
      // Le message d'erreur précis (place déjà occupée, invité déjà assigné
      // ailleurs...) est déjà affiché par l'intercepteur HTTP global.
    } finally {
      this.assigning.set(false);
    }
  }
}

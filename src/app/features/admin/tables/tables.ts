import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { TableService } from '../../../core/services/table.service';
import { AdminReservation } from '../../../core/models/reservation.model';
import { TableSummary } from '../../../core/models/table.model';
import { IconComponent } from '../../../shared/components/icon/icon';

interface TableWithGuests extends TableSummary {
  guests: AdminReservation[];
}

type OccupancyFilter = 'all' | 'full' | 'available' | 'empty';

@Component({
  selector: 'app-admin-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './tables.html',
})
export class AdminTablesComponent implements OnInit {
  readonly tables = signal<TableWithGuests[]>([]);
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

  constructor(private adminService: AdminService, private tableService: TableService) {}

  async ngOnInit(): Promise<void> {
    const [tables, reservations] = await Promise.all([
      this.tableService.list(),
      this.adminService.listReservations(),
    ]);

    this.tables.set(
      tables
        .filter((t) => !t.isHonorTable)
        .sort((a, b) => a.order - b.order)
        .map((t) => ({ ...t, guests: reservations.filter((r) => r.table._id === t.id) }))
    );
    this.loading.set(false);
  }

  resetFilters(): void {
    this.search.set('');
    this.occupancyFilter.set('all');
  }
}

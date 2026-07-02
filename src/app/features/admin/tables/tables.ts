import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { TableService } from '../../../core/services/table.service';
import { AdminReservation } from '../../../core/models/reservation.model';
import { TableSummary } from '../../../core/models/table.model';

interface TableWithGuests extends TableSummary {
  guests: AdminReservation[];
}

@Component({
  selector: 'app-admin-tables',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tables.html',
})
export class AdminTablesComponent implements OnInit {
  readonly tables = signal<TableWithGuests[]>([]);
  readonly loading = signal(true);

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
}

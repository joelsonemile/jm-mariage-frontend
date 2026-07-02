import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableService } from '../../../core/services/table.service';
import { SocketService } from '../../../core/services/socket.service';
import { TableSummary } from '../../../core/models/table.model';

@Component({
  selector: 'app-guest-plan',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './plan.html',
})
export class GuestPlanComponent implements OnInit, OnDestroy {
  readonly tables = signal<TableSummary[]>([]);
  readonly honorTable = signal<TableSummary | null>(null);
  readonly loading = signal(true);
  private unsubscribe: (() => void) | null = null;

  constructor(private tableService: TableService, private socketService: SocketService) {}

  async ngOnInit(): Promise<void> {
    await this.load();
    this.loading.set(false);
    this.unsubscribe = this.socketService.onSeatUpdated(() => this.load());
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }

  async load(): Promise<void> {
    const tables = await this.tableService.list();
    this.honorTable.set(tables.find((t) => t.isHonorTable) || null);
    this.tables.set(tables.filter((t) => !t.isHonorTable).sort((a, b) => a.order - b.order));
  }

  statusClass(table: TableSummary): string {
    if (table.isMyTable) return 'border-[var(--color-success)]';
    if (table.freeCount === 0) return 'border-[var(--color-error)] bg-[var(--color-error)]/10';
    if (table.freeCount <= 2) return 'border-white/60';
    return 'border-[var(--color-gold)]';
  }
}

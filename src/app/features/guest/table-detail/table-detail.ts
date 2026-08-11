import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TableService } from '../../../core/services/table.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { SocketService } from '../../../core/services/socket.service';
import { ToastService } from '../../../core/services/toast.service';
import { TableDetail } from '../../../core/models/table.model';
import { SeatCircleComponent } from '../../../shared/components/seat-circle/seat-circle';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-table-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SeatCircleComponent, ModalComponent, ButtonComponent, IconComponent],
  templateUrl: './table-detail.html',
})
export class TableDetailComponent implements OnInit, OnDestroy {
  tableId = '';
  readonly detail = signal<TableDetail | null>(null);
  readonly selectedSeat = signal<number | null>(null);
  readonly showConfirm = signal(false);
  readonly showPendingInfo = signal(false);
  readonly submitting = signal(false);
  readonly revealedSeat = signal<number | null>(null);
  companionName = '';
  private unsubscribe: (() => void) | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tableService: TableService,
    private reservationService: ReservationService,
    private socketService: SocketService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.tableId = this.route.snapshot.paramMap.get('id')!;
    await this.load();
    this.socketService.joinTable(this.tableId);
    this.unsubscribe = this.socketService.onSeatUpdated(() => this.load());
  }

  ngOnDestroy(): void {
    this.socketService.leaveTable(this.tableId);
    this.unsubscribe?.();
  }

  async load(): Promise<void> {
    this.detail.set(await this.tableService.get(this.tableId));
  }

  // Le badge n'affiche que le prénom par défaut ; un clic révèle le nom complet
  // (nouveau clic ou clic sur un autre badge pour le masquer à nouveau).
  toggleReveal(seatNumber: number): void {
    this.revealedSeat.set(this.revealedSeat() === seatNumber ? null : seatNumber);
  }

  pickSeat(seatNumber: number): void {
    this.selectedSeat.set(seatNumber);
    this.companionName = '';
    this.showConfirm.set(true);
  }

  async confirmReservation(): Promise<void> {
    if (!this.selectedSeat() || !this.companionName.trim()) return;
    this.submitting.set(true);
    try {
      await this.reservationService.create(this.tableId, this.selectedSeat()!, this.companionName);
      this.showConfirm.set(false);
      this.showPendingInfo.set(true);
    } catch {
      this.showConfirm.set(false);
      await this.load();
    } finally {
      this.submitting.set(false);
    }
  }

  closePendingInfo(): void {
    this.showPendingInfo.set(false);
    this.router.navigateByUrl('/guest');
  }

  private seatAngle(index: number, total: number): number {
    return (2 * Math.PI * index) / total - Math.PI / 2;
  }

  // Positionne chaque siège en cercle autour du centre (nom de la table).
  seatStyle(index: number, total: number): Record<string, string> {
    const radius = 118;
    const angle = this.seatAngle(index, total);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return {
      position: 'absolute',
      left: `calc(50% + ${x}px - 22px)`,
      top: `calc(50% + ${y}px - 22px)`,
    };
  }

  // Badge nominatif hors du cercle des places (jamais dans le rond du siège,
  // trop petit) : ancré au bout de la "tige" reliant le siège au nom, décalé
  // vers l'intérieur ou l'extérieur selon le côté pour rester lisible.
  labelStyle(index: number, total: number): Record<string, string> {
    const radius = 150;
    const angle = this.seatAngle(index, total);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const cos = Math.cos(angle);
    const translateX = cos > 0.2 ? '0%' : cos < -0.2 ? '-100%' : '-50%';
    return {
      position: 'absolute',
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: `translate(${translateX}, -50%)`,
    };
  }

  // Trace la tige (ligne) entre le bord du siège et le badge du nom.
  stemPath(index: number, total: number): string {
    const angle = this.seatAngle(index, total);
    const inner = 142;
    const outer = 148;
    const x1 = 144 + inner * Math.cos(angle);
    const y1 = 144 + inner * Math.sin(angle);
    const x2 = 144 + outer * Math.cos(angle);
    const y2 = 144 + outer * Math.sin(angle);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
}

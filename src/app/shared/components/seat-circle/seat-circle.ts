import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seat } from '../../../core/models/table.model';

@Component({
  selector: 'app-seat-circle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-circle.html',
})
export class SeatCircleComponent {
  @Input({ required: true }) seat!: Seat;
  @Input() selected = false;
  @Output() picked = new EventEmitter<number>();

  get classes(): string {
    const base = 'w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-transform';

    if (this.selected) {
      return `${base} bg-[var(--color-gold-bright)] text-black border-[var(--color-gold-bright)] scale-110 cursor-pointer`;
    }
    switch (this.seat.status) {
      case 'available':
        return `${base} border-[var(--color-gold)] text-[var(--color-gold)] hover:scale-110 cursor-pointer`;
      case 'mine':
        return `${base} bg-[var(--color-success)] text-white border-[var(--color-success)] cursor-default`;
      case 'taken':
        return `${base} bg-[var(--color-error)] text-white border-[var(--color-error)] cursor-not-allowed`;
      default:
        return base;
    }
  }

  onClick(): void {
    if (this.seat.status === 'available') this.picked.emit(this.seat.seatNumber);
  }
}

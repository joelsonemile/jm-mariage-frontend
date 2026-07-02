import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { GuestService } from '../../../core/services/guest.service';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { ToastService } from '../../../core/services/toast.service';
import { MyReservation } from '../../../core/models/reservation.model';
import { WeddingInfo } from '../../../core/models/wedding-info.model';
import { RsvpStatus } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button';
import { QrCodeComponent } from '../../../shared/components/qr-code/qr-code';
import { ModalComponent } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, QrCodeComponent, ModalComponent],
  templateUrl: './dashboard.html',
})
export class GuestDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);

  readonly reservation = signal<MyReservation | null>(null);
  readonly tableMates = signal<string[]>([]);
  readonly info = signal<WeddingInfo | null>(null);
  readonly ticket = signal<{ qrDataUrl: string; tableName: string; seatNumber: number } | null>(null);
  readonly showCancelConfirm = signal(false);
  readonly loading = signal(true);

  constructor(
    private reservationService: ReservationService,
    private guestService: GuestService,
    private weddingInfoService: WeddingInfoService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
    this.loading.set(false);
  }

  async refresh(): Promise<void> {
    const [{ reservation, tableMates }, info] = await Promise.all([
      this.reservationService.getMine(),
      this.weddingInfoService.get(),
    ]);
    this.reservation.set(reservation);
    this.tableMates.set(tableMates || []);
    this.info.set(info);

    if (reservation?.status === 'validated') {
      this.ticket.set(await this.reservationService.ticket());
    } else {
      this.ticket.set(null);
    }
  }

  async setRsvp(status: RsvpStatus): Promise<void> {
    const user = await this.guestService.updateRsvp(status);
    this.auth.updateStoredUser(user);
    this.toast.show('Merci pour votre réponse !', 'success');
  }

  async confirmCancel(): Promise<void> {
    await this.reservationService.cancel();
    this.showCancelConfirm.set(false);
    this.toast.show('Réservation annulée.', 'success');
    await this.refresh();
  }
}

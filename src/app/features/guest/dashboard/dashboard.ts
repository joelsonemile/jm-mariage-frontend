import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { GuestService } from '../../../core/services/guest.service';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { ToastService } from '../../../core/services/toast.service';
import { GroupTicket, MyReservation } from '../../../core/models/reservation.model';
import { WeddingInfo } from '../../../core/models/wedding-info.model';
import { RsvpStatus } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button';
import { QrCodeComponent } from '../../../shared/components/qr-code/qr-code';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent, QrCodeComponent, ModalComponent, IconComponent],
  templateUrl: './dashboard.html',
})
export class GuestDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);

  readonly reservations = signal<MyReservation[]>([]);
  readonly info = signal<WeddingInfo | null>(null);
  // Un seul ticket regroupant toutes les places validées du compte, plutôt
  // qu'un ticket répété par réservation.
  readonly groupTicket = signal<GroupTicket | null>(null);
  readonly cancelling = signal<MyReservation | null>(null);
  readonly loading = signal(true);

  readonly showGroupSizeEditor = signal(false);
  readonly groupSizeInput = signal(1);
  readonly savingGroupSize = signal(false);

  readonly editingCompanionId = signal<string | null>(null);
  companionNameInput = '';
  readonly savingCompanion = signal(false);

  readonly canReserveMore = computed(() => this.reservations().length < (this.auth.user()?.groupSize || 1));

  constructor(
    private reservationService: ReservationService,
    private guestService: GuestService,
    private weddingInfoService: WeddingInfoService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refresh();
    this.groupSizeInput.set(this.auth.user()?.groupSize || 1);
    this.loading.set(false);
  }

  async refresh(): Promise<void> {
    const [{ reservations, groupSize }, info] = await Promise.all([
      this.reservationService.getMine(),
      this.weddingInfoService.get(),
    ]);
    this.reservations.set(reservations);
    this.info.set(info);

    const hasValidated = reservations.some((r) => r.status === 'validated');
    this.groupTicket.set(hasValidated ? await this.reservationService.myTicket() : null);

    const user = this.auth.user();
    if (user && user.groupSize !== groupSize) {
      this.auth.updateStoredUser({ ...user, groupSize });
    }
  }

  async setRsvp(status: RsvpStatus): Promise<void> {
    const user = await this.guestService.updateRsvp(status);
    this.auth.updateStoredUser(user);
    this.toast.show('Merci pour votre réponse !', 'success');
  }

  async saveGroupSize(): Promise<void> {
    this.savingGroupSize.set(true);
    try {
      const user = await this.guestService.updateGroupSize(this.groupSizeInput());
      this.auth.updateStoredUser(user);
      this.showGroupSizeEditor.set(false);
      this.toast.show('Nombre d\'invités mis à jour.', 'success');
    } finally {
      this.savingGroupSize.set(false);
    }
  }

  startEditCompanion(reservation: MyReservation): void {
    this.editingCompanionId.set(reservation.id);
    this.companionNameInput = reservation.companionName;
  }

  async saveCompanionName(reservation: MyReservation): Promise<void> {
    if (!this.companionNameInput.trim()) return;
    this.savingCompanion.set(true);
    try {
      await this.reservationService.updateCompanionName(reservation.id, this.companionNameInput);
      this.editingCompanionId.set(null);
      await this.refresh();
    } finally {
      this.savingCompanion.set(false);
    }
  }

  async confirmCancel(): Promise<void> {
    const reservation = this.cancelling();
    if (!reservation) return;
    await this.reservationService.cancel(reservation.id);
    this.cancelling.set(null);
    this.toast.show('Réservation annulée.', 'success');
    await this.refresh();
  }
}

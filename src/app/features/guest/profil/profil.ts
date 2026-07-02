import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { GuestService } from '../../../core/services/guest.service';
import { ToastService } from '../../../core/services/toast.service';
import { LINKS_TO_COUPLE, LinkToCouple } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-guest-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './profil.html',
})
export class GuestProfilComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly links = LINKS_TO_COUPLE;
  readonly loading = signal(false);

  form = { fullName: '', phone: '', linkToCouple: 'Autres' as LinkToCouple };

  constructor(private guestService: GuestService, private toast: ToastService) {}

  ngOnInit(): void {
    const user = this.auth.user();
    if (user) {
      this.form = { fullName: user.fullName, phone: user.phone, linkToCouple: user.linkToCouple };
    }
  }

  async save(): Promise<void> {
    this.loading.set(true);
    try {
      const user = await this.guestService.updateProfile(this.form);
      this.auth.updateStoredUser(user);
      this.toast.show('Profil mis à jour.', 'success');
    } finally {
      this.loading.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
  }
}

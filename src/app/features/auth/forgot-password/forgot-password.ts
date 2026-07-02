import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  email = '';
  readonly loading = signal(false);
  readonly sent = signal(false);

  constructor(private auth: AuthService) {}

  async submit(): Promise<void> {
    this.loading.set(true);
    try {
      await this.auth.forgotPassword(this.email);
      this.sent.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}

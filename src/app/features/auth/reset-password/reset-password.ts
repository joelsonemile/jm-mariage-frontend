import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent],
  templateUrl: './reset-password.html',
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  readonly loading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  async submit(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      this.toast.show('Les mots de passe ne correspondent pas.', 'error');
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.resetPassword(this.token, this.password);
      this.toast.show('Mot de passe mis à jour, connectez-vous.', 'success');
      this.router.navigateByUrl('/auth');
    } finally {
      this.loading.set(false);
    }
  }
}

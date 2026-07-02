import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LINKS_TO_COUPLE, LinkToCouple } from '../../../core/models/user.model';

type Tab = 'login' | 'register';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent],
  templateUrl: './login-register.html',
})
export class LoginRegisterComponent implements OnInit {
  readonly tab = signal<Tab>('login');
  readonly loading = signal(false);
  readonly links = LINKS_TO_COUPLE;

  loginForm = { email: '', password: '' };
  registerForm = {
    fullName: '',
    email: '',
    phone: '',
    linkToCouple: 'Ami(e)s' as LinkToCouple,
    password: '',
    confirmPassword: '',
  };

  constructor(private route: ActivatedRoute, private auth: AuthService, private toast: ToastService) {}

  ngOnInit(): void {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (mode === 'register') this.tab.set('register');
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
  }

  async submitLogin(): Promise<void> {
    this.loading.set(true);
    try {
      const user = await this.auth.login(this.loginForm.email, this.loginForm.password);
      this.auth.redirectAfterLogin(user);
    } catch {
      // l'intercepteur d'erreur affiche déjà le toast
    } finally {
      this.loading.set(false);
    }
  }

  async submitRegister(): Promise<void> {
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.toast.show('Les mots de passe ne correspondent pas.', 'error');
      return;
    }

    this.loading.set(true);
    try {
      const user = await this.auth.register(this.registerForm);
      this.auth.redirectAfterLogin(user);
    } catch {
      // géré par l'intercepteur
    } finally {
      this.loading.set(false);
    }
  }
}

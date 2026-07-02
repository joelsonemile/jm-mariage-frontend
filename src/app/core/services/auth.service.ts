import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LinkToCouple } from '../models/user.model';

const TOKEN_KEY = 'jm_token';
const USER_KEY = 'jm_user';

interface AuthResponse {
  success: boolean;
  data: { token: string; user: User };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(this.readStoredUser());
  private readonly currentToken = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly user = this.currentUser.asReadonly();
  readonly token = this.currentToken.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentToken());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  private persistSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentToken.set(token);
    this.currentUser.set(user);
  }

  async login(email: string, password: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
    );
    this.persistSession(res.data.token, res.data.user);
    return res.data.user;
  }

  async register(payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    linkToCouple: LinkToCouple;
  }): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
    );
    this.persistSession(res.data.token, res.data.user);
    return res.data.user;
  }

  async forgotPassword(email: string): Promise<void> {
    await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email }));
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/reset-password`, { token, password }));
  }

  updateStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentToken.set(null);
    this.currentUser.set(null);
    this.router.navigateByUrl('/auth');
  }

  redirectAfterLogin(user: User): void {
    this.router.navigateByUrl(user.role === 'admin' ? '/admin' : '/guest');
  }
}

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestOnlyGuard } from './core/guards/guest-only.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./features/public/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'auth',
    canActivate: [guestOnlyGuard],
    loadComponent: () =>
      import('./features/auth/login-register/login-register').then((m) => m.LoginRegisterComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'guest',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/guest-layout/guest-layout').then((m) => m.GuestLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/guest/dashboard/dashboard').then((m) => m.GuestDashboardComponent),
      },
      {
        path: 'plan',
        loadComponent: () => import('./features/guest/plan/plan').then((m) => m.GuestPlanComponent),
      },
      {
        path: 'plan/:id',
        loadComponent: () =>
          import('./features/guest/table-detail/table-detail').then((m) => m.TableDetailComponent),
      },
      {
        path: 'infos',
        loadComponent: () => import('./features/guest/infos/infos').then((m) => m.GuestInfosComponent),
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/guest/profil/profil').then((m) => m.GuestProfilComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./features/admin/reservations/reservations').then((m) => m.AdminReservationsComponent),
      },
      {
        path: 'guests',
        loadComponent: () => import('./features/admin/guests/guests').then((m) => m.AdminGuestsComponent),
      },
      {
        path: 'tables',
        loadComponent: () => import('./features/admin/tables/tables').then((m) => m.AdminTablesComponent),
      },
      {
        path: 'gifts',
        loadComponent: () => import('./features/admin/gifts/gifts').then((m) => m.AdminGiftsComponent),
      },
      {
        path: 'infos',
        loadComponent: () => import('./features/admin/infos/infos').then((m) => m.AdminInfosComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

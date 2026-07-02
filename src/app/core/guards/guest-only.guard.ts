import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Redirige un utilisateur déjà connecté loin des pages d'accueil/authentification.
export const guestOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return true;
  return router.createUrlTree([auth.isAdmin() ? '/admin' : '/guest']);
};

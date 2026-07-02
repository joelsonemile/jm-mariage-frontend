import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Empêche tout invité connecté d'atteindre les routes admin, même par URL directe
// (cahier des charges §8.6 — séparation stricte des interfaces).
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth']);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/guest']);
};

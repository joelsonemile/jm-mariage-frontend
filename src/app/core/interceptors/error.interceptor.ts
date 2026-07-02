import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message || 'Une erreur est survenue.';

      if (error.status === 401) {
        localStorage.removeItem('jm_token');
        localStorage.removeItem('jm_user');
        router.navigateByUrl('/auth');
      }

      toast.show(message, error.status >= 500 || error.status === 0 ? 'error' : 'error');
      return throwError(() => error);
    })
  );
};

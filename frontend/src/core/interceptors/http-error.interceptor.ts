import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (environment.enableLogging) {
        console.error('HTTP Error:', {
          url: req.url,
          status: error.status,
          message: error.message,
          error: error.error
        });
      }

      // Manejo de errores específicos
      switch (error.status) {
        case 401:
          // No autenticado - redirigir a login
          router.navigate(['/login']);
          break;
        case 403:
          // No autorizado
          if (environment.enableLogging) {
            console.warn('Acceso denegado:', req.url);
          }
          break;
        case 404:
          // Recurso no encontrado
          if (environment.enableLogging) {
            console.warn('Recurso no encontrado:', req.url);
          }
          break;
        case 500:
          // Error del servidor
          if (environment.enableLogging) {
            console.error('Error del servidor:', error.error);
          }
          break;
      }

      return throwError(() => error);
    })
  );
};


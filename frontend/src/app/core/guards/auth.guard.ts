import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

/**
 * Guard para proteger rutas admin
 * Verifica que el usuario esté autenticado Y sea ADMIN
 */
export const protectedAdminGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const router = inject(Router);

  // Verificar autenticación y rol ADMIN
  if (token && userRole === 'ADMIN') {
    return true;
  }

  // Redirigir a login si no está autenticado o no es admin
  router.navigate(['/admin/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

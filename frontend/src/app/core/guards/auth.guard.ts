import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const protectedAdminGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const router = inject(Router);


  if (token && userRole === 'ADMIN') {
    return true;
  }


  router.navigate(['/admin/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

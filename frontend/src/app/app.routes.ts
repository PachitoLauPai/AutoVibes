import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { protectedAdminGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  // ==================== ÁREA PÚBLICA (CLIENTES) ====================
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'autos', loadComponent: () => import('./features/autos/auto-list/auto-list').then(m => m.AutoListComponent)},
  { path: 'autos/:id', loadComponent: () => import('./features/autos/auto-detail/auto-detail').then(m => m.AutoDetailComponent)},
  
  // ==================== ADMIN LOGIN (SIN LAYOUT) ====================
  { path: 'admin/login', loadComponent: () => import('./features/auth/admin-login/admin-login').then(m => m.AdminLoginComponent)},
  
  // ==================== ÁREA ADMIN (CON LAYOUT Y SIDEBAR) ====================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [protectedAdminGuard],
    children: [
      // Rutas protegidas admin (todas dentro del layout con sidebar)
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.DashboardComponent)},
      { path: 'autos', loadComponent: () => import('./features/admin/admin-auto-list/admin-auto-list').then(m => m.AdminAutoListComponent)},
      { path: 'autos/nuevo', loadComponent: () => import('./features/autos/auto-form/auto-form').then(m => m.AutoFormComponent)},
      { path: 'autos/editar/:id', loadComponent: () => import('./features/autos/auto-edit/auto-edit').then(m => m.AutoEditComponent) },
      { path: 'contactos', loadComponent: () => import('./features/admin/contact-list/contact-list').then(m => m.ContactListComponent)},
      { path: 'usuarios', loadComponent: () => import('./features/admin/user-list/user-list').then(m => m.UserListComponent)},
      { path: 'usuarios/editar/:id', loadComponent: () => import('./features/admin/user-edit/user-edit').then(m => m.UserEditComponent) },
      { path: 'ventas', loadComponent: () => import('./features/admin/gestion-ventas/gestion-ventas').then(m => m.GestionVentasComponent)},
    ]
  },
  
  // ==================== RUTA 404 ====================
  { path: '**', redirectTo: '/home' }
];
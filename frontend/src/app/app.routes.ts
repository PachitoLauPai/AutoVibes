import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';

export const routes: Routes = [
  // ✅ Ruta por defecto → HOME (landing page)
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // HOME (Landing Page)
  { path: 'home', component: HomeComponent },
  
  // AUTOS
  { path: 'autos', loadComponent: () => import('./features/autos/auto-list/auto-list').then(m => m.AutoListComponent)},
  { path: 'autos/:id', loadComponent: () => import('./features/autos/auto-detail/auto-detail').then(m => m.AutoDetailComponent)},
  { path: 'autos/:id/contactar', loadComponent: () => import('./features/autos/auto-detail/auto-detail').then(m => m.AutoDetailComponent)},
  
  // ADMIN - AUTOS
  { path: 'admin/autos/nuevo', loadComponent: () => import('./features/autos/auto-form/auto-form').then(m => m.AutoFormComponent)},
  { path: 'admin/autos/editar/:id', loadComponent: () => import('./features/autos/auto-edit/auto-edit').then(m => m.AutoEditComponent) },
  
  // ADMIN - VENTAS
  { path: 'admin/ventas', loadComponent: () => import('./features/admin/gestion-ventas/gestion-ventas').then(m => m.GestionVentasComponent)},
  
  // ADMIN - USUARIOS
  { path: 'admin/usuarios', loadComponent: () => import('./features/admin/user-list/user-list').then(m => m.UserListComponent)},
  { path: 'admin/usuarios/editar/:id', loadComponent: () => import('./features/admin/user-edit/user-edit').then(m => m.UserEditComponent)},
  
  // CLIENT - PERFIL
  { path: 'cliente/perfil', loadComponent: () => import('./features/cliente/client-profile/client-profile').then(m => m.ClientProfileComponent)},
  
  // AUTH
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)},
  { path: 'registro', loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)},
  
  // ✅ Ruta 404 (al final)
  { path: '**', redirectTo: '/home' }
];
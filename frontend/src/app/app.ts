import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <!-- Mostrar navbar solo en rutas públicas (NO en /admin) -->
    <app-navbar *ngIf="!isAdminRoute"></app-navbar>
    <router-outlet></router-outlet>
    <!-- Mostrar footer solo en rutas públicas (NO en /admin) -->
    <app-footer *ngIf="!isAdminRoute"></app-footer>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'AutoVibes - Compra y Venta de Autos';
  isAdminRoute = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Al iniciar la app, limpiar localStorage para evitar conflictos entre cuentas Google
    // SOLO mantener token si estamos accediendo a ruta admin protegida
    const currentUrl = this.router.url;
    const esRutaAdminProtegida = currentUrl.startsWith('/admin') && !currentUrl.startsWith('/admin/login');
    
    if (!esRutaAdminProtegida) {
      console.log('🔄 Limpiando datos de sesión anterior al iniciar (ruta pública):', currentUrl);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentUser');
    }
    
    // Detectar cambios de ruta
    this.router.events.subscribe(() => {
      this.isAdminRoute = this.router.url.startsWith('/admin');
      const esLogin = this.router.url === '/admin/login';
      const esRutaAdmin = this.router.url.startsWith('/admin') && !esLogin;
      
      // Si no es admin y no es login, limpiar sesión
      if (!esRutaAdmin && !esLogin) {
        const tieneToken = !!localStorage.getItem('token');
        if (tieneToken) {
          console.log('🔄 Limpiando sesión en ruta pública:', this.router.url);
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('currentUser');
        }
      }
    });
  }
}
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
    // Detectar si estamos en una ruta admin
    this.router.events.subscribe(() => {
      this.isAdminRoute = this.router.url.startsWith('/admin');
    });
  }
}
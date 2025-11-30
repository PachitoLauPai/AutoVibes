import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <!-- Mostrar navbar solo en rutas públicas (NO en /admin) -->
    <app-navbar *ngIf="!isAdminRoute"></app-navbar>
    <router-outlet></router-outlet>
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
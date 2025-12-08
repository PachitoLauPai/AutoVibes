import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <div class="logo-section">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 7l-7 5 7 5V7z" fill="currentColor"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <h2>AutoVibes</h2>
          </div>
          <p class="sidebar-subtitle">Panel de Control</p>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <a class="nav-link" [routerLink]="['/admin/dashboard']" routerLinkActive="active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18M3 6h18M3 18h18M1 4h22v16H1z"/>
              </svg>
              <span>Dashboard</span>
            </a>
          </div>

          <div class="nav-section">
            <p class="nav-section-title">Gestión</p>
            <a class="nav-link" [routerLink]="['/admin/autos']" routerLinkActive="active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 17h2v.5M1 7h22v10H1zM6.5 17a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM22.5 17a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
              </svg>
              <span>Autos</span>
            </a>
            <a class="nav-link" [routerLink]="['/admin/contactos']" routerLinkActive="active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Contactos</span>
            </a>
          </div>

          <div class="nav-section nav-bottom">
            <button class="nav-link logout-btn" (click)="logout()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 13l4-4m0 0l-4-4m4 4H9"/>
              </svg>
              <span>Salir</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <div class="admin-top-bar">
          <div class="breadcrumb">
            <!-- Breadcrumb will be added via router -->
          </div>
          <div class="admin-user-info">
            <span class="admin-user-name">Administrador</span>
          </div>
        </div>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .admin-container {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* SIDEBAR STYLES */
    .admin-sidebar {
      width: 280px;
      background: linear-gradient(180deg, #1a1a2e 0%, #0f3460 100%);
      color: white;
      padding: 0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      border-right: 1px solid rgba(255, 165, 0, 0.2);
      z-index: 1000;
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 165, 0, 0.1));
      border-bottom: 2px solid rgba(255, 165, 0, 0.3);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .logo-icon {
      width: 28px;
      height: 28px;
      color: #ff6b6b;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .sidebar-subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 0.75rem;
      color: rgba(255, 165, 0, 0.8);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .sidebar-nav {
      padding: 1.5rem 0;
    }

    .nav-section {
      margin-bottom: 1.5rem;
      padding: 0 0.5rem;
    }

    .nav-section-title {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      color: rgba(255, 165, 0, 0.6);
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 3px solid transparent;
      margin: 0.25rem 0;
    }

    .nav-link svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .nav-link span {
      font-weight: 500;
      font-size: 0.95rem;
    }

    .nav-link:hover {
      background-color: rgba(255, 165, 0, 0.15);
      color: #ffa500;
      border-left-color: #ffa500;
      padding-left: 1.5rem;
    }

    .nav-link.active {
      background-color: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
      border-left-color: #ff6b6b;
      font-weight: 600;
    }

    .nav-bottom {
      border-top: 1px solid rgba(255, 165, 0, 0.2);
      padding-top: 1.5rem;
      margin-top: auto;
    }

    .logout-btn {
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }

    .logout-btn:hover {
      background-color: rgba(255, 107, 107, 0.2) !important;
      color: #ff6b6b !important;
      border-left-color: #ff6b6b !important;
    }

    /* MAIN CONTENT AREA */
    .admin-main {
      margin-left: 280px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .admin-top-bar {
      background: white;
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .admin-user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .admin-user-name {
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .admin-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }


    /* RESPONSIVE */
    @media (max-width: 1024px) {
      .admin-sidebar {
        width: 240px;
      }

      .admin-main {
        margin-left: 240px;
      }
    }

    @media (max-width: 768px) {
      .admin-sidebar {
        position: fixed;
        left: -280px;
        width: 280px;
        height: 100vh;
        z-index: 999;
        transition: left 0.3s ease;
      }

      .admin-sidebar.open {
        left: 0;
      }

      .admin-main {
        margin-left: 0;
      }

      .admin-content {
        padding: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar que el usuario sea administrador
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/auth/admin-login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

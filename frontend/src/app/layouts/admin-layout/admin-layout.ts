import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2>🔧 Admin</h2>
        </div>

        <nav class="sidebar-nav">
          <a class="nav-link" [routerLink]="['/admin/dashboard']" routerLinkActive="active">
            📊 Dashboard
          </a>
          <a class="nav-link" [routerLink]="['/admin/autos']" routerLinkActive="active">
            🚗 Autos
          </a>
          <a class="nav-link" [routerLink]="['/admin/contactos']" routerLinkActive="active">
            💬 Contactos
          </a>
          <hr>
          <button class="nav-link logout-btn" (click)="logout()">
            🚪 Salir
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .admin-sidebar {
      width: 250px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 20px 0;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 2px solid #ff8c00;
      margin-bottom: 20px;
      text-align: center;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 24px;
      color: #ff8c00;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 0 10px;
    }

    .nav-link {
      padding: 12px 16px;
      color: #b0b0b0;
      text-decoration: none;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 5px;
      font-size: 14px;
      transition: all 0.3s ease;
      text-align: left;
      font-weight: 500;
    }

    .nav-link:hover {
      background-color: rgba(255, 140, 0, 0.1);
      color: #ff8c00;
    }

    .nav-link.active {
      background-color: #ff8c00;
      color: white;
    }

    .logout-btn {
      margin-top: 20px;
      background-color: rgba(255, 67, 54, 0.1) !important;
      color: #ff4336 !important;
    }

    .logout-btn:hover {
      background-color: rgba(255, 67, 54, 0.2) !important;
    }

    .admin-main {
      margin-left: 250px;
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }

    hr {
      border: none;
      border-top: 1px solid rgba(255, 140, 0, 0.3);
      margin: 15px 0;
    }

    @media (max-width: 768px) {
      .admin-sidebar {
        width: 200px;
      }

      .admin-main {
        margin-left: 200px;
        padding: 15px;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('Admin Layout inicializado');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    console.log('Admin desconectado');
    this.router.navigate(['/home']);
  }
}

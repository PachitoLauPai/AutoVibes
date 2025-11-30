import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-header">
      <h1>Bienvenido al Panel de Administración</h1>
      <p>Gestiona tu catálogo de vehículos y contactos</p>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-icon">🚗</div>
        <h3>Autos en Catálogo</h3>
        <p class="card-number">24</p>
        <a (click)="navigate('/admin/autos')" class="card-link">Ver detalles →</a>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">💬</div>
        <h3>Contactos Nuevos</h3>
        <p class="card-number">5</p>
        <a (click)="navigate('/admin/contactos')" class="card-link">Ver mensajes →</a>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">👁️</div>
        <h3>Visualizaciones Hoy</h3>
        <p class="card-number">142</p>
        <a (click)="navigate('/admin/autos')" class="card-link">Ver análisis →</a>
      </div>

      <div class="dashboard-card">
        <div class="card-icon">⭐</div>
        <h3>Calificación Promedio</h3>
        <p class="card-number">4.8</p>
        <a (click)="navigate('/admin/autos')" class="card-link">Ver reviews →</a>
      </div>
    </div>

    <div class="dashboard-actions">
      <a (click)="navigate('/admin/autos')" class="btn-primary">
        ➕ Agregar Nuevo Auto
      </a>
      <a (click)="navigate('/admin/contactos')" class="btn-secondary">
        📨 Ver Todos los Contactos
      </a>
    </div>
  `,
  styles: [`
    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #333;
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }

    .dashboard-header p {
      color: #666;
      margin: 0;
      font-size: 1rem;
    }

    /* Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
    }

    .dashboard-card:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .dashboard-card h3 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
    }

    .card-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #ff6600;
      margin: 0.5rem 0;
    }

    .card-link {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
      cursor: pointer;
      transition: color 0.2s;
      display: inline-block;
      margin-top: 0.5rem;
    }

    .card-link:hover {
      color: #5568d3;
      text-decoration: underline;
    }

    /* Actions */
    .dashboard-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: inline-block;
      border: none;
    }

    .btn-primary {
      background-color: #ff6600;
      color: white;
    }

    .btn-primary:hover {
      background-color: #ff5500;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
    }

    .btn-secondary {
      background-color: #667eea;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  `]
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.debug('DashboardComponent inicializado');
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}

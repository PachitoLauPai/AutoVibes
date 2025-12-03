import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';
import { DashboardService, DashboardStats } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private logger: LoggerService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.logger.debug('DashboardComponent inicializado');
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.loading = true;
    this.error = '';
    
    this.dashboardService.obtenerEstadisticas().subscribe({
      next: (stats: DashboardStats) => {
        this.stats = stats;
        this.loading = false;
        this.logger.debug('Estadísticas cargadas:', stats);
      },
      error: (err: any) => {
        this.error = 'Error al cargar las estadísticas. Por favor, intenta más tarde.';
        this.loading = false;
        this.logger.error('Error cargando estadísticas:', err);
      }
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../../core/services/dashboard.service';
import { Auto } from '../../../../core/models/auto.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  autos: Auto[] = [];
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.loading = true;
    this.error = '';
    
    this.dashboardService.obtenerEstadisticas().subscribe({
      next: (stats: DashboardStats) => {
        // Agregar propiedad autosDisponibles si no existe
        if (!stats.autosDisponibles) {
          stats.autosDisponibles = stats.totalAutos;
        }
        
        // Obtener los autos de la respuesta (castear como any para acceder a propiedades dinámicas)
        const statsAny = stats as any;
        if (statsAny.autos && statsAny.autos.length > 0) {
          this.autos = statsAny.autos as Auto[];
        } else if (statsAny.todosLosAutos && statsAny.todosLosAutos.length > 0) {
          this.autos = statsAny.todosLosAutos as Auto[];
        }
        
        this.stats = stats;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar las estadísticas. Por favor, intenta más tarde.';
        this.loading = false;
        console.error('Error cargando estadísticas:', err);
      }
    });
  }

  verTodosLosAutos(): void {
    this.router.navigate(['/admin/autos']);
  }

  verAutosDisponibles(): void {
    this.router.navigate(['/admin/autos']);
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';
import { AutoService } from '../../../../core/services/auto.service';
import { Auto } from '../../../../core/models/auto.model';

@Component({
  selector: 'app-admin-auto-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-auto-list.html',
  styleUrl: './admin-auto-list.css'
})
export class AdminAutoListComponent implements OnInit {
  autos: Auto[] = [];
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private logger: LoggerService,
    private autoService: AutoService
  ) {}

  ngOnInit(): void {
    this.logger.debug('AdminAutoListComponent inicializado');
    this.cargarAutos();
  }

  cargarAutos(): void {
    this.loading = true;
    this.error = '';
    
    this.autoService.getTodosLosAutos().subscribe({
      next: (autos: Auto[]) => {
        this.autos = autos;
        this.loading = false;
        this.logger.debug('Autos cargados:', autos);
      },
      error: (err: any) => {
        this.error = 'Error al cargar los autos. Por favor, intenta más tarde.';
        this.loading = false;
        this.logger.error('Error cargando autos:', err);
      }
    });
  }

  agregarAuto(): void {
    this.logger.info('Navegando a formulario de nuevo auto');
    this.router.navigate(['/admin/autos/nuevo']);
  }

  editarAuto(id: number | undefined): void {
    if (!id) return;
    this.logger.info('Editando auto:', id);
    this.router.navigate(['/admin/autos/editar', id]);
  }

  eliminarAuto(id: number | undefined): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este auto?')) {
      this.logger.info('Eliminando auto:', id);
      this.autoService.eliminarAuto(id).subscribe({
        next: () => {
          this.logger.info('Auto eliminado exitosamente');
          this.cargarAutos();
        },
        error: (err: any) => {
          this.logger.error('Error al eliminar auto:', err);
          alert('Error al eliminar el auto');
        }
      });
    }
  }
}

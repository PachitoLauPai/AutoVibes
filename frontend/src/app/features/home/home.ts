import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AutoService } from '../../../core/services/auto.service';
import { Auto } from '../../../core/models/auto.model';
import { Marca, CategoriaAuto } from '../../../core/models/shared.model';
import { LoggerService } from '../../../core/services/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  autos: Auto[] = [];
  autosFilterrados: Auto[] = [];  // ✅ CORRECTO (sin typo)

  // Filtros
  marcas: Marca[] = [];
  categorias: CategoriaAuto[] = [];

  filtroMarca: string = '';
  filtroCategoria: string = '';
  filtroModelo: string = '';

  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private autoService: AutoService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.cargarOpciones();
    this.cargarAutos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarOpciones(): void {
    // Cargar marcas
    this.autoService.getMarcas().pipe(takeUntil(this.destroy$)).subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        this.logger.debug('Marcas cargadas', { count: marcas.length });
      },
      error: (err) => this.logger.error('Error cargando marcas', err)
    });

    // Cargar categorías
    this.autoService.getCategorias().pipe(takeUntil(this.destroy$)).subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.logger.debug('Categorías cargadas', { count: categorias.length });
      },
      error: (err) => this.logger.error('Error cargando categorías', err)
    });
  }

  cargarAutos(): void {
    this.loading = true;
    this.error = '';
    
    this.autoService.getAutosDisponibles().pipe(takeUntil(this.destroy$)).subscribe({
      next: (autos) => {
        this.autos = autos;
        this.autosFilterrados = autos;  // ✅ CORRECTO
        this.loading = false;
        this.logger.debug('Autos cargados', { count: autos.length });
      },
      error: (err) => {
        this.error = 'Error al cargar los autos';
        this.loading = false;
        this.logger.error('Error cargando autos', err);
      }
    });
  }

  buscar(): void {
    this.logger.debug('Buscando con filtros', {
      marca: this.filtroMarca,
      categoria: this.filtroCategoria,
      modelo: this.filtroModelo
    });

    this.autosFilterrados = this.autos.filter(auto => {
      const coincideMarca = !this.filtroMarca || 
        auto.marca.id.toString() === this.filtroMarca;
      
      const coincideCategoria = !this.filtroCategoria || 
        auto.categoria.id.toString() === this.filtroCategoria;
      
      const coincideModelo = !this.filtroModelo || 
        auto.modelo.toLowerCase().includes(this.filtroModelo.toLowerCase());

      return coincideMarca && coincideCategoria && coincideModelo;
    });

    this.logger.debug('Resultados encontrados', { count: this.autosFilterrados.length });
  }

  limpiarFiltros(): void {
    this.filtroMarca = '';
    this.filtroCategoria = '';
    this.filtroModelo = '';
    this.autosFilterrados = this.autos;
    this.logger.debug('Filtros limpiados');
  }

  verDetalles(autoId: number): void {
    this.router.navigate(['/autos', autoId]);
  }

  contactarVendedor(auto: Auto): void {
    this.router.navigate(['/autos', auto.id, 'contactar']);
  }
}
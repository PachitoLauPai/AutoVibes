import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AutoService } from '../../../core/services/auto.service';
import { Auto } from '../../../core/models/auto.model';
import { Marca, CategoriaAuto, CondicionAuto } from '../../../core/models/shared.model';
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
  // Filtros
  marcas: Marca[] = [];
  categorias: CategoriaAuto[] = [];
  condiciones: CondicionAuto[] = [];

  filtroMarca: string = '';
  filtroTipo: string = '';

  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private autoService: AutoService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.cargarOpciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarOpciones(): void {
    this.loading = true;
    this.error = '';

    // Cargar marcas
    this.autoService.getMarcas().pipe(takeUntil(this.destroy$)).subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        console.log('✅ Marcas cargadas:', { count: marcas.length, data: marcas });
      },
      error: (err) => {
        console.error('❌ Error cargando marcas:', err);
        this.error = 'Error al cargar marcas';
      }
    });

    // Cargar categorías
    this.autoService.getCategorias().pipe(takeUntil(this.destroy$)).subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        console.log('✅ Categorías cargadas:', { count: categorias.length, data: categorias });
      },
      error: (err) => {
        console.error('❌ Error cargando categorías:', err);
        this.error = 'Error al cargar categorías';
      }
    });

    // Cargar condiciones
    this.autoService.getCondiciones().pipe(takeUntil(this.destroy$)).subscribe({
      next: (condiciones) => {
        this.condiciones = condiciones;
        console.log('✅ Condiciones cargadas:', { count: condiciones.length, data: condiciones });
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando condiciones:', err);
        this.error = 'Error al cargar condiciones';
        this.loading = false;
      }
    });
  }

  irAVehiculos(): void {
    const queryParams: any = {};
    
    if (this.filtroTipo) {
      queryParams.condicion = this.filtroTipo;
    }
    
    if (this.filtroMarca) {
      queryParams.marca = this.filtroMarca;
    }
    
    this.router.navigate(['/autos'], { queryParams });
  }

  irAlCatalogo(): void {
    this.router.navigate(['/autos']);
  }

  abrirContacto(): void {
    // Emitir evento para que el navbar abra el formulario de contacto
    window.dispatchEvent(new CustomEvent('abrirModalContacto'));
  }

  irACategoria(categoriaId: number): void {
    this.router.navigate(['/autos'], { queryParams: { categoria: categoriaId } });
  }

  getCategoryImage(categoriaNombre: string): string {
    // Mapear nombres de categorías a nombres de archivo
    // Los archivos están en minúsculas con casos especiales
    const nombreUpper = categoriaNombre.toUpperCase().trim();
    const imageMap: { [key: string]: string } = {
      'SEDAN': 'sedan',
      'CAMIONETA': 'camioneta',
      'HATCHBACK': 'hatchback',
      'PICKUP': 'pick-up',  // El archivo tiene guión
      'VAN': 'vans',        // El archivo es plural
      'DEPORTIVO': 'deportivo'
    };
    
    const nombreArchivo = imageMap[nombreUpper] || nombreUpper.toLowerCase();
    return `/P_categorias/P_${nombreArchivo}.webp`;
  }

  onCategoryImageError(event: any, categoriaNombre: string): void {
    console.error(`Error cargando imagen para categoría ${categoriaNombre}`);
    // Ocultar la imagen rota y mostrar un emoji como fallback
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    if (parent) {
      const emojiMap: { [key: string]: string } = {
        'SEDAN': '🚗',
        'CAMIONETA': '🚙',
        'HATCHBACK': '🚐',
        'PICKUP': '🚚',
        'VAN': '🚐',
        'DEPORTIVO': '🏎️'
      };
      const emoji = emojiMap[categoriaNombre.toUpperCase()] || '🚗';
      parent.innerHTML = `<span style="font-size: 4rem;">${emoji}</span>`;
    }
  }
}
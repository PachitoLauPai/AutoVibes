import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoService } from '../../../../core/services/auto.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Marca, Combustible, Transmision, CategoriaAuto, CondicionAuto } from '../../../../core/models/shared.model';
import { AutoRequest } from '../../../../core/models/AutoRequest';

@Component({
  selector: 'app-auto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auto-form.html',
  styleUrl: './auto-form.css'
})
export class AutoFormComponent implements OnInit {
  auto: any = {
    marcaId: null,
    modelo: '',
    anio: new Date().getFullYear(),
    precio: 0,
    color: '',
    kilometraje: 0,
    stock: 0,  // Stock del vehículo
    combustibleId: null,
    transmisionId: null,
    categoriaId: null,
    condicionId: null,
    descripcion: '',
    imagenes: ['']
  };

  loading: boolean = false;
  error: string = '';
  success: string = '';

  // Arrays para los selects
  marcas: Marca[] = [];
  combustibles: Combustible[] = [];
  transmisiones: Transmision[] = [];
  categorias: CategoriaAuto[] = [];
  condiciones: CondicionAuto[] = [];

  loadingMarcas: boolean = false;
  loadingCombustibles: boolean = false;
  loadingTransmisiones: boolean = false;
  loadingCategorias: boolean = false;
  loadingCondiciones: boolean = false;

  kilometrajeDisabled: boolean = false;

  constructor(
    private autoService: AutoService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarMarcas();
    this.cargarCombustibles();
    this.cargarTransmisiones();
    this.cargarCategorias();
    this.cargarCondiciones();
  }

  // ... (keeping existing loading methods)

  onCondicionChange(condicionIdValue?: any): void {
    // Si viene del evento, usar ese valor, si no, usar el del modelo (pero preferir el argumento)
    const idToUse = condicionIdValue ? Number(condicionIdValue) : Number(this.auto.condicionId);
    console.log('Condicion cambiada a:', idToUse);

    // Asegurar que el modelo se actualice si usamos ngModelChange
    if (condicionIdValue) {
      this.auto.condicionId = idToUse;
    }

    const condicion = this.condiciones.find(c => c.id === idToUse);

    if (condicion) {
      const nombreStr = condicion.nombre.trim().toUpperCase();
      console.log('Nombre condicion:', nombreStr);

      if (nombreStr === 'NUEVO') {
        this.auto.kilometraje = 0;
        this.kilometrajeDisabled = true;
      } else if (nombreStr === 'USADO') {
        this.kilometrajeDisabled = false;
      }
    }
  }

  cargarMarcas(): void {
    // ... (method body kept same by replace tool context matching, but for brevity in prompt I show this)
    this.loadingMarcas = true;
    this.autoService.getMarcas().subscribe({
      next: (data) => {
        this.marcas = data;
        this.loadingMarcas = false;
      },
      error: (err) => {
        console.error('Error al cargar marcas:', err);
        this.loadingMarcas = false;
      }
    });
  }

  cargarCombustibles(): void {
    this.loadingCombustibles = true;
    this.autoService.getCombustibles().subscribe({
      next: (data) => {
        this.combustibles = data;
        this.loadingCombustibles = false;
      },
      error: (err) => {
        console.error('Error al cargar combustibles:', err);
        this.loadingCombustibles = false;
      }
    });
  }

  cargarTransmisiones(): void {
    this.loadingTransmisiones = true;
    this.autoService.getTransmisiones().subscribe({
      next: (data) => {
        this.transmisiones = data;
        this.loadingTransmisiones = false;
      },
      error: (err) => {
        console.error('Error al cargar transmisiones:', err);
        this.loadingTransmisiones = false;
      }
    });
  }

  cargarCategorias(): void {
    this.loadingCategorias = true;
    this.autoService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.loadingCategorias = false;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.loadingCategorias = false;
      }
    });
  }

  cargarCondiciones(): void {
    this.loadingCondiciones = true;
    this.autoService.getCondiciones().subscribe({
      next: (data) => {
        this.condiciones = data;
        this.loadingCondiciones = false;
      },
      error: (err) => {
        console.error('Error al cargar condiciones:', err);
        this.loadingCondiciones = false;
      }
    });
  }

  agregarImagen(): void {
    this.auto.imagenes.push('');
  }

  eliminarImagen(index: number): void {
    this.auto.imagenes.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onSubmit(): void {
    if (!this.authService.isAdmin()) {
      this.error = 'Solo los administradores pueden agregar autos';
      return;
    }

    // Validar que marcaId sea válido
    if (!this.auto.marcaId) {
      this.error = 'Por favor selecciona una marca';
      return;
    }

    // Validación de Kilometraje vs Condición
    const condicionId = Number(this.auto.condicionId);
    const condicion = this.condiciones.find(c => c.id === condicionId);
    const km = Number(this.auto.kilometraje || 0);

    if (condicion) {
      const nombreCondicion = condicion.nombre.toUpperCase().trim();

      if (nombreCondicion === 'NUEVO' && km > 0) {
        this.error = 'Error: Un auto NUEVO no puede tener kilometraje mayor a 0.';
        return;
      }

      if (nombreCondicion === 'USADO' && km === 0) {
        this.error = 'Error: Un auto USADO debe tener kilometraje mayor a 0.';
        return;
      }
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Filtrar imágenes vacías y convertir IDs a números
    const autoData: AutoRequest = {
      marcaId: Number(this.auto.marcaId),
      modelo: this.auto.modelo,
      anio: Number(this.auto.anio),
      precio: Number(this.auto.precio),
      color: this.auto.color,
      kilometraje: Number(this.auto.kilometraje),
      combustibleId: this.auto.combustibleId ? Number(this.auto.combustibleId) : undefined,
      transmisionId: this.auto.transmisionId ? Number(this.auto.transmisionId) : undefined,
      categoriaId: this.auto.categoriaId ? Number(this.auto.categoriaId) : undefined,
      condicionId: this.auto.condicionId ? Number(this.auto.condicionId) : undefined,
      descripcion: this.auto.descripcion,
      imagenes: this.auto.imagenes.filter((img: string) => img.trim() !== '')
    };

    this.autoService.crearAuto(autoData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Auto creado exitosamente';
        setTimeout(() => {
          this.router.navigate(['/autos']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al crear el auto: ' + (error.error?.message || error.message);
        console.error('Error:', error);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/autos']);
  }
}
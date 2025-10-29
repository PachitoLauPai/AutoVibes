import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AutoService, Auto } from '../../../../core/services/auto.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auto-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auto-edit.html',
  styleUrl: './auto-edit.css'
})
export class AutoEditComponent implements OnInit {
  auto: Auto | null = null;
  loading: boolean = true;
  saving: boolean = false;
  error: string = '';
  success: string = '';

  autoEditado: any = {
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    precio: 0,
    color: '',
    kilometraje: 0,
    combustible: 'GASOLINA',
    transmision: 'AUTOMATICA',
    descripcion: '',
    imagenes: ['']
  };

  combustibles = ['GASOLINA', 'DIESEL', 'HIBRIDO', 'ELECTRICO'];
  transmisiones = ['MANUAL', 'AUTOMATICA'];

  constructor(
    private autoService: AutoService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/autos']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarAuto(parseInt(id));
    }
  }

  cargarAuto(id: number): void {
    this.loading = true;
    this.autoService.getAuto(id).subscribe({
      next: (auto: Auto) => {
        this.auto = auto;
        this.autoEditado = {
          marca: auto.marca,
          modelo: auto.modelo,
          anio: auto.anio,
          precio: auto.precio,
          color: auto.color || '',
          kilometraje: auto.kilometraje || 0,
          combustible: auto.combustible,
          transmision: auto.transmision,
          descripcion: auto.descripcion || '',
          imagenes: auto.imagenes && auto.imagenes.length > 0 ? [...auto.imagenes] : ['']
        };
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al cargar el auto';
        console.error('Error:', error);
      }
    });
  }

  agregarImagen(): void {
    this.autoEditado.imagenes.push('');
  }

  eliminarImagen(index: number): void {
    this.autoEditado.imagenes.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onSubmit(): void {
    if (!this.authService.isAdmin()) {
      this.error = 'Solo los administradores pueden editar autos';
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    // Filtrar imágenes vacías
    const autoData = {
      ...this.autoEditado,
      imagenes: this.autoEditado.imagenes.filter((img: string) => img.trim() !== '')
    };

    if (this.auto) {
      this.autoService.actualizarAuto(this.auto.id, autoData).subscribe({
        next: (response) => {
          this.saving = false;
          this.success = 'Auto actualizado correctamente';
          setTimeout(() => {
            this.router.navigate(['/autos']);
          }, 2000);
        },
        error: (error) => {
          this.saving = false;
          this.error = 'Error al actualizar el auto';
          console.error('Error:', error);
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/autos']);
  }
}
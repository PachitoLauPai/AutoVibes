import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoService } from '../../../../core/services/auto.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auto-form.html',
  styleUrl: './auto-form.css'
})
export class AutoFormComponent {
  auto: any = {
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

  loading: boolean = false;
  error: string = '';
  success: string = '';

  combustibles = ['GASOLINA', 'DIESEL', 'HIBRIDO', 'ELECTRICO'];
  transmisiones = ['MANUAL', 'AUTOMATICA'];

  constructor(
    private autoService: AutoService,
    private authService: AuthService,
    private router: Router
  ) {}

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

    this.loading = true;
    this.error = '';
    this.success = '';

    // Filtrar imágenes vacías
    const autoData = {
      ...this.auto,
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
        this.error = 'Error al crear el auto';
        console.error('Error:', error);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/autos']);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AutoService, Auto } from '../../../../core/services/auto.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auto-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auto-list.html',
  styleUrl: './auto-list.css'
})
export class AutoListComponent implements OnInit {
  autos: Auto[] = [];
  loading: boolean = true;
  error: string = '';

  currentImageIndex: Map<number, number> = new Map();

  constructor(
    private autoService: AutoService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAutos();
  }

  cargarAutos(): void {
    this.loading = true;
    
    if (this.authService.isAdmin()) {
      // ✅ ADMIN: Ve todos los autos
      this.autoService.getAutos().subscribe({
        next: (autos: Auto[]) => {
          this.autos = autos;
          this.inicializarIndices();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Error al cargar los autos';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    } else {
      // ✅ CLIENTE: Solo ve autos disponibles
      this.autoService.getAutosDisponibles().subscribe({
        next: (autos: Auto[]) => {
          this.autos = autos;
          this.inicializarIndices();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Error al cargar los autos';
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }

  inicializarIndices(): void {
    this.autos.forEach(auto => {
      this.currentImageIndex.set(auto.id, 0);
    });
  }

  // ✅ MÉTODO: Verificar si un auto está disponible para mostrar
  estaDisponibleParaCliente(auto: Auto): boolean {
    if (this.authService.isAdmin()) {
      return true; // Admin ve todo
    }
    return auto.disponible; // Cliente solo ve disponibles
  }

  // ✅ MÉTODO: Obtener texto del estado para admin
  getEstadoTexto(auto: Auto): string {
    if (!auto.disponible) {
      return '⏳ Venta Pendiente';
    }
    return '✅ Disponible';
  }

  // ✅ MÉTODO: Obtener clase CSS del estado
  getEstadoClass(auto: Auto): string {
    if (!auto.disponible) {
      return 'estado-pendiente';
    }
    return 'estado-disponible';
  }

  // ========== MÉTODO GESTIONAR AUTO (NUEVO) ==========
  gestionarAuto(auto: Auto): void {
    const opciones = [
      'Cambiar estado disponible/no disponible',
      'Ver detalles completos',
      'Gestionar imágenes',
      'Marcar como vendido',
      'Ver historial'
    ];

    const opcionSeleccionada = prompt(
      `Gestión: ${auto.marca} ${auto.modelo}\n\n` +
      `Opciones:\n${opciones.map((op, index) => `${index + 1}. ${op}`).join('\n')}\n\n` +
      `Ingresa el número de opción:`
    );

    switch (opcionSeleccionada) {
      case '1':
        this.cambiarEstadoAuto(auto);
        break;
      case '2':
        this.verDetallesCompletos(auto);
        break;
      case '3':
        this.gestionarImagenes(auto);
        break;
      case '4':
        this.marcarComoVendido(auto);
        break;
      case '5':
        this.verHistorial(auto);
        break;
      default:
        console.log('Opción no válida o cancelada');
    }
  }

  // ✅ MÉTODO: Cambiar estado del auto
  cambiarEstadoAuto(auto: Auto): void {
    const nuevoEstado = !auto.disponible;
    const textoEstado = nuevoEstado ? 'Disponible' : 'No Disponible';
    
    if (confirm(`¿Cambiar estado de "${auto.marca} ${auto.modelo}" a ${textoEstado}?`)) {
      this.autoService.actualizarAuto(auto.id, { disponible: nuevoEstado }).subscribe({
        next: (autoActualizado) => {
          auto.disponible = nuevoEstado;
          alert(`✅ Estado actualizado correctamente a: ${textoEstado}`);
        },
        error: (error) => {
          console.error('Error al actualizar estado:', error);
          alert('❌ Error al actualizar el estado del auto');
        }
      });
    }
  }

  // ✅ MÉTODO: Ver detalles completos
  verDetallesCompletos(auto: Auto): void {
    const detalles = `
      📋 DETALLES COMPLETOS:
      
      🚗 Vehículo: ${auto.marca} ${auto.modelo}
      📅 Año: ${auto.anio}
      💰 Precio: $${auto.precio?.toLocaleString()}
      🛣️ Kilometraje: ${auto.kilometraje?.toLocaleString()} km
      🎨 Color: ${auto.color}
      📝 Descripción: ${auto.descripcion}
      ✅ Estado: ${auto.disponible ? 'Disponible' : 'No Disponible'}
      🆔 ID: ${auto.id}
    `;
    
    alert(detalles);
  }

  // ✅ MÉTODO: Gestionar imágenes (placeholder)
  gestionarImagenes(auto: Auto): void {
    alert(`🖼️ Gestión de imágenes para: ${auto.marca} ${auto.modelo}\n\nEsta funcionalidad estará disponible pronto.`);
    // Aquí puedes implementar la navegación a un editor de imágenes
    // this.router.navigate(['/admin/autos/imagenes', auto.id]);
  }

  // ✅ MÉTODO: Marcar como vendido
  marcarComoVendido(auto: Auto): void {
    if (confirm(`¿Marcar "${auto.marca} ${auto.modelo}" como VENDIDO?\n\nEsta acción cambiará el estado a "No Disponible".`)) {
      this.autoService.actualizarAuto(auto.id, { disponible: false }).subscribe({
        next: (autoActualizado) => {
          auto.disponible = false;
          alert(`✅ ${auto.marca} ${auto.modelo} marcado como VENDIDO`);
        },
        error: (error) => {
          console.error('Error al marcar como vendido:', error);
          alert('❌ Error al marcar el auto como vendido');
        }
      });
    }
  }

  // ✅ MÉTODO: Ver historial (placeholder)
  verHistorial(auto: Auto): void {
    alert(`📊 Historial para: ${auto.marca} ${auto.modelo}\n\nEsta funcionalidad estará disponible en la próxima actualización.`);
  }

  // ========== MÉTODOS EXISTENTES DEL CARRUSEL ==========

  // Obtener imagen actual de un auto
  getCurrentImage(auto: Auto): string {
    if (!auto.imagenes || auto.imagenes.length === 0) {
      return this.getDefaultImage(auto);
    }
    const index = this.currentImageIndex.get(auto.id) || 0;
    return auto.imagenes[index];
  }

  // Obtener índice de imagen actual
  getCurrentImageIndex(auto: Auto): number {
    return this.currentImageIndex.get(auto.id) || 0;
  }

  // Cambiar a imagen específica
  setCurrentImage(auto: Auto, index: number): void {
    this.currentImageIndex.set(auto.id, index);
  }

  // Siguiente imagen
  nextImage(auto: Auto): void {
    if (!auto.imagenes || auto.imagenes.length === 0) return;
    
    const currentIndex = this.currentImageIndex.get(auto.id) || 0;
    const nextIndex = (currentIndex + 1) % auto.imagenes.length;
    this.currentImageIndex.set(auto.id, nextIndex);
  }

  // Imagen anterior
  prevImage(auto: Auto): void {
    if (!auto.imagenes || auto.imagenes.length === 0) return;
    
    const currentIndex = this.currentImageIndex.get(auto.id) || 0;
    const prevIndex = currentIndex === 0 ? auto.imagenes.length - 1 : currentIndex - 1;
    this.currentImageIndex.set(auto.id, prevIndex);
  }

  // Imagen por defecto si no hay imágenes
  getDefaultImage(auto: Auto): string {
    return `https://via.placeholder.com/400x300/cccccc/666666?text=${auto.marca}+${auto.modelo}`;
  }

  // Manejar error de imagen
  onImageError(event: any, auto: Auto): void {
    event.target.src = this.getDefaultImage(auto);
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }

  editarAuto(auto: Auto): void {
    this.router.navigate(['/admin/autos/editar', auto.id]);
  }

  eliminarAuto(auto: Auto): void {
    if (confirm(`¿Estás seguro de eliminar el ${auto.marca} ${auto.modelo}?\n\nEsta acción no se puede deshacer.`)) {
      this.autoService.eliminarAuto(auto.id).subscribe({
        next: () => {
          alert(`✅ ${auto.marca} ${auto.modelo} eliminado correctamente`);
          this.cargarAutos();
        },
        error: (error) => {
          this.error = 'Error al eliminar el auto';
          console.error('Error:', error);
          alert('❌ Error al eliminar el auto. Verifica la consola para más detalles.');
        }
      });
    }
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }
}
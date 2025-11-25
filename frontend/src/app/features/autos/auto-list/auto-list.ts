import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AutoService } from '../../../../core/services/auto.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VentaService } from '../../../../core/services/venta.service';
import { Auto } from '../../../../core/models/auto.model';
import { VentaResponse } from '../../../../core/models/venta.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auto-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auto-list.html',
  styleUrls: ['./auto-list.css']
})
export class AutoListComponent implements OnInit, OnDestroy {
  autos: Auto[] = [];
  ventasPorAuto: Map<number, VentaResponse[]> = new Map();
  loading: boolean = true;
  error: string = '';
  
  vistaActual: 'disponibles' | 'vendidos' | 'todos' = 'disponibles';
  contadores = {
    todos: 0,
    disponibles: 0,
    vendidos: 0
  };

  currentImageIndex: Map<number, number> = new Map();
  private destroy$ = new Subject<void>();

  constructor(
    private autoService: AutoService,
    private ventaService: VentaService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAutos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ...existing code...
  cargarAutos(): void {
    this.loading = true;
    this.error = '';

    // Pedimos todos los autos si es admin; si no, sólo disponibles
    let observable = this.authService.isAdmin()
      ? this.autoService.getTodosLosAutos()
      : this.autoService.getAutosDisponibles();

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (autos: Auto[]) => {
        // Si es admin aplicamos filtro local según la vista seleccionada
        if (this.authService.isAdmin()) {
          switch (this.vistaActual) {
            case 'disponibles':
              autos = autos.filter(a => a.disponible);
              break;
            case 'vendidos':
              autos = autos.filter(a => !a.disponible);
              break;
            case 'todos':
            default:
              break;
          }
        }

        this.autos = autos;
        if (this.authService.isAdmin() && this.vistaActual === 'todos') {
          this.actualizarContadores();
        }
        this.inicializarIndices();
        this.loading = false;

        if (this.authService.isAdmin()) {
          this.cargarVentasParaAutos(autos);
        }
      },
      error: (error: any) => {
        this.error = 'Error al cargar los autos';
        this.loading = false;
        // Error ya manejado por el interceptor y ApiService
      }
    });
  }

  cargarVentasParaAutos(autos: Auto[]): void {
    // El backend no tiene /ventas/auto/{id}, por eso obtenemos todas y las agrupamos
    this.ventaService.getVentasAdmin().pipe(takeUntil(this.destroy$)).subscribe({
      next: (ventas: VentaResponse[]) => {
        this.ventasPorAuto.clear();
        ventas.forEach(v => {
          // VentaResponse devuelve autoId directamente
          const autoId = v.autoId ?? null;
          if (autoId == null) return;
          const arr = this.ventasPorAuto.get(Number(autoId)) || [];
          arr.push(v);
          this.ventasPorAuto.set(Number(autoId), arr);
        });
      },
      error: (err) => {
        // Error ya manejado por el interceptor
      }
    });
  }

  getEstadoTexto(auto: Auto): string {
    if (auto.disponible) {
      return '✅ Disponible';
    }
    
    const ultimaVenta = this.getUltimaVenta(auto);
    if (ultimaVenta) {
      return ultimaVenta.estado === 'FINALIZADO' ? 
        '💰 Venta Finalizada' : 
        '⏳ Venta Pendiente';
    }
    
    return '❓ Estado Desconocido';
  }

  getUltimaVenta(auto: Auto): VentaResponse | null {
    const ventas = this.ventasPorAuto.get(auto.id);
    if (!ventas || ventas.length === 0) return null;
    
    return ventas.sort((a, b) => 
      new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
    )[0];
  }

  tieneVentaFinalizada(auto: Auto): boolean {
    const ultimaVenta = this.getUltimaVenta(auto);
    return ultimaVenta ? ultimaVenta.estado === 'FINALIZADO' : false;
  }

  tieneVentaPendiente(auto: Auto): boolean {
    const ultimaVenta = this.getUltimaVenta(auto);
    return ultimaVenta ? ultimaVenta.estado === 'PENDIENTE' : false;
  }

  cambiarVista(vista: 'disponibles' | 'vendidos' | 'todos'): void {
    if (!this.authService.isAdmin()) return;
    
    this.vistaActual = vista;
    this.cargarAutos();
  }

  actualizarContadores(): void {
    if (this.authService.isAdmin() && this.vistaActual === 'todos') {
      this.contadores.todos = this.autos.length;
      this.contadores.disponibles = this.autos.filter(a => a.disponible).length;
      this.contadores.vendidos = this.autos.filter(a => !a.disponible).length;
    }
  }

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  reactivarAuto(auto: Auto): void {
    const marcaNombre = auto.marca?.nombre || 'Auto';
    if (confirm(`¿Re-activar el auto para nueva venta?\n\n${marcaNombre} ${auto.modelo} (${auto.anio})\n\nEl auto volverá a estar disponible para los clientes.`)) {
      this.autoService.reactivarAuto(auto.id).subscribe({
        next: (autoReactivated) => {
          const index = this.autos.findIndex(a => a.id === auto.id);
          if (index !== -1) {
            this.autos[index] = autoReactivated;
          }
          this.actualizarContadores();
          alert(`✅ Auto re-activado correctamente\n\n${marcaNombre} ${auto.modelo} ahora está disponible para nueva venta.`);
        },
        error: (error) => {
          alert('❌ Error al re-activar el auto: ' + (error.error?.message || error.message));
          console.error('Error reactivando auto:', error);
        }
      });
    }
  }

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  cambiarDisponibilidad(auto: Auto, disponible: boolean): void {
    const accion = disponible ? 'disponible' : 'no disponible';
    const mensaje = disponible ? 
      '¿Hacer disponible el auto para venta?' : 
      '¿Marcar el auto como no disponible?';
    const marcaNombre = auto.marca?.nombre || 'Auto';

    if (confirm(`${mensaje}\n\n${marcaNombre} ${auto.modelo} (${auto.anio})`)) {
      this.autoService.cambiarDisponibilidadAuto(auto.id, disponible).subscribe({
        next: (autoActualizado) => {
          const index = this.autos.findIndex(a => a.id === auto.id);
          if (index !== -1) {
            this.autos[index] = autoActualizado;
          }
          this.actualizarContadores();
          
          const nuevoEstado = disponible ? 'disponible' : 'no disponible';
          alert(`✅ Auto marcado como ${nuevoEstado} correctamente`);
        },
        error: (error) => {
          alert('❌ Error al cambiar disponibilidad: ' + (error.error?.message || error.message));
          console.error('Error cambiando disponibilidad:', error);
        }
      });
    }
  }

  inicializarIndices(): void {
    this.autos.forEach(auto => {
      this.currentImageIndex.set(auto.id, 0);
    });
  }

  estaDisponibleParaCliente(auto: Auto): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }
    return auto.disponible;
  }

  getEstadoClass(auto: Auto): string {
    if (auto.disponible) {
      return 'estado-disponible';
    }
    
    const ultimaVenta = this.getUltimaVenta(auto);
    if (ultimaVenta) {
      return ultimaVenta.estado === 'FINALIZADO' ? 
        'estado-finalizado' : 
        'estado-pendiente';
    }
    
    return 'estado-pendiente';
  }

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  gestionarAuto(auto: Auto): void {
    const marcaNombre = auto.marca?.nombre || 'Auto';
    const opciones = [
      'Cambiar estado disponible/no disponible',
      'Re-activar auto vendido',
      'Ver detalles completos',
      'Gestionar imágenes',
      'Marcar como vendido',
      'Editar información',
      'Eliminar auto'
    ];

    const opcionesFiltradas = opciones.filter((op, index) => {
      if (index === 1 && auto.disponible) return false;
      if (index === 4 && !auto.disponible) return false;
      return true;
    });

    const opcionSeleccionada = prompt(
      `Gestión: ${marcaNombre} ${auto.modelo}\n\n` +
      `Opciones:\n${opcionesFiltradas.map((op, index) => `${index + 1}. ${op}`).join('\n')}\n\n` +
      `Ingresa el número de opción:`
    );

    switch (opcionSeleccionada) {
      case '1':
        this.cambiarDisponibilidad(auto, !auto.disponible);
        break;
      case '2':
        if (!auto.disponible) {
          this.reactivarAuto(auto);
        }
        break;
      case '3':
        this.verDetallesCompletos(auto);
        break;
      case '4':
        this.gestionarImagenes(auto);
        break;
      case '5':
        if (auto.disponible) {
          this.marcarComoVendido(auto);
        }
        break;
      case '6':
        this.editarAuto(auto);
        break;
      case '7':
        this.eliminarAuto(auto);
        break;
      default:
        console.log('Opción no válida o cancelada');
    }
  }

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  cambiarEstadoAuto(auto: Auto): void {
    const nuevoEstado = !auto.disponible;
    const textoEstado = nuevoEstado ? 'Disponible' : 'No Disponible';
    const marcaNombre = auto.marca?.nombre || 'Auto';
    
    if (confirm(`¿Cambiar estado de "${marcaNombre} ${auto.modelo}" a ${textoEstado}?`)) {
      this.autoService.cambiarDisponibilidadAuto(auto.id, nuevoEstado).subscribe({
        next: (autoActualizado) => {
          auto.disponible = nuevoEstado;
          this.actualizarContadores();
          alert(`✅ Estado actualizado correctamente a: ${textoEstado}`);
        },
        error: (error) => {
          console.error('Error al actualizar estado:', error);
          alert('❌ Error al actualizar el estado del auto');
        }
      });
    }
  }

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  marcarComoVendido(auto: Auto): void {
    const marcaNombre = auto.marca?.nombre || 'Auto';
    if (confirm(`¿Marcar "${marcaNombre} ${auto.modelo}" como VENDIDO?\n\nEsta acción cambiará el estado a "No Disponible".`)) {
      this.autoService.cambiarDisponibilidadAuto(auto.id, false).subscribe({
        next: (autoActualizado) => {
          auto.disponible = false;
          this.actualizarContadores();
          alert(`✅ ${marcaNombre} ${auto.modelo} marcado como VENDIDO`);
        },
        error: (error) => {
          console.error('Error al marcar como vendido:', error);
          alert('❌ Error al marcar el auto como vendido');
        }
      });
    }
  }

  getCurrentImage(auto: Auto): string {
    if (!auto.imagenes || auto.imagenes.length === 0) {
      return this.getDefaultImage(auto);
    }
    const index = this.currentImageIndex.get(auto.id) || 0;
    return auto.imagenes[index];
  }

  getCurrentImageIndex(auto: Auto): number {
    return this.currentImageIndex.get(auto.id) || 0;
  }

  setCurrentImage(auto: Auto, index: number): void {
    this.currentImageIndex.set(auto.id, index);
  }

  nextImage(auto: Auto): void {
    if (!auto.imagenes || auto.imagenes.length === 0) return;
    
    const currentIndex = this.currentImageIndex.get(auto.id) || 0;
    const nextIndex = (currentIndex + 1) % auto.imagenes.length;
    this.currentImageIndex.set(auto.id, nextIndex);
  }

  prevImage(auto: Auto): void {
    if (!auto.imagenes || auto.imagenes.length === 0) return;
    
    const currentIndex = this.currentImageIndex.get(auto.id) || 0;
    const prevIndex = currentIndex === 0 ? auto.imagenes.length - 1 : currentIndex - 1;
    this.currentImageIndex.set(auto.id, prevIndex);
  }

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  getDefaultImage(auto: Auto): string {
    const marcaNombre = auto.marca?.nombre || 'Auto';
    return `https://via.placeholder.com/400x300/cccccc/666666?text=${marcaNombre}+${auto.modelo}`;
  }

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

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  eliminarAuto(auto: Auto): void {
    const marcaNombre = auto.marca?.nombre || 'Auto';
    if (confirm(`¿Estás seguro de eliminar el ${marcaNombre} ${auto.modelo}?\n\nEsta acción no se puede deshacer.`)) {
      this.autoService.eliminarAuto(auto.id).subscribe({
        next: () => {
          alert(`✅ ${marcaNombre} ${auto.modelo} eliminado correctamente`);
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

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  verDetallesCompletos(auto: Auto): void {
    const marcaNombre = auto.marca?.nombre || 'Sin marca';
    const combustibleNombre = auto.combustible?.nombre || 'Sin combustible';
    const transmisionNombre = auto.transmision?.nombre || 'Sin transmisión';
    
    const detalles = `
      📋 DETALLES COMPLETOS:
      
      🚗 Vehículo: ${marcaNombre} ${auto.modelo}
      📅 Año: ${auto.anio}
      💰 Precio: $${auto.precio?.toLocaleString()}
      🛣️ Kilometraje: ${auto.kilometraje?.toLocaleString()} km
      🎨 Color: ${auto.color}
      ⛽ Combustible: ${combustibleNombre}
      🚦 Transmisión: ${transmisionNombre}
      📝 Descripción: ${auto.descripcion}
      ✅ Estado: ${auto.disponible ? 'Disponible' : 'Vendido'}
      🖼️ Imágenes: ${auto.imagenes?.length || 0}
      🆔 ID: ${auto.id}
    `;
    
    alert(detalles);
  }

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  gestionarImagenes(auto: Auto): void {
    const marcaNombre = auto.marca?.nombre || 'Auto';
    alert(`🖼️ Gestión de imágenes para: ${marcaNombre} ${auto.modelo}\n\nImágenes disponibles: ${auto.imagenes?.length || 0}\n\nEsta funcionalidad estará disponible pronto.`);
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  // ✅ MÉTODO PARA DEBUG MEJORADO
  debugAuto(auto: Auto): void {
    console.log('🐛 DEBUG AUTO:', {
      id: auto.id,
      marca: auto.marca,
      marcaNombre: auto.marca?.nombre,
      tipoMarca: typeof auto.marca,
      modelo: auto.modelo,
      combustible: auto.combustible,
      combustibleNombre: auto.combustible?.nombre,
      transmision: auto.transmision,
      transmisionNombre: auto.transmision?.nombre,
      categoria: auto.categoria,
      categoriaNombre: auto.categoria?.nombre,
      condicion: auto.condicion,
      condicionNombre: auto.condicion?.nombre
    });
  }

  
}
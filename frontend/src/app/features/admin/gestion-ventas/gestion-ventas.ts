import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentaService } from '../../../../core/services/venta.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VentaResponse } from '../../../../core/models/venta.model';
import { EstadoVenta } from '../../../../core/models/shared.model';

@Component({
  selector: 'app-gestion-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestion-ventas.html',
  styleUrls: ['./gestion-ventas.css']
})
export class GestionVentasComponent implements OnInit {
  
  ventas: VentaResponse[] = [];
  ventasFiltradas: VentaResponse[] = [];
  estados: EstadoVenta[] = [];
  loading = true;
  error = '';
  filtroEstado: string = 'TODAS';

  constructor(
    private ventaService: VentaService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/autos']);
      return;
    }
    this.cargarVentas();
    this.cargarEstados();
  }

  cargarVentas(): void {
    this.loading = true;
    this.error = '';

    this.ventaService.getVentasAdmin().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.filtrarVentas();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al cargar las ventas: ' + (error.error?.message || error.message);
      }
    });
  }

  cargarEstados(): void {
    this.estados = [
      { id: 1, nombre: 'PENDIENTE', activa: true },
      { id: 2, nombre: 'FINALIZADO', activa: true },
      { id: 3, nombre: 'CANCELADO', activa: true }
    ];
  }

  filtrarVentas(): void {
    if (this.filtroEstado === 'TODAS') {
      this.ventasFiltradas = this.ventas;
    } else {
      this.ventasFiltradas = this.ventas.filter(v => v.estado === this.filtroEstado);
    }
  }

  cambiarEstadoVenta(venta: VentaResponse, nuevoEstadoNombre: string): void {
    const nuevoEstado = this.estados.find(e => e.nombre === nuevoEstadoNombre);
    
    if (!nuevoEstado) {
      alert('❌ Estado no válido');
      return;
    }

    const mensaje = `¿Cambiar estado de la venta a ${nuevoEstadoNombre}?\n\n` +
                    `👤 Cliente: ${venta.clienteNombre} ${venta.clienteApellidos}\n` +
                    `🚗 Auto: ${venta.autoMarca} ${venta.autoModelo} (${venta.autoAnio})\n` +
                    `💰 Precio: S/ ${venta.autoPrecio.toLocaleString()}`;

    if (!confirm(mensaje)) return;

    this.ventaService.actualizarEstadoVentaAdmin(venta.id, nuevoEstadoNombre).subscribe({
      next: (ventaActualizada) => {
        const index = this.ventas.findIndex(v => v.id === venta.id);
        if (index !== -1) this.ventas[index] = ventaActualizada;

        this.filtrarVentas();
        alert(`✅ Estado actualizado a: ${nuevoEstadoNombre}`);
      },
      error: (error) => {
        alert('❌ Error al actualizar el estado: ' + (error.error?.message || error.message));
      }
    });
  }

  eliminarVenta(venta: VentaResponse): void {
    const mensaje = `¿Estás seguro de cancelar la venta #${venta.id}?\n\n` +
                    `👤 Cliente: ${venta.clienteNombre} ${venta.clienteApellidos}\n` +
                    `🚗 Auto: ${venta.autoMarca} ${venta.autoModelo}\n\n` +
                    `Nota: La venta se marcará como CANCELADA`;

    if (!confirm(mensaje)) return;

    this.ventaService.actualizarEstadoVentaAdmin(venta.id, 'CANCELADO').subscribe({
      next: () => {
        this.cargarVentas();
        alert('✅ Venta cancelada correctamente');
      },
      error: (error) => {
        alert('❌ Error al cancelar la venta: ' + (error.error?.message || error.message));
      }
    });
  }

  verDetalles(venta: VentaResponse): void {
    alert(`Venta #${venta.id}\n\n` +
          `${venta.clienteNombre} ${venta.clienteApellidos}\n` +
          `${venta.autoMarca} ${venta.autoModelo} (${venta.autoAnio})\n\n` +
          `S/ ${venta.autoPrecio}`);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'pending';
      case 'FINALIZADO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'pending';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return '⏳ Pendiente';
      case 'FINALIZADO': return '✅ Finalizado';
      case 'CANCELADO': return '❌ Cancelado';
      default: return estado;
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

  recargarVentas(): void {
    this.cargarVentas();
  }
}

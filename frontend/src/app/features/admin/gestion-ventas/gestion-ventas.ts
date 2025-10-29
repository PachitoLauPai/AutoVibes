import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentaService, VentaResponse } from '../../../../core/services/venta.service';
import { AuthService } from '../../../../core/services/auth.service';

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
  loading = true;
  error = '';
  filtroEstado: string = 'TODAS';

  constructor(
    private ventaService: VentaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ VERIFICAR QUE SEA ADMIN ANTES DE CARGAR
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/autos']);
      return;
    }
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.loading = true;
    this.error = '';

    this.ventaService.obtenerTodasLasVentas().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.filtrarVentas();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al cargar las ventas: ' + (error.error?.message || error.message);
        console.error('Error:', error);
      }
    });
  }

  filtrarVentas(): void {
    if (this.filtroEstado === 'TODAS') {
      this.ventasFiltradas = this.ventas;
    } else {
      this.ventasFiltradas = this.ventas.filter(v => v.estado === this.filtroEstado);
    }
  }

  cambiarEstadoVenta(venta: VentaResponse, nuevoEstado: string): void {
    if (confirm(`¿Cambiar estado de la venta a ${nuevoEstado}?\n\nCliente: ${venta.clienteNombre} ${venta.clienteApellidos}\nAuto: ${venta.autoMarca} ${venta.autoModelo}`)) {
      this.ventaService.actualizarEstadoVenta(venta.id, nuevoEstado).subscribe({
        next: (ventaActualizada) => {
          // Actualizar la venta en la lista
          const index = this.ventas.findIndex(v => v.id === venta.id);
          if (index !== -1) {
            this.ventas[index] = ventaActualizada;
          }
          this.filtrarVentas();
          alert(`✅ Estado actualizado a: ${nuevoEstado}\n\nEl auto ${ventaActualizada.autoMarca} ${ventaActualizada.autoModelo} ha sido ${nuevoEstado === 'FINALIZADO' || nuevoEstado === 'CANCELADO' ? 'liberado' : 'bloqueado'} automáticamente.`);
        },
        error: (error) => {
          alert('❌ Error al actualizar el estado: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-pendiente';
      case 'FINALIZADO': return 'estado-finalizado';
      case 'CANCELADO': return 'estado-cancelado';
      default: return 'estado-pendiente';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'FINALIZADO': return 'Finalizado';
      case 'CANCELADO': return 'Cancelado';
      default: return estado;
    }
  }

  // ✅ MÉTODO PARA FORMATEAR FECHAS
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

  // ✅ MÉTODO PARA RECARGAR VENTAS
  recargarVentas(): void {
    this.cargarVentas();
  }
}
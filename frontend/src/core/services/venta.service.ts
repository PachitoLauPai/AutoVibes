import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ContactRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  direccion: string;
  autoId: number;
}

export interface VentaResponse {
  id: number;
  clienteNombre: string;
  clienteApellidos: string;
  clienteDni: string;
  clienteTelefono: string;
  clienteDireccion: string;
  autoId: number;
  autoMarca: string;
  autoModelo: string;
  autoAnio: number;
  autoPrecio: number;
  estado: string;
  fechaSolicitud: string;
  fechaActualizacion: string;
}

export interface EstadoVentaUpdate {
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = 'http://localhost:8080/api/ventas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ✅ PARA CLIENTES
  contactarVendedor(contactRequest: ContactRequest): Observable<VentaResponse> {
    console.log('🔍 [VENTA SERVICE] contactarVendedor llamado');
    console.log('📦 Datos a enviar:', contactRequest);
    console.log('👤 Usuario actual:', this.authService.getCurrentUser());
    
    if (!this.authService.isCliente()) {
      throw new Error('Solo los clientes pueden contactar vendedores');
    }

    const authHeader = this.authService.getBasicAuthHeader();
    console.log('🔐 Auth Header:', authHeader);
    
    return this.http.post<VentaResponse>(`${this.apiUrl}/contactar`, contactRequest, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
  }

  obtenerMisSolicitudes(): Observable<VentaResponse[]> {
    if (!this.authService.isCliente()) {
      throw new Error('Solo los clientes pueden ver sus solicitudes');
    }

    const authHeader = this.authService.getBasicAuthHeader();
    return this.http.get<VentaResponse[]>(`${this.apiUrl}/mis-solicitudes`, {
      headers: {
        'Authorization': authHeader
      }
    });
  }

  // ✅ PARA ADMINISTRADORES
  obtenerTodasLasVentas(): Observable<VentaResponse[]> {
    if (!this.authService.isAdmin()) {
      throw new Error('Solo los administradores pueden ver todas las ventas');
    }

    const authHeader = this.authService.getBasicAuthHeader();
    return this.http.get<VentaResponse[]>(`${this.apiUrl}/admin/todas`, {
      headers: {
        'Authorization': authHeader
      }
    });
  }

  obtenerVentasPorEstado(estado: string): Observable<VentaResponse[]> {
    if (!this.authService.isAdmin()) {
      throw new Error('Solo los administradores pueden filtrar ventas por estado');
    }

    const authHeader = this.authService.getBasicAuthHeader();
    return this.http.get<VentaResponse[]>(`${this.apiUrl}/admin/estado/${estado}`, {
      headers: {
        'Authorization': authHeader
      }
    });
  }

  actualizarEstadoVenta(ventaId: number, estado: string): Observable<VentaResponse> {
    if (!this.authService.isAdmin()) {
      throw new Error('Solo los administradores pueden actualizar estados de venta');
    }

    const authHeader = this.authService.getBasicAuthHeader();
    const updateData: EstadoVentaUpdate = { estado };
    
    return this.http.put<VentaResponse>(`${this.apiUrl}/admin/${ventaId}/estado`, updateData, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
  }
}
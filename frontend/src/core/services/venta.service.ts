import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ContactRequest } from '../models/venta.model';
import { map } from 'rxjs/operators';
import { VentaResponse } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  // Contactar vendedor (cliente)
  contactarVendedor(contactData: ContactRequest): Observable<any> {
    return this.api.post<any>('ventas/contactar', contactData);
  }

  // Obtener mis solicitudes (cliente)
  getMisSolicitudes(): Observable<any[]> {
    return this.api.get<any[]>('ventas/mis-solicitudes');
  }

  // --- MÉTODOS ADMIN ---
  getVentasAdmin(): Observable<VentaResponse[]> {
    if (!this.authService.isAdmin()) {
      throw new Error('Solo administradores pueden ver todas las ventas');
    }

    return this.api.get<VentaResponse[]>('ventas/admin/todas');
  }




  getVentasPorEstado(estado: string): Observable<any[]> {
    if (!this.authService.isAdmin()) {
      throw new Error('Solo administradores pueden ver ventas por estado');
    }
    return this.api.get<any[]>(`ventas/admin/estado/${estado}`);
  }

  actualizarEstadoVentaAdmin(id: number, estadoNombre: string): Observable<any> {
    if (!this.authService.isAdmin()) {
      throw new Error('Solo administradores pueden actualizar estado de venta');
    }
    return this.api.put<any>(`ventas/admin/${id}/estado`, { estado: estadoNombre });
  }

}
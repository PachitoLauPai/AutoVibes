import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardStats {
  totalAutosEnCatalogo: number;
  totalAutos: number;
  contactosNuevos: number;
  totalContactos: number;
  contactosHoy: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  obtenerEstadisticas(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('admin/dashboard/stats');
  }
}



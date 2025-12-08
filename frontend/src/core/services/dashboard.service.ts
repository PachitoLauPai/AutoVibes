import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { catchError } from 'rxjs/operators';
import { Auto } from '../models/auto.model';

export interface DashboardStats {
  totalAutosEnCatalogo?: number;
  totalAutos: number;
  autosDisponibles?: number;
  contactosNuevos: number;
  totalContactos: number;
  contactosHoy?: number;
  autos?: Auto[];
  todosLosAutos?: Auto[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  obtenerEstadisticas(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('admin/dashboard/stats').pipe(
      catchError(error => {
        console.error('Error obteniendo estadísticas:', error);
        // Retornar datos por defecto si hay error
        return of({
          totalAutos: 0,
          contactosNuevos: 0,
          totalContactos: 0,
          autosDisponibles: 0,
          autos: [],
          todosLosAutos: []
        });
      })
    );
  }

  obtenerTodosLosAutos(): Observable<Auto[]> {
    return this.api.get<Auto[]>('autos?admin=true');
  }

  obtenerAutosDisponibles(): Observable<Auto[]> {
    return this.api.get<Auto[]>('autos?disponibles=true');
  }
}



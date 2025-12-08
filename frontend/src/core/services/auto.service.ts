import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { Auto } from '../models/auto.model';
import { AutoRequest } from '../models/AutoRequest';
import {  
  Marca, 
  Combustible, 
  Transmision, 
  CategoriaAuto, 
  CondicionAuto 
} from '../models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class AutoService {
  constructor(
    private api: ApiService, 
    private authService: AuthService,
    private logger: LoggerService
  ) {}

  getAutos(): Observable<Auto[]> {
    if (this.authService.isAdmin()) {
      return this.api.get<Auto[]>('autos?admin=true');
    } else {
      return this.api.get<Auto[]>('autos?disponibles=true');
    }
  }

  getTodosLosAutos(): Observable<Auto[]> {
    // Confiar en que el backend valide la autorización
    return this.api.get<Auto[]>('autos?admin=true');
  }

  getAutosDisponibles(): Observable<Auto[]> {
    return this.api.get<Auto[]>('autos?disponibles=true');
  }

  cambiarDisponibilidadAuto(autoId: number, disponible: boolean): Observable<Auto> {
    return this.api.put<Auto>(`autos/admin/${autoId}/disponibilidad?disponible=${disponible}`, {});
  }

  getAuto(id: number): Observable<Auto> {
    return this.api.get<Auto>(`autos/${id}`);
  }

  getMarcas(): Observable<Marca[]> {
    return this.api.get<Marca[]>('autos/marcas');
  }

  getCombustibles(): Observable<Combustible[]> {
    return this.api.get<Combustible[]>('autos/combustibles');
  }

  getTransmisiones(): Observable<Transmision[]> {
    return this.api.get<Transmision[]>('autos/transmisiones');
  }

  getCategorias(): Observable<CategoriaAuto[]> {
    return this.api.get<CategoriaAuto[]>('autos/categorias');
  }

  getCondiciones(): Observable<CondicionAuto[]> {
    return this.api.get<CondicionAuto[]>('autos/condiciones');
  }

  // Crear/Actualizar usando AutoRequest (coincidir con DTO del backend)
  crearAuto(autoRequest: AutoRequest): Observable<Auto> {
    return this.api.post<Auto>('autos', autoRequest);
  }

  actualizarAuto(id: number, autoRequest: Partial<AutoRequest>): Observable<Auto> {
    return this.api.put<Auto>(`autos/${id}`, autoRequest);
  }

  eliminarAuto(id: number): Observable<void> {
    return this.api.delete<void>(`autos/${id}`);
  }

  reactivarAuto(autoId: number): Observable<Auto> {
    return this.cambiarDisponibilidadAuto(autoId, true);
  }

}
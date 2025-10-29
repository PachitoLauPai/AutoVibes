import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Auto {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  color: string;
  kilometraje: number;
  combustible: string;
  transmision: string;
  descripcion: string;
  disponible: boolean;
  imagenes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AutoService {
  constructor(private api: ApiService, private authService: AuthService) { }

  getAutos(): Observable<Auto[]> {
    return this.api.get<Auto[]>('autos');
  }

  getAutosDisponibles(): Observable<Auto[]> {
    return this.api.get<Auto[]>('autos/disponibles');
  }

  getAuto(id: number): Observable<Auto> {
    return this.api.get<Auto>(`autos/${id}`);
  }

  crearAuto(auto: Omit<Auto, 'id'>): Observable<Auto> {
    return this.api.post<Auto>('autos', auto);
  }


   // ✅ AGREGAR ESTE MÉTODO
  actualizarAuto(id: number, auto: Partial<Auto>): Observable<Auto> {
    return this.api.put<Auto>(`autos/${id}`, auto);
  }


  // Esto ya debería existir:
  eliminarAuto(id: number): Observable<void> {
    return this.api.delete<void>(`autos/${id}`);
  }
}
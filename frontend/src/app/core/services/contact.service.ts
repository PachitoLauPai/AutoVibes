import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface ContactRequest {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  autoId?: number;
}

export interface Contact {
  id?: number;
  nombre: string;
  correo: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  estado?: string;
  fechaCreacion?: Date;
  leido?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8080/api/contact';

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  /**
   * Enviar un nuevo contacto (público - sin autenticación)
   */
  enviarContacto(contactData: ContactRequest): Observable<string> {
    console.log('Enviando contacto:', contactData);
    
    return this.http.post<string>(
      `${this.apiUrl}/enviar`,
      contactData,
      { responseType: 'text' as 'json' }
    ).pipe(
      tap((response: any) => {
        console.log('Contacto enviado exitosamente:', response);
      }),
      catchError((error) => {
        console.error('Error al enviar contacto:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Obtener todos los contactos (admin)
   */
  obtenerContactos(): Observable<Contact[]> {
    return this.api.get<Contact[]>('contactos').pipe(
      catchError(error => {
        console.error('Error obteniendo contactos:', error);
        return of([]);
      })
    );
  }

  /**
   * Eliminar un contacto
   */
  eliminarContacto(id: number): Observable<void> {
    return this.api.delete<void>(`contactos/${id}`).pipe(
      catchError(error => {
        console.error('Error eliminando contacto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marcar contacto como leído
   */
  marcarComoLeido(id: number): Observable<void> {
    return this.api.put<void>(`contactos/${id}/leido`, {}).pipe(
      catchError(error => {
        console.error('Error marcando contacto como leído:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error en la comunicación con el servidor';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

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
  dni?: string;
  estado?: string;
  tipoTransaccion?: string;
}

export interface Contact {
  id?: number;
  nombre: string;
  email: string;
  correo?: string;  // alias para email
  telefono?: string;
  asunto: string;
  mensaje: string;
  estado?: string;
  fechaCreacion?: Date;
  leido?: boolean;
  dni?: string;
  auto?: any;  // Información del auto asociado
  respondido?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8080/api/contact';

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) { }


  enviarContacto(contactData: ContactRequest): Observable<Contact> {

    return this.http.post<Contact>(
      `${this.apiUrl}/enviar`,
      contactData
    ).pipe(
      catchError((error) => {
        console.error('Error al enviar contacto:', error);
        return this.handleError(error);
      })
    );
  }


  obtenerContactos(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/admin/todos`).pipe(
      catchError(error => {
        console.error('Error obteniendo contactos:', error);
        return of([]);
      })
    );
  }

  eliminarContacto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`).pipe(
      catchError(error => {
        console.error('Error eliminando contacto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Marcar contacto como leído
   */
  marcarComoLeido(id: number): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/admin/${id}/marcar-leido`, {}).pipe(
      catchError(error => {
        console.error('Error marcando contacto como leído:', error);
        return throwError(() => error);
      })
    );
  }


  actualizarEstado(id: number, nuevoEstado: string): Observable<Contact> {
    const request: ContactRequest = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: '',
      estado: nuevoEstado
    };

    return this.http.put<Contact>(`${this.apiUrl}/admin/${id}/actualizar-estado`, request).pipe(
      tap((response) => {
        // Log removed
      }),
      catchError(error => {
        console.error('Error actualizando estado del contacto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cambiar estado de venta y ajustar stock automáticamente
   */
  cambiarEstadoVenta(id: number, nuevoEstado: string, estadoAnterior?: string): Observable<any> {
    const request = {
      estado: nuevoEstado,
      estadoAnterior: estadoAnterior || ''
    };

    return this.http.put<any>(`${this.apiUrl}/admin/${id}/cambiar-estado-venta`, request).pipe(
      tap((response) => {
        // Log removed
      }),
      catchError(error => {
        console.error('Error al cambiar estado de venta:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar tipo de transacción del contacto (COMPRA/VENTA)
   */
  actualizarTipoTransaccion(id: number, nuevoTipo: string): Observable<Contact> {
    const request: ContactRequest = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: '',
      tipoTransaccion: nuevoTipo
    };

    return this.http.put<Contact>(`${this.apiUrl}/admin/${id}/actualizar-tipo-transaccion`, request).pipe(
      tap((response) => {
        // Log removed
      }),
      catchError(error => {
        console.error('Error actualizando tipo de transacción:', error);
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

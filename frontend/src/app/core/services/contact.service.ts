import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ContactRequest {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  autoId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8080/api/contact';

  constructor(private http: HttpClient) {}

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

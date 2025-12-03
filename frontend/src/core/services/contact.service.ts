import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ContactRequest {
  nombre: string;
  dni?: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  autoId?: number;
}

export interface Contact {
  id: number;
  nombre: string;
  dni?: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  leido: boolean;
  respondido: boolean;
  fechaCreacion: string;
  auto?: {
    id: number;
    marca?: { nombre: string };
    modelo: string;
    anio: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private api: ApiService) {}

  /**
   * Enviar un nuevo contacto (público - sin autenticación)
   */
  enviarContacto(contactData: ContactRequest): Observable<string> {
    return this.api.post<string>('contact/enviar', contactData);
  }

  /**
   * Obtener todos los contactos (Admin)
   */
  obtenerTodosLosContactos(): Observable<Contact[]> {
    return this.api.get<Contact[]>('contact/admin/todos');
  }

  /**
   * Obtener contactos no leídos (Admin)
   */
  obtenerContactosNoLeidos(): Observable<Contact[]> {
    return this.api.get<Contact[]>('contact/admin/no-leidos');
  }

  /**
   * Obtener contacto por ID (Admin)
   */
  obtenerContactoPorId(id: number): Observable<Contact> {
    return this.api.get<Contact>(`contact/admin/${id}`);
  }

  /**
   * Marcar contacto como leído (Admin)
   */
  marcarComoLeido(id: number): Observable<Contact> {
    return this.api.put<Contact>(`contact/admin/${id}/marcar-leido`, {});
  }

  /**
   * Marcar contacto como respondido (Admin)
   */
  marcarComoRespondido(id: number): Observable<Contact> {
    return this.api.put<Contact>(`contact/admin/${id}/marcar-respondido`, {});
  }

  /**
   * Eliminar contacto (Admin)
   */
  eliminarContacto(id: number): Observable<any> {
    return this.api.delete<any>(`contact/admin/${id}`);
  }
}


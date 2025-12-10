import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public static readonly API_BASE_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getHttpOptions() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return { headers };
  }

  
  getToken(): string | null {
    return localStorage.getItem('token');
  }


  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Elimina el token de autenticación
   */
  removeToken(): void {
    localStorage.removeItem('token');
  }

  /**
   * Verifica si hay un token válido
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string): Observable<T> {
    const url = `${ApiService.API_BASE_URL}/${endpoint}`;
    return this.http.get<T>(url, this.getHttpOptions());
  }

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${ApiService.API_BASE_URL}/${endpoint}`;
    return this.http.post<T>(url, data, this.getHttpOptions());
  }

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${ApiService.API_BASE_URL}/${endpoint}`;
    return this.http.put<T>(url, data, this.getHttpOptions());
  }

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${ApiService.API_BASE_URL}/${endpoint}`;
    return this.http.delete<T>(url, this.getHttpOptions());
  }
}

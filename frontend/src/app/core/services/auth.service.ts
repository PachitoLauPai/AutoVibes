import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id?: number;
  email?: string;
  nombre?: string;
  rol?: any; // Puede ser string o objeto con { id, nombre, descripcion, activa }
  mensaje?: string;
  message?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar si hay token al inicializar
    this.isAuthenticatedSubject.next(!!localStorage.getItem('token'));
    this.userRoleSubject.next(localStorage.getItem('userRole'));
  }

  /**
   * Login de administrador
   */
  loginAdmin(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Enviando login admin:', credentials.email);
    
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/admin/login`,
      credentials
    ).pipe(
      tap((response: LoginResponse) => {
        console.log('Login response:', response);
        if (response.token) {
          localStorage.setItem('token', response.token);
          // ✅ Extraer el nombre del rol (puede ser string o objeto)
          let rolName = 'ADMIN';
          if (response.rol) {
            if (typeof response.rol === 'string') {
              rolName = response.rol;
            } else if (typeof response.rol === 'object' && 'nombre' in response.rol) {
              rolName = response.rol.nombre;
            }
          }
          localStorage.setItem('userRole', rolName);
          localStorage.setItem('currentUser', JSON.stringify({ id: response.id, nombre: response.nombre, email: response.email }));
          this.userRoleSubject.next(rolName);
          this.isAuthenticatedSubject.next(true);
          console.log('Login exitoso para:', credentials.email, 'con rol:', rolName);
        }
      }),
      catchError((error) => {
        console.error('Error de login:', error);
        return throwError(() => new Error(error.error?.message || error.error?.mensaje || 'Error en autenticación'));
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
    console.log('Usuario desconectado');
  }

  /**
   * Obtener el estado de autenticación
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Verificar si el usuario está logueado
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Verificar si es administrador
   */
  isAdmin(): boolean {
    const role = localStorage.getItem('userRole');
    return role === 'ADMIN';
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtener el rol del usuario actual
   */
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }
}


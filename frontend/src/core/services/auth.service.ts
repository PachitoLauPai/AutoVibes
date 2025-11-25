import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, tap, throwError } from 'rxjs';
import { User, RegisterData } from '../models/user.model';
import { Rol } from '../models/shared.model';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.cargarUsuarioDesdeLocalStorage();
  }

  private cargarUsuarioDesdeLocalStorage(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Verificar si el usuario antiguo tiene rol como string y convertirlo
        if (user && typeof user.rol === 'string') {
          this.logger.debug('Convirtiendo rol de string a objeto');
          user.rol = { nombre: user.rol } as Rol;
        }
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logger.error('Error cargando usuario desde localStorage', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  // ✅ AGREGAR: Observable para escuchar cambios
  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }


    login(credentials: { email: string; password: string }): Observable<User> {
    this.logger.debug('Intentando login', { email: credentials.email });
  
  return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(response => {
        this.logger.info('Login exitoso', { userId: response.id, email: response.email });
        
        const user: User = {
          id: response.id,
          email: response.email,
          nombre: response.nombre,
          rol: response.rol, // ✅ Objeto Rol completo
          activo: response.activo, // ✅ AGREGAR ESTO
          password: credentials.password
        };
        
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }),
      catchError(error => {
        this.logger.error('Error en login', error);
        return throwError(() => new Error('Credenciales incorrectas'));
      })
    );
  }




  // ✅ ACTUALIZADO: Métodos de verificación que usan objeto Rol
  isCliente(): boolean {
    const user = this.currentUser();
    const esCliente = user?.rol?.nombre === 'CLIENTE';
    this.logger.debug('isCliente()', { rol: user?.rol?.nombre, resultado: esCliente });
    return esCliente;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    const esAdmin = user?.rol?.nombre === 'ADMIN';
    this.logger.debug('isAdmin()', { rol: user?.rol?.nombre, resultado: esAdmin });
    return esAdmin;
  }

  // ✅ ACTUALIZADO: Obtener todos los usuarios (con objetos Rol)
  getUsuarios(): Observable<User[]> {
    if (!this.isAdmin()) {
      throw new Error('Solo administradores pueden ver todos los usuarios');
    }

    const authHeader = this.getBasicAuthHeader();
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`, {
      headers: { 'Authorization': authHeader }
    });
  }

  // ✅ ACTUALIZADO: Actualizar usuario
  actualizarUsuario(id: number, usuarioData: any): Observable<User> {
    if (!this.isAdmin()) {
      throw new Error('Solo administradores pueden actualizar usuarios');
    }

    const authHeader = this.getBasicAuthHeader();
    return this.http.put<User>(`${this.apiUrl}/usuarios/${id}`, usuarioData, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
  }

  // ✅ ACTUALIZADO: Registro que maneja objeto Rol
  register(registerData: RegisterData): Observable<any> {
    this.logger.debug('Registrando usuario', { email: registerData.email });
    
    return this.http.post<any>(`${this.apiUrl}/auth/registro`, registerData, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(response => {
        this.logger.info('Registro exitoso', { userId: response.id, email: response.email });
        
        // Si el registro incluye login automático
        if (response.id && response.email) {
          const user: User = {
            id: response.id,
            email: response.email,
            nombre: response.nombre,
            rol: response.rol,
            activo: response.activo ?? true, // ✅ Objeto Rol del backend
            password: registerData.password
          };
          
          this.logger.debug('Usuario creado para login automático', { userId: user.id });
          
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }),
      catchError(error => {
        this.logger.error('Error en registro', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Mantener métodos existentes (sin cambios)
  getBasicAuthHeader(): string {
    const user = this.currentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    const password = user.password || '123456';
    const credentials = btoa(`${user.email}:${password}`);
    return `Basic ${credentials}`;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  logout(): void {
    this.logger.info('Logout');
    this.currentUserSubject.next(null);  // ✅ Notificar logout
    localStorage.removeItem('currentUser');
    // ✅ NO navegar aquí - dejar que el componente lo haga
  }

  eliminarUsuario(id: number): Observable<any> {
    if (!this.isAdmin()) {
      throw new Error('Solo los administradores pueden eliminar usuarios');
    }

    const authHeader = this.getBasicAuthHeader();
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`, {
      headers: { 'Authorization': authHeader }
    });
  }

  // ✅ MEJORADO: Método de debug
  debugAuth(): void {
    this.logger.debug('DEBUG AUTH SERVICE', {
      localStorage: localStorage.getItem('currentUser'),
      currentUser: this.currentUserSubject.value,
      isAdmin: this.isAdmin(),
      isCliente: this.isCliente(),
      user: this.currentUser()
    });
  }
  
  // ✅ NUEVO: Cambiar estado de usuario (ADMIN)
  cambiarEstadoUsuario(usuarioId: number, activo: boolean): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/usuarios/${usuarioId}/estado`,
      { activo: activo },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(response => {
        this.logger.info('Estado del usuario actualizado', { userId: usuarioId, activo });
      }),
      catchError(error => {
        this.logger.error('Error al cambiar estado', error);
        return throwError(() => new Error('Error al cambiar estado del usuario'));
      })
    );
  }

  // ✅ NUEVO: Actualizar perfil del usuario
  actualizarPerfil(usuarioId: number, datosActualizacion: any): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/usuarios/${usuarioId}`,
      datosActualizacion,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(response => {
        this.logger.info('Perfil actualizado', { userId: usuarioId });
        // Actualizar el usuario en localStorage
        this.currentUserSubject.next(response as User);
        localStorage.setItem('currentUser', JSON.stringify(response));
      }),
      catchError(error => {
        this.logger.error('Error al actualizar perfil', error);
        return throwError(() => new Error('Error al actualizar perfil'));
      })
    );
  }

  // ✅ NUEVO: Cambiar contraseña del usuario
  cambiarContrasena(usuarioId: number, cambioData: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/usuarios/${usuarioId}/cambiar-contrasena`,
      cambioData,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(response => {
        this.logger.info('Contraseña cambiada exitosamente', { userId });
      }),
      catchError(error => {
        this.logger.error('Error al cambiar contraseña', error);
        return throwError(() => new Error('Error al cambiar contraseña'));
      })
    );
  }
}
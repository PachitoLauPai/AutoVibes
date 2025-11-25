import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, tap, throwError } from 'rxjs';
import { User, RegisterData } from '../models/user.model';
import { Rol } from '../models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private router: Router,
    private http: HttpClient
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
          console.log('🔄 Convirtiendo rol de string a objeto...');
          user.rol = { nombre: user.rol } as Rol;
        }
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error cargando usuario desde localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  // ✅ AGREGAR: Observable para escuchar cambios
  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }


    login(credentials: { email: string; password: string }): Observable<User> {
    console.log('🔐 [AUTH] Intentando login con:', credentials.email);
  
  return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(response => {
        console.log('✅ [AUTH] Login exitoso:', response);
        
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
        console.error('❌ [AUTH] Error en login:', error);
        return throwError(() => new Error('Credenciales incorrectas'));
      })
    );
  }




  // ✅ ACTUALIZADO: Métodos de verificación que usan objeto Rol
  isCliente(): boolean {
    const user = this.currentUser();
    const esCliente = user?.rol?.nombre === 'CLIENTE';
    console.log('🔍 isCliente() - Rol:', user?.rol?.nombre, 'Resultado:', esCliente);
    return esCliente;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    const esAdmin = user?.rol?.nombre === 'ADMIN';
    console.log('🔍 isAdmin() - Rol:', user?.rol?.nombre, 'Resultado:', esAdmin);
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
    console.log('📝 [AUTH] Registrando usuario:', registerData);
    
    return this.http.post<any>(`${this.apiUrl}/auth/registro`, registerData, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(response => {
        console.log('✅ [AUTH] Registro exitoso:', response);
        
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
          
          console.log('👤 Usuario creado para login automático:', user);
          
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }),
      catchError(error => {
        console.error('❌ [AUTH] Error en registro:', error);
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
    console.log('🚪 [AUTH] Logout...');
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
    console.log('🐛 DEBUG AUTH SERVICE:');
    console.log('📦 localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('👤 currentUserSubject:', this.currentUserSubject.value);
    console.log('🔍 isAdmin():', this.isAdmin());
    console.log('🔍 isCliente():', this.isCliente());
    
    const user = this.currentUser();
    if (user) {
      console.log('👤 Usuario completo:', user);
      console.log('👑 Rol completo:', user.rol);
      console.log('📧 Email:', user.email);
      
      // Debug específico del rol
      if (user.rol) {
        console.log('🎯 Detalles del Rol:');
        console.log('   - ID:', user.rol.id);
        console.log('   - Nombre:', user.rol.nombre);
        console.log('   - Descripción:', user.rol.descripcion);
        console.log('   - Activa:', user.rol.activa);
      }
    }
  }
  
  // ✅ NUEVO: Cambiar estado de usuario (ADMIN)
  cambiarEstadoUsuario(usuarioId: number, activo: boolean): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/usuarios/${usuarioId}/estado`,
      { activo: activo },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(response => {
        console.log('✅ Estado del usuario actualizado:', response);
      }),
      catchError(error => {
        console.error('❌ Error al cambiar estado:', error);
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
        console.log('✅ Perfil actualizado:', response);
        // Actualizar el usuario en localStorage
        this.currentUserSubject.next(response as User);
        localStorage.setItem('currentUser', JSON.stringify(response));
      }),
      catchError(error => {
        console.error('❌ Error al actualizar perfil:', error);
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
        console.log('✅ Contraseña cambiadaexitosamente:', response);
      }),
      catchError(error => {
        console.error('❌ Error al cambiar contraseña:', error);
        return throwError(() => new Error('Error al cambiar contraseña'));
      })
    );
  }
}
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, catchError, tap, throwError} from 'rxjs';
import { HttpClient } from '@angular/common/http';


export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'CLIENTE' | 'ADMIN';
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Cargar usuario desde localStorage al iniciar
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }

  // ✅ INICIAR SESIÓN - GUARDAR CONTRASEÑA
  login(credentials: {email: string, password: string}): Observable<User> {
    console.log('🔐 [AUTH] Intentando login con:', credentials.email);
    
    const authHeader = 'Basic ' + btoa(`${credentials.email}:${credentials.password}`);
    
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`, {
      headers: {
        'Authorization': authHeader
      }
    }).pipe(
      map((usuarios: User[]) => {
        const usuario = usuarios.find(u => u.email === credentials.email);
        if (usuario) {
          // ✅ GUARDAR LA CONTRASEÑA CORRECTAMENTE
          const usuarioConPassword: User = {
            ...usuario,
            password: credentials.password // Esto es crucial
          };
          
          console.log('✅ [AUTH] Login exitoso. Usuario:', usuarioConPassword);
          console.log('🔑 [AUTH] Contraseña guardada:', usuarioConPassword.password ? 'SÍ' : 'NO');
          
          this.currentUserSubject.next(usuarioConPassword);
          localStorage.setItem('currentUser', JSON.stringify(usuarioConPassword));
          return usuarioConPassword;
        } else {
          console.log('❌ [AUTH] Usuario no encontrado en la lista');
          throw new Error('Usuario no encontrado');
        }
      }),
      catchError((error) => {
        console.error('❌ [AUTH] Error en login:', error);
        throw new Error('Credenciales incorrectas');
      })
    );
  }

  // ✅ OBTENER TODOS LOS USUARIOS (SOLO ADMIN)
  getUsuarios(): Observable<User[]> {
    if (!this.isAdmin()) {
      throw new Error('Solo administradores pueden ver todos los usuarios');
    }

    const authHeader = this.getBasicAuthHeader();
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`, {
      headers: {
        'Authorization': authHeader
      }
    });
  }

  // ✅ ACTUALIZAR USUARIO (SOLO ADMIN)
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

  // ✅ OBTENER CREDENCIALES PARA BASIC AUTH
  getBasicAuthHeader(): string {
    const user = this.currentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    // ✅ USAR LA CONTRASEÑA GUARDADA
    const password = user.password || '123456'; // Fallback
    const credentials = btoa(`${user.email}:${password}`);
    return `Basic ${credentials}`;
  }

  // ✅ VERIFICAR SI ESTÁ AUTENTICADO
  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  // ✅ VERIFICAR SI ES CLIENTE
  isCliente(): boolean {
    const user = this.currentUser();
    return user?.rol === 'CLIENTE';
  }

  // ✅ VERIFICAR SI ES ADMIN
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.rol === 'ADMIN';
  }

  // ✅ OBTENER USUARIO ACTUAL
  currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ✅ OBTENER USUARIO ACTUAL (alias)
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  // ✅ CERRAR SESIÓN
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }


  // En AuthService - agrega este método
  register(registerData: any): Observable<any> {
    console.log('📝 [AUTH] Registrando usuario:', registerData);
    
    return this.http.post<any>(`${this.apiUrl}/auth/registro`, registerData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(response => {
        console.log('✅ [AUTH] Registro exitoso:', response);
        
        // Si el registro incluye login automático, guardar usuario
        if (response.id && response.email) {
          const user: User = {
            id: response.id,
            email: response.email,
            nombre: response.nombre,
            rol: response.rol,
            password: registerData.password // Guardar contraseña para Basic Auth
          };
          
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

  // En AuthService - agrega este método
  eliminarUsuario(id: number): Observable<any> {
    console.log('🗑️ [AUTH] Eliminando usuario ID:', id);
    
    if (!this.isAdmin()) {
      throw new Error('Solo los administradores pueden eliminar usuarios');
    }

    const authHeader = this.getBasicAuthHeader();
    
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`, {
      headers: {
        'Authorization': authHeader
      }
    }).pipe(
      tap(response => {
        console.log('✅ Usuario eliminado:', response);
      }),
      catchError(error => {
        console.error('❌ Error eliminando usuario:', error);
        return throwError(() => error);
      })
    );
  }

  
}
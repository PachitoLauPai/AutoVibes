import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Rol } from '../../../../core/models/shared.model'; // <-- agregar

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  usuarios: User[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que sea admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/autos']);
      return;
    }
    
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';

    this.authService.getUsuarios().subscribe({
      next: (usuarios: User[]) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al cargar los usuarios';
        console.error('Error:', error);
      }
    });
  }

   // ✅ CORREGIDO: Los métodos ahora reciben el objeto Rol tipado
  getRolBadgeClass(rol: Rol | undefined): string {
    const rolNombre = rol?.nombre || 'CLIENTE';
    return rolNombre === 'ADMIN' ? 'badge-admin' : 'badge-cliente';
  }

  getRolIcon(rol: Rol | undefined): string {
    const rolNombre = rol?.nombre || 'CLIENTE';
    return rolNombre === 'ADMIN' ? '👑' : '👤';
  }

  getRolNombre(rol: Rol | undefined): string {
    return rol?.nombre || 'CLIENTE';
  }


  getTotalUsuarios(): number {
    return this.usuarios.length;
  }

  getTotalAdmins(): number {
    return this.usuarios.filter(user => user.rol?.nombre === 'ADMIN').length;
  }

  getTotalClientes(): number {
    return this.usuarios.filter(user => user.rol?.nombre === 'CLIENTE').length;
  }

  volver(): void {
    this.router.navigate(['/autos']);
  }

  registrarNuevoUsuario(): void {
    this.router.navigate(['/registro']);
  }

  editarUsuario(usuario: User): void {
    this.router.navigate(['/admin/usuarios/editar', usuario.id]);
  }

  eliminarUsuario(usuario: User): void {
    // Prevenir que el admin se elimine a sí mismo
    if (usuario.id === this.authService.getCurrentUser()?.id) {
      alert('❌ No puedes eliminar tu propio usuario');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre} (${usuario.email})?\n\nEsta acción no se puede deshacer.`)) {
      
      this.authService.eliminarUsuario(usuario.id).subscribe({
        next: (response: any) => {
          // ✅ Manejar diferentes tipos de respuesta
          if (response.eliminado || response.mensaje) {
            alert(`✅ ${response.mensaje || 'Usuario eliminado correctamente'}`);
            this.cargarUsuarios();
          } else {
            // Si la respuesta no tiene la estructura esperada, asumir éxito
            alert('✅ Usuario eliminado correctamente');
            this.cargarUsuarios();
          }
        },
        error: (error) => {
          console.error('Error completo:', error);
          
          // ✅ Manejar diferentes tipos de error
          let mensajeError = 'Error al eliminar el usuario';
          
          if (error.error && error.error.mensaje) {
            mensajeError = error.error.mensaje;
          } else if (error.message) {
            mensajeError = error.message;
          } else if (error.status === 404) {
            mensajeError = 'Usuario no encontrado';
          }
          
          this.error = mensajeError;
          alert(`❌ ${mensajeError}`);
        }
      });
    }
  }

  // ✅ NUEVO: Método para cambiar estado activo/inactivo
  cambiarEstadoUsuario(usuario: User): void {
    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (confirm(`¿${accion.toUpperCase()} al usuario ${usuario.nombre}?`)) {
      this.authService.cambiarEstadoUsuario(usuario.id, nuevoEstado).subscribe({
        next: (userActualizado) => {
          usuario.activo = nuevoEstado;
          alert(`✅ Usuario ${accion}do correctamente`);
        },
        error: (error) => {
          console.error('Error:', error);
          alert(`❌ Error al ${accion} el usuario`);
        }
      });
    }
  }

  // ✅ NUEVO: Método para verificar si es el usuario actual
  esUsuarioActual(usuario: User): boolean {
    return usuario.id === this.authService.getCurrentUser()?.id;
  }

  // ✅ NUEVO: Método para formatear fechas
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) {
      return 'No disponible';
    }
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
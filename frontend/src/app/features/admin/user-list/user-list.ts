import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
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

  getRolBadgeClass(rol: string): string {
    return rol === 'ADMIN' ? 'badge-admin' : 'badge-cliente';
  }

  getRolIcon(rol: string): string {
    return rol === 'ADMIN' ? '👑' : '👤';
  }

  getTotalUsuarios(): number {
    return this.usuarios.length;
  }

  getTotalAdmins(): number {
    return this.usuarios.filter(user => user.rol === 'ADMIN').length;
  }

  getTotalClientes(): number {
    return this.usuarios.filter(user => user.rol === 'CLIENTE').length;
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


}
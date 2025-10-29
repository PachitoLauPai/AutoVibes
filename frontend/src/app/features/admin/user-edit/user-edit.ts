import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.css'
})
export class UserEditComponent implements OnInit {
  usuario: User | null = null;
  loading: boolean = true;
  saving: boolean = false;
  error: string = '';
  success: string = '';

  usuarioEditado: any = {
    nombre: '',
    email: '',
    rol: 'CLIENTE'
  };

  roles = [
    { value: 'CLIENTE', label: 'Cliente' },
    { value: 'ADMIN', label: 'Administrador' }
  ];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/autos']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarUsuario(parseInt(id));
    }
  }

  cargarUsuario(id: number): void {
    this.loading = true;
    // Primero obtenemos todos los usuarios y filtramos por ID
    this.authService.getUsuarios().subscribe({
      next: (usuarios: User[]) => {
        const usuarioEncontrado = usuarios.find(u => u.id === id);
        if (usuarioEncontrado) {
          this.usuario = usuarioEncontrado;
          this.usuarioEditado = {
            nombre: usuarioEncontrado.nombre,
            email: usuarioEncontrado.email,
            rol: usuarioEncontrado.rol
          };
        } else {
          this.error = 'Usuario no encontrado';
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al cargar el usuario';
        console.error('Error:', error);
      }
    });
  }

  onSubmit(): void {
    if (!this.authService.isAdmin()) {
      this.error = 'Solo los administradores pueden editar usuarios';
      return;
    }

    if (!this.usuarioEditado.nombre || !this.usuarioEditado.email || !this.usuarioEditado.rol) {
      this.error = 'Nombre, email y rol son obligatorios';
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    if (this.usuario) {
      this.authService.actualizarUsuario(this.usuario.id, this.usuarioEditado).subscribe({
        next: (usuarioActualizado) => {
          this.saving = false;
          this.success = 'Usuario actualizado correctamente';
          setTimeout(() => {
            this.router.navigate(['/admin/usuarios']);
          }, 2000);
        },
        error: (error) => {
          this.saving = false;
          this.error = 'Error al actualizar el usuario';
          console.error('Error:', error);
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  // Prevenir que el admin se edite a sí mismo para quitarse permisos
  esUsuarioActual(): boolean {
    return this.usuario?.id === this.authService.getCurrentUser()?.id;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Rol } from '../../../../core/models/shared.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  usuarios: User[] = [];
  loading: boolean = true;
  error: string = '';

  // Modal properties
  showModal: boolean = false;
  modalMode: 'editar' | 'crear' = 'editar';
  selectedUsuario: User | null = null;
  usuarioForm!: FormGroup;
  submitting: boolean = false;
  showPassword: boolean = false;
  passwordActual: string = ''; // Contraseña actual para mostrar

  // Validation errors
  emailDuplicado: boolean = false;
  dniDuplicado: boolean = false;
  telefonoDuplicado: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Verificar que sea admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/autos']);
      return;
    }

    this.cargarUsuarios();
  }

  initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Contraseña requerida al crear, opcional al editar
      activo: [true]
    });
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
    this.router.navigate(['/admin/dashboard']);
  }

  registrarNuevoUsuario(): void {
    this.abrirModalCrear();
  }

  registrarNuevoAdministrador(): void {
    this.abrirModalCrear();
  }

  // Modal methods
  abrirModalCrear(): void {
    this.selectedUsuario = null;
    this.modalMode = 'crear';
    this.showPassword = false;
    this.usuarioForm.reset({
      activo: true
    });
    // Hacer contraseña requerida al crear
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  abrirModalEditar(usuario: User): void {
    // Permitir editar al admin principal solo ciertos campos
    this.selectedUsuario = usuario;
    this.modalMode = 'editar';
    this.showPassword = false; // Ocultar contraseña al abrir
    this.passwordActual = usuario.password || '••••••••••'; // Guardar contraseña actual
    this.usuarioForm.patchValue({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      password: '', // Dejar vacío, solo se actualiza si se ingresa
      activo: usuario.activo !== false
    });
    // Hacer contraseña opcional al editar
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.showPassword = false;
    this.passwordActual = ''; // Limpiar contraseña actual
    this.selectedUsuario = null;
    this.usuarioForm.reset();
    // Reset validation errors
    this.emailDuplicado = false;
    this.dniDuplicado = false;
    this.telefonoDuplicado = false;
  }

  // Validar si el email ya existe
  validarEmailDuplicado(): void {
    const email = this.usuarioForm.get('email')?.value;
    if (!email) {
      this.emailDuplicado = false;
      return;
    }

    this.emailDuplicado = this.usuarios.some(u =>
      u.email === email && u.id !== this.selectedUsuario?.id
    );
  }

  // Validar si el DNI ya existe
  validarDniDuplicado(): void {
    const dni = this.usuarioForm.get('dni')?.value;
    if (!dni) {
      this.dniDuplicado = false;
      return;
    }

    this.dniDuplicado = this.usuarios.some(u =>
      u.dni === dni && u.id !== this.selectedUsuario?.id
    );
  }

  // Validar si el teléfono ya existe
  validarTelefonoDuplicado(): void {
    const telefono = this.usuarioForm.get('telefono')?.value;
    if (!telefono) {
      this.telefonoDuplicado = false;
      return;
    }

    this.telefonoDuplicado = this.usuarios.some(u =>
      u.telefono === telefono && u.id !== this.selectedUsuario?.id
    );
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formData = this.usuarioForm.value;

    if (this.modalMode === 'crear') {
      // Crear nuevo usuario - solo nombre, email y contraseña
      const nuevoUsuario = {
        nombre: formData.nombre,
        correo: formData.email,
        password: formData.password,
        rolId: 1 // Por defecto crear como admin
      };

      this.authService.registrarAdmin(nuevoUsuario).subscribe({
        next: (response) => {
          alert('✅ Usuario creado correctamente');
          this.cerrarModal();
          this.cargarUsuarios();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error:', error);
          const errorMsg = error.error?.mensaje || 'Error al crear el usuario';
          alert(`❌ ${errorMsg}`);
          this.submitting = false;
        }
      });
    } else {
      // Actualizar usuario existente
      if (!this.selectedUsuario) {
        return;
      }

      // Para admin principal, no incluir el campo activo
      const usuarioActualizado: any = {
        nombre: formData.nombre,
        correo: formData.email,  // Enviar como "correo" para que coincida con el backend
        email: formData.email     // Pero también enviamos email por compatibilidad
      };

      // Solo incluir password si se cambió
      if (formData.password) {
        usuarioActualizado.password = formData.password;
      }

      // Solo incluir activo si NO es el admin principal
      if (this.selectedUsuario.id !== 1) {
        usuarioActualizado.activo = formData.activo;
      }

      this.authService.actualizarUsuario(this.selectedUsuario.id, usuarioActualizado).subscribe({
        next: (response) => {
          alert('✅ Usuario actualizado correctamente');
          this.cerrarModal();
          this.cargarUsuarios();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error:', error);
          alert('❌ Error al actualizar el usuario');
          this.submitting = false;
        }
      });
    }
  }

  editarUsuario(usuario: User): void {
    this.abrirModalEditar(usuario);
  }

  eliminarUsuario(usuario: User): void {
    // Proteger admin principal (ID 1)
    if (usuario.id === 1) {
      alert('❌ El administrador principal no puede ser eliminado');
      return;
    }

    if (usuario.id === this.authService.getCurrentUser()?.id) {
      alert('❌ No puedes eliminar tu propio usuario');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre} (${usuario.email})?\n\nEsta acción no se puede deshacer.`)) {
      this.authService.eliminarUsuario(usuario.id).subscribe({
        next: (response: any) => {
          // Eliminar del array local inmediatamente
          this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
          alert(`✅ ${response.mensaje || 'Usuario eliminado correctamente'}`);
        },
        error: (error) => {
          console.error('Error completo:', error);
          let mensajeError = 'Error al eliminar el usuario';

          if (error.error && error.error.mensaje) {
            mensajeError = error.error.mensaje;
          } else if (error.message) {
            mensajeError = error.message;
          } else if (error.status === 404) {
            mensajeError = 'Usuario no encontrado';
          }

          alert(`❌ ${mensajeError}`);
        }
      });
    }
  }

  cambiarEstadoUsuario(usuario: User): void {
    // Proteger admin principal (ID 1)
    if (usuario.id === 1) {
      alert('❌ El administrador principal no puede ser desactivado');
      return;
    }

    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿${accion.toUpperCase()} al usuario ${usuario.nombre}?`)) {
      this.authService.cambiarEstadoUsuario(usuario.id, nuevoEstado).subscribe({
        next: (userActualizado) => {
          // Actualizar el estado inmediatamente en el array
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

  esUsuarioActual(usuario: User): boolean {
    return usuario.id === this.authService.getCurrentUser()?.id;
  }

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
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
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      dni: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/), // Exactamente 8 dígitos numéricos
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      telefono: ['', [
        Validators.pattern(/^[0-9]{9}$/), // Exactamente 9 dígitos numéricos
        Validators.minLength(9),
        Validators.maxLength(9)
      ]],
      password: [''], // Contraseña opcional para editar, requerida para crear
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
    this.usuarioForm.reset({
      activo: true
    });
    // Hacer contraseña requerida al crear
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  abrirModalEditar(usuario: User): void {
    this.selectedUsuario = usuario;
    this.modalMode = 'editar';
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      email: usuario.email,
      dni: usuario.dni || '',
      telefono: usuario.telefono || '',
      password: '', // Dejar vacío, solo se actualiza si se ingresa
      activo: usuario.activo
    });
    // Hacer contraseña opcional al editar
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
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

    // Validar duplicados
    this.validarEmailDuplicado();
    this.validarDniDuplicado();
    this.validarTelefonoDuplicado();

    if (this.emailDuplicado || this.dniDuplicado || this.telefonoDuplicado) {
      return; // No continuar si hay duplicados
    }

    this.submitting = true;
    const formData = this.usuarioForm.value;

    if (this.modalMode === 'crear') {
      // Crear nuevo usuario
      const nuevoUsuario = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        correo: formData.email, // Mapear email a correo para el backend
        telefono: formData.telefono,
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

      const usuarioActualizado = {
        ...this.selectedUsuario,
        ...formData
      };

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
    if (usuario.id === this.authService.getCurrentUser()?.id) {
      alert('❌ No puedes eliminar tu propio usuario');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre} (${usuario.email})?\\n\\nEsta acción no se puede deshacer.`)) {
      this.authService.eliminarUsuario(usuario.id).subscribe({
        next: (response: any) => {
          if (response.eliminado || response.mensaje) {
            alert(`✅ ${response.mensaje || 'Usuario eliminado correctamente'}`);
            this.cargarUsuarios();
          } else {
            alert('✅ Usuario eliminado correctamente');
            this.cargarUsuarios();
          }
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

          this.error = mensajeError;
          alert(`❌ ${mensajeError}`);
        }
      });
    }
  }

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
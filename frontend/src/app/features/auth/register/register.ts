import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  userData: any = {
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    rol: 'CLIENTE' // Por defecto cliente, admin puede cambiar
  };

  loading: boolean = false;
  error: string = '';
  success: string = '';

  // Solo mostrar opción de rol si es admin
  showRoleOption: boolean = false;

  roles = [
    { value: 'CLIENTE', label: 'Cliente' },
    { value: 'ADMIN', label: 'Administrador' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Verificar si el usuario actual es admin para mostrar opción de rol
    this.showRoleOption = this.authService.isAdmin();
  }

  onSubmit(): void {
    // Validaciones
    if (this.userData.password !== this.userData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.userData.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Preparar datos para enviar (sin confirmPassword)
    const { confirmPassword, ...registerData } = this.userData;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.id) {
          this.success = 'Usuario registrado exitosamente';
          
          // Si el usuario actual es admin, permanecer en la página
          if (this.authService.isAdmin()) {
            setTimeout(() => {
              this.resetForm();
            }, 2000);
          } else {
            // Si es cliente, redirigir al login después de 2 segundos
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
        } else {
          this.error = response.mensaje || 'Error al registrar usuario';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error en el servidor';
        console.error('Error:', error);
      }
    });
  }

  resetForm(): void {
    this.userData = {
      email: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      rol: 'CLIENTE'
    };
    this.error = '';
    this.success = '';
  }

  volver(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/autos']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
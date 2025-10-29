import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  loading: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (user) => {  // ✅ Cambiar 'response' por 'user'
        this.loading = false;
        
        // ✅ Si llega un usuario con ID, el login fue exitoso
        if (user && user.id) {
          this.router.navigate(['/autos']);
        } else {
          this.error = 'Credenciales inválidas'; // ✅ Mensaje fijo
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Credenciales incorrectas'; // ✅ Mensaje de error
        console.error('Error en login:', error);
      }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }
}
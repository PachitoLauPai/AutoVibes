import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-login-container">
      <div class="admin-login-box">
        <div class="login-header">
          <h1>🔐 Área Administrativa</h1>
          <p>Ingresa tus credenciales para acceder</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="login()" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              class="form-control"
              formControlName="email"
              placeholder="admin@autovibes.com"
              [class.is-invalid]="isFieldInvalid('email')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">Email es requerido</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Email inválido</span>
            </div>
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              class="form-control"
              formControlName="password"
              placeholder="••••••••"
              [class.is-invalid]="isFieldInvalid('password')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              Contraseña es requerida
            </div>
          </div>

          <!-- Recuérdame -->
          <div class="form-check">
            <input
              type="checkbox"
              id="remember"
              class="form-check-input"
              formControlName="remember"
            />
            <label class="form-check-label" for="remember">Recuérdame</label>
          </div>

          <!-- Botón login -->
          <button
            type="submit"
            class="btn-login"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Acceder</span>
            <span *ngIf="isLoading">Cargando...</span>
          </button>
        </form>

        <!-- Mensaje de error -->
        <div class="error-alert" *ngIf="errorMessage">
          <strong>⚠️ Error:</strong> {{ errorMessage }}
        </div>

        <!-- Volver -->
        <div class="back-link">
          <a (click)="volver()">← Volver al inicio</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .admin-login-box {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      padding: 3rem;
      max-width: 400px;
      width: 100%;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      color: #333;
      font-size: 1.8rem;
      margin: 0 0 0.5rem 0;
    }

    .login-header p {
      color: #666;
      font-size: 0.95rem;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .form-check {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-check-input {
      width: 1rem;
      height: 1rem;
      cursor: pointer;
    }

    .form-check-label {
      cursor: pointer;
      color: #666;
      font-size: 0.95rem;
      margin: 0;
    }

    .btn-login {
      background-color: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 0.5rem;
    }

    .btn-login:hover:not(:disabled) {
      background-color: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-alert {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 1rem;
      border-radius: 6px;
      font-size: 0.95rem;
    }

    .back-link {
      text-align: center;
      margin-top: 1.5rem;
    }

    .back-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;
    }

    .back-link a:hover {
      color: #5568d3;
      text-decoration: underline;
    }

    @media (max-width: 576px) {
      .admin-login-box {
        padding: 2rem;
      }

      .login-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit(): void {
    console.log('AdminLoginComponent inicializado');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  login(): void {
    if (!this.loginForm.valid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    console.log('Intentando login con:', credentials.email);

    this.authService.loginAdmin(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.isLoading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}

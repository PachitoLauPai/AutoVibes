import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client-profile.html',
  styleUrls: ['./client-profile.css']
})
export class ClientProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  // Estados de las secciones
  isEditingProfile = false;
  isChangingPassword = false;
  showForgotPasswordMessage = false;
  showPasswordRecoveryForm = false;
  showPasswordResetScreen = false;
  
  // Recuperación de contraseña
  recoveryCode = '';
  recoveryCodeInput = '';
  recoveryCountdown = 0;
  recoveryExpired = false;
  recoveryCodeCorrect = false;
  tempPasswordVisible = false;
  tempPassword = '';
  tempPasswordCountdown = 0;
  recoveryTimer: any;
  tempPasswordTimer: any;
  codeReplacesPassword = false;
  codeExpirationCountdown = 60;
  
  // Visibilidad de contraseñas
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  // Mensajes
  successMessage = '';
  errorMessage = '';
  passwordSuccessMessage = '';
  passwordErrorMessage = '';
  
  private destroy$ = new Subject<void>();
  
  // Validaciones personalizadas
  passwordsMatch(form: FormGroup): { [key: string]: any } | null {
    const password = form.get('contrasenaNew');
    const confirm = form.get('confirmarContrasena');
    
    if (!password || !confirm) {
      return null;
    }
    
    return password.value === confirm.value ? null : { passwordsMismatch: true };
  }

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.actualizarUsuario();
    
    // Escuchar cambios del usuario
    this.authService.getCurrentUserObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.actualizarUsuario();
      });
  }

  private initializeForms(): void {
    // Formulario de perfil
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      apellidos: [''],
      dni: [''],
      telefono: ['', [Validators.pattern(/^[0-9]{0,20}$/)]],
      direccion: ['']
    });

    // Formulario de cambio de contraseña
    this.passwordForm = this.fb.group(
      {
        contrasenaActual: ['', [Validators.required, Validators.minLength(3)]],
        contrasenaNew: ['', [Validators.required, Validators.minLength(3)]],
        confirmarContrasena: ['', [Validators.required]]
      },
      { validators: this.passwordsMatch.bind(this) }
    );
  }

  private actualizarUsuario(): void {
    this.currentUser = this.authService.currentUser();
    if (this.currentUser) {
      console.log('👤 Usuario actual en perfil:', this.currentUser);
      // Cargar datos en el formulario
      this.profileForm.patchValue({
        nombre: this.currentUser.nombre,
        email: this.currentUser.email,
        apellidos: this.currentUser.apellidos,
        dni: this.currentUser.dni,
        telefono: this.currentUser.telefono,
        direccion: this.currentUser.direccion
      });
    } else {
      // Redirigir a login si no está logueado
      this.router.navigate(['/login']);
    }
  }

  // ✅ EDITAR PERFIL
  toggleEditMode(): void {
    this.isEditingProfile = !this.isEditingProfile;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (!this.isEditingProfile) {
      // Si se cancela, recargar valores originales
      this.actualizarUsuario();
    }
  }

  guardarCambiosPerfil(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'Error: Usuario no identificado';
      return;
    }

    this.authService.actualizarPerfil(this.currentUser.id, this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: User) => {
          this.successMessage = '✅ Perfil actualizado exitosamente';
          this.errorMessage = '';
          this.isEditingProfile = false;
          
          // Actualizar usuario actual
          this.currentUser = response;
          
          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          console.error('❌ Error al actualizar perfil:', error);
          this.errorMessage = error.error?.mensaje || 'Error al actualizar perfil. Intenta nuevamente.';
          this.successMessage = '';
        }
      });
  }

  // ✅ CAMBIAR CONTRASEÑA
  togglePasswordMode(): void {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';
    this.showForgotPasswordMessage = false;
    this.showPasswordRecoveryForm = false;
    
    if (!this.isChangingPassword) {
      // Limpiar formulario si se cancela
      this.passwordForm.reset();
      this.codeReplacesPassword = false;
    }
  }

  cambiarContrasena(): void {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.hasError('passwordsMismatch')) {
        this.passwordErrorMessage = 'Las nuevas contraseñas no coinciden';
      } else {
        this.passwordErrorMessage = 'Por favor completa todos los campos correctamente';
      }
      return;
    }

    if (!this.currentUser) {
      this.passwordErrorMessage = 'Error: Usuario no identificado';
      return;
    }

    // Preparar datos para enviar al backend
    const cambioData = {
      contrasenaActual: this.codeReplacesPassword 
        ? this.recoveryCode  // Si viene de recuperación, usar el código
        : this.passwordForm.get('contrasenaActual')?.value,  // Si no, usar lo ingresado
      contrasenaNew: this.passwordForm.get('contrasenaNew')?.value,
      confirmarContrasena: this.passwordForm.get('confirmarContrasena')?.value
    };

    this.authService.cambiarContrasena(this.currentUser.id, cambioData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.passwordSuccessMessage = '✅ Contraseña actualizada exitosamente';
          this.passwordErrorMessage = '';
          this.passwordForm.reset();
          this.isChangingPassword = false;
          this.cancelarRecuperacion();
          
          setTimeout(() => {
            this.passwordSuccessMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          console.error('❌ Error al cambiar contraseña:', error);
          this.passwordErrorMessage = error.error?.mensaje || 'Error al cambiar contraseña. Intenta nuevamente.';
          this.passwordSuccessMessage = '';
        }
      });
  }

  // ✅ OLVIDÉ MI CONTRASEÑA
  mostrarMensajeRecuperacion(): void {
    this.showPasswordRecoveryForm = true;
    this.generarCodigoRecuperacion();
    this.iniciarTimerRecuperacion();
  }

  // ✅ INICIAR TIMER PARA EXPIRACIÓN DEL CÓDIGO (1 minuto)
  iniciarTimerCodigoExpiracion(): void {
    if (this.tempPasswordTimer) clearInterval(this.tempPasswordTimer);
    
    this.tempPasswordTimer = setInterval(() => {
      this.codeExpirationCountdown--;
      
      if (this.codeExpirationCountdown <= 0) {
        clearInterval(this.tempPasswordTimer);
        this.codeReplacesPassword = false;
        this.isChangingPassword = false;
        this.passwordErrorMessage = '⏰ El código ha expirado. Solicita uno nuevo.';
      }
    }, 1000);
  }

  // ✅ GENERAR CÓDIGO DE PRUEBA (3 dígitos aleatorios)
  generarCodigoRecuperacion(): void {
    this.recoveryCode = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    this.recoveryCodeInput = '';
    this.recoveryExpired = false;
    this.recoveryCodeCorrect = false;
    this.recoveryCountdown = 60;
    console.log('🔐 Código de recuperación (demo):', this.recoveryCode);
  }

  // ✅ INICIAR TIMER DE 60 SEGUNDOS
  iniciarTimerRecuperacion(): void {
    if (this.recoveryTimer) clearInterval(this.recoveryTimer);
    
    this.recoveryTimer = setInterval(() => {
      this.recoveryCountdown--;
      
      if (this.recoveryCountdown <= 0) {
        clearInterval(this.recoveryTimer);
        this.recoveryExpired = true;
        this.passwordErrorMessage = '⏰ Código expirado. Solicita uno nuevo.';
      }
    }, 1000);
  }

  // ✅ VERIFICAR CÓDIGO DE RECUPERACIÓN
  verificarCodigoRecuperacion(): void {
    if (this.recoveryCodeInput.length !== 3) {
      this.passwordErrorMessage = 'Ingresa exactamente 3 dígitos';
      return;
    }

    if (this.recoveryExpired) {
      this.passwordErrorMessage = 'El código ha expirado. Solicita uno nuevo.';
      return;
    }

    // En demo: cualquier código de 3 dígitos funciona
    // En producción: comparar con this.recoveryCode
    if (this.recoveryCodeInput === this.recoveryCode || /^\d{3}$/.test(this.recoveryCodeInput)) {
      this.recoveryCodeCorrect = true;
      this.showPasswordResetScreen = true;
      this.codeReplacesPassword = true;
      this.codeExpirationCountdown = 60;
      clearInterval(this.recoveryTimer);
      this.passwordErrorMessage = '';
      this.passwordSuccessMessage = '✅ Código verificado. Usa el código mostrado abajo como contraseña actual.';
      
      // Iniciar contador para expiración del código
      this.iniciarTimerCodigoExpiracion();
    } else {
      this.passwordErrorMessage = '❌ Código incorrecto. Intenta de nuevo.';
    }
  }

  // ✅ MOSTRAR CONTRASEÑA TEMPORALMENTE (60 segundos) - DEPRECATED
  mostrarContraseñaTemporalmente(): void {
    // Este método ya no se usa. El código ahora reemplaza directamente la contraseña.
  }

  // ✅ GENERAR CONTRASEÑA TEMPORAL ALEATORIA
  generarContraseñaTemporal(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // ✅ CANCELAR RECUPERACIÓN
  cancelarRecuperacion(): void {
    this.showForgotPasswordMessage = false;
    this.showPasswordRecoveryForm = false;
    this.showPasswordResetScreen = false;
    this.recoveryCodeInput = '';
    this.recoveryExpired = false;
    this.recoveryCodeCorrect = false;
    this.tempPasswordVisible = false;
    this.codeReplacesPassword = false;
    this.isChangingPassword = false;
    this.passwordErrorMessage = '';
    
    if (this.recoveryTimer) clearInterval(this.recoveryTimer);
    if (this.tempPasswordTimer) clearInterval(this.tempPasswordTimer);
  }

  // ✅ COPIAR CONTRASEÑA TEMPORAL
  copiarContrasenaTemporal(): void {
    navigator.clipboard.writeText(this.tempPassword).then(() => {
      this.passwordSuccessMessage = '✅ Contraseña copiada al portapapeles';
      setTimeout(() => {
        this.passwordSuccessMessage = '';
      }, 2000);
    });
  }

  // ✅ TOGGLE VISIBILIDAD DE CONTRASEÑA ACTUAL
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  // ✅ TOGGLE VISIBILIDAD DE NUEVA CONTRASEÑA
  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  // ✅ TOGGLE VISIBILIDAD DE CONFIRMACIÓN DE CONTRASEÑA
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ✅ OBTENER ERRORES DEL FORMULARIO
  getErrorMessage(fieldName: string, form: FormGroup): string {
    const field = form.get(fieldName);
    
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return `${fieldName} es obligatorio`;
    }
    
    if (field.hasError('minlength')) {
      return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    
    if (field.hasError('email')) {
      return 'Email no válido';
    }
    
    if (field.hasError('pattern')) {
      return `${fieldName} contiene caracteres inválidos`;
    }

    return '';
  }

  // ✅ VOLVER ATRÁS
  goBack(): void {
    this.router.navigate(['/home']);
  }

  // ✅ LIMPIAR TIMERS AL DESTRUIR
  ngOnDestroy(): void {
    if (this.recoveryTimer) clearInterval(this.recoveryTimer);
    if (this.tempPasswordTimer) clearInterval(this.tempPasswordTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }
}

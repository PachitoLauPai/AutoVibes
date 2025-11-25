import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { LoggerService } from '../../../core/services/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isMenuOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.actualizarUsuario();
    
    this.authService.getCurrentUserObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.actualizarUsuario();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  actualizarUsuario(): void {
    this.currentUser = this.authService.currentUser();
    this.logger.debug('Usuario actual actualizado', { nombre: this.currentUser?.nombre });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.logger.info('Cerrando sesión');
      this.authService.logout();
      this.currentUser = null;
      this.isMenuOpen = false;
      
      this.router.navigate(['/home']).then(() => {
        this.logger.debug('Sesión cerrada - Redirigido a HOME');
      });
    }
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  irAHome(): void {
    this.router.navigate(['/home']);
    this.isMenuOpen = false;
  }

  irAAutos(): void {
    this.router.navigate(['/autos']);
    this.isMenuOpen = false;
  }

  irAAgregarAuto(): void {
    this.router.navigate(['/admin/autos/nuevo']);
    this.isMenuOpen = false;
  }

  irAUsuarios(): void {
    this.router.navigate(['/admin/usuarios']);
    this.isMenuOpen = false;
  }

  irAVentas(): void {
    this.router.navigate(['/admin/ventas']);
    this.isMenuOpen = false;
  }

  // ✅ NUEVO: Ir a Mi Perfil
  irAMiPerfil(): void {
    this.router.navigate(['/cliente/perfil']);
    this.isMenuOpen = false;
  }

  // ✅ CAMBIAR: irAHome() a irAlLogo()
  irAlLogo(): void {
    if (this.authService.isAdmin()) {
      // ✅ Si es ADMIN → Ir a gestión de autos
      this.router.navigate(['/autos']);
    } else {
      // ✅ Si es CLIENTE o NO logueado → Ir a HOME
      this.router.navigate(['/home']);
    }
    this.isMenuOpen = false;
  }
}
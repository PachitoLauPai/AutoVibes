import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { LoggerService } from '../../../core/services/logger.service';
import { AutoService } from '../../../core/services/auto.service';
import { CondicionAuto } from '../../../core/models/shared.model';
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
  isComprarDropdownOpen = false;
  condiciones: CondicionAuto[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private router: Router,
    private logger: LoggerService,
    private autoService: AutoService
  ) {}

  ngOnInit(): void {
    this.actualizarUsuario();
    this.cargarCondiciones();
    
    this.authService.getCurrentUserObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.actualizarUsuario();
      });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (event: any) => {
      if (!event.target.closest('.nav-item.dropdown')) {
        this.cerrarComprarDropdown();
      }
    });
  }

  cargarCondiciones(): void {
    this.autoService.getCondiciones().pipe(takeUntil(this.destroy$)).subscribe({
      next: (condiciones) => {
        this.condiciones = condiciones;
        this.logger.debug('Condiciones cargadas en navbar', { count: condiciones.length });
      },
      error: (err) => this.logger.error('Error cargando condiciones en navbar', err)
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

  abrirComprarDropdown(): void {
    this.isComprarDropdownOpen = true;
  }

  cerrarComprarDropdown(): void {
    this.isComprarDropdownOpen = false;
  }

  toggleComprarDropdown(): void {
    this.isComprarDropdownOpen = !this.isComprarDropdownOpen;
  }

  irACondicion(condicionId: number): void {
    this.router.navigate(['/autos'], { queryParams: { condicion: condicionId } });
    this.cerrarComprarDropdown();
  }

  getCondicionDescripcion(condicionNombre: string): string {
    const descripciones: { [key: string]: string } = {
      'USADO': 'Vendidos por sus dueños o vendedores especializados.',
      'NUEVO': 'Tiendas oficiales de más de 20 concesionarios y marcas.',
      'SEMINUEVO': 'Vehículos con poco uso, en excelente estado.'
    };
    return descripciones[condicionNombre.toUpperCase()] || 'Explora nuestra selección.';
  }
}
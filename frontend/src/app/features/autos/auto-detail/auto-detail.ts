import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AutoService } from '../../../../core/services/auto.service';
import { Auto } from '../../../../core/models/auto.model';
import { VentaService} from '../../../../core/services/venta.service';
import { ContactRequest } from '../../../../core/models/venta.model';
import { AuthService } from '../../../../core/services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-auto-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auto-detail.html',
  styleUrls: ['./auto-detail.css']
})
export class AutoDetailComponent implements OnInit, OnDestroy {
  auto: Auto | null = null;
  loading = true;
  error = '';
  
  // ✅ VARIABLES PARA EL CARRUSEL
  currentImageIndex = 0;
  
  showContactModal = false;
  contactData: ContactRequest = {
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    direccion: '',
    autoId: 0
  };
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autoService: AutoService,
    private ventaService: VentaService,
    private authService: AuthService,
    private logger: LoggerService
  ) {}

   ngOnInit(): void {
    // ✅ VERIFICAR SI ESTÁ LOGEADO ANTES DE CARGAR
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAuto();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadAuto(): void {
    const autoId = this.route.snapshot.paramMap.get('id');
    
    if (!autoId) {
      this.error = 'ID de auto no especificado';
      this.loading = false;
      return;
    }

    this.autoService.getAuto(parseInt(autoId)).pipe(takeUntil(this.destroy$)).subscribe({
      next: (auto) => {
        this.auto = auto;
        this.contactData.autoId = auto.id;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el auto';
        this.loading = false;
        this.logger.error('Error loading auto', error);
      }
    });
  }

  // ✅ MÉTODOS PARA EL CARRUSEL
  getCurrentImage(): string {
    if (!this.auto || !this.auto.imagenes || this.auto.imagenes.length === 0) {
      return this.getPlaceholderImage();
    }
    return this.auto.imagenes[this.currentImageIndex];
  }

  nextImage(): void {
    if (!this.auto || this.auto.imagenes.length <= 1) return;
    
    this.currentImageIndex = (this.currentImageIndex + 1) % this.auto.imagenes.length;
  }

  prevImage(): void {
    if (!this.auto || this.auto.imagenes.length <= 1) return;
    
    this.currentImageIndex = this.currentImageIndex === 0 
      ? this.auto.imagenes.length - 1 
      : this.currentImageIndex - 1;
  }

  goToImage(index: number): void {
    if (!this.auto || index < 0 || index >= this.auto.imagenes.length) return;
    
    this.currentImageIndex = index;
  }

  getPlaceholderImage(): string {
    return 'https://via.placeholder.com/600x400/cccccc/969696?text=Imagen+No+Disponible';
  }

  // ... resto de tus métodos existentes (volverALista, openContactModal, etc.)

  volverALista(): void {
    this.router.navigate(['/autos']);
  }

  openContactModal(): void {
      if (this.auto) {
        // ✅ VERIFICAR AUTENTICACIÓN REAL
        if (!this.authService.isLoggedIn()) {
          alert('Debe iniciar sesión para contactar al vendedor');
          this.router.navigate(['/login']);
          return;
        }

        // ✅ VERIFICAR ROL REAL CONTRA BASE DE DATOS
        if (!this.authService.isCliente()) {
          const user = this.authService.getCurrentUser();
          alert(`Los usuarios con rol ${user?.rol} no pueden contactar vendedores. Solo los clientes pueden realizar compras.`);
          return;
        }

        this.contactData.autoId = this.auto.id;
        // ✅ AUTOCOMPLETAR DATOS DEL CLIENTE
        this.autocompletarDatosCliente();
        this.showContactModal = true;
      }
    }

  // ✅ AUTOCOMPLETAR DATOS DEL CLIENTE LOGUEADO
  autocompletarDatosCliente(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.contactData.nombres = user.nombre || '';
      this.contactData.apellidos = user.apellidos || '';
      this.contactData.dni = user.dni || '';
      this.contactData.telefono = user.telefono || '';
      this.contactData.direccion = user.direccion || '';
      
      this.logger.debug('Datos autocompletados del cliente', { autoId: this.contactData.autoId });
    }
  }

  closeContactModal(): void {
    this.showContactModal = false;
    this.resetContactForm();
  }

  contactarVendedor(): void {
    this.logger.debug('contactarVendedor llamado', { autoId: this.contactData.autoId });
    
    if (!this.isFormValid()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    this.ventaService.contactarVendedor(this.contactData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.logger.info('Solicitud de contacto enviada exitosamente', { autoId: this.contactData.autoId });
        alert('¡Solicitud enviada correctamente! Te contactaremos pronto.');
        this.closeContactModal();
      },
      error: (error) => {
        this.logger.error('Error al enviar solicitud de contacto', error);
        const errorMessage = error.error?.mensaje || error.error || 'Error desconocido';
        alert('Error al enviar solicitud: ' + errorMessage);
      }
    });
  }

  private isFormValid(): boolean {
    return !!(
      this.contactData.nombres?.trim() &&
      this.contactData.apellidos?.trim() &&
      this.contactData.dni?.trim() &&
      this.contactData.telefono?.trim() &&
      this.contactData.direccion?.trim()
    );
  }

  private resetContactForm(): void {
    this.contactData = {
      nombres: '',
      apellidos: '',
      dni: '',
      telefono: '',
      direccion: '',
      autoId: this.auto?.id || 0
    };
  }

  handleImageError(event: any): void {
    event.target.src = this.getPlaceholderImage();
  }

  // ✅ Método para ir al login
  irALogin(): void {
    this.router.navigate(['/login']);
  }

  // ✅ Método para obtener imagen por defecto
  getDefaultImage(auto: Auto): string {
    const marcaNombre = auto.marca?.nombre || 'Auto';
    return `https://via.placeholder.com/600x400/cccccc/969696?text=${marcaNombre}+${auto.modelo}`;
  }
  
}
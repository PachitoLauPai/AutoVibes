import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AutoService } from '../../../../core/services/auto.service';
import { Auto } from '../../../../core/models/auto.model';
import { ContactService, ContactRequest } from '../../../../core/services/contact.service';
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
  
  // ✅ VARIABLES PARA EL MODAL DE IMÁGENES CON ZOOM
  showImageModal = false;
  modalImageIndex = 0;
  imageZoom = 1;
  
  showContactModal = false;
  contactData: ContactRequest = {
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    autoId: undefined
  };
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autoService: AutoService,
    private contactService: ContactService,
    private authService: AuthService,
    private logger: LoggerService
  ) {}

   ngOnInit(): void {
    // Permitir ver el detalle sin login, solo el contacto requiere login
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
        // Establecer autoId y asunto por defecto
        this.contactData.autoId = auto.id;
        this.contactData.asunto = `Consulta sobre ${auto.marca?.nombre} ${auto.modelo} ${auto.anio}`;
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
    if (this.auto) {
      const marcaNombre = this.auto.marca?.nombre || 'Auto';
      return `https://via.placeholder.com/600x400/cccccc/969696?text=${marcaNombre}+${this.auto.modelo}`;
    }
    return 'https://via.placeholder.com/600x400/cccccc/969696?text=Imagen+No+Disponible';
  }

  volverALista(): void {
    this.router.navigate(['/autos']);
  }

  viewAllPhotos(): void {
    // Abrir modal con todas las fotos
    this.openImageModal(this.currentImageIndex);
  }

  openImageModal(index: number): void {
    if (!this.auto || !this.auto.imagenes || this.auto.imagenes.length === 0) return;
    
    this.modalImageIndex = index;
    this.imageZoom = 1;
    this.showImageModal = true;
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.imageZoom = 1;
    document.body.style.overflow = ''; // Restaurar scroll del body
  }

  getModalImage(): string {
    if (!this.auto || !this.auto.imagenes || this.auto.imagenes.length === 0) {
      return this.getPlaceholderImage();
    }
    return this.auto.imagenes[this.modalImageIndex];
  }

  nextModalImage(): void {
    if (!this.auto || !this.auto.imagenes || this.auto.imagenes.length <= 1) return;
    this.modalImageIndex = (this.modalImageIndex + 1) % this.auto.imagenes.length;
    this.imageZoom = 1; // Reset zoom al cambiar imagen
  }

  prevModalImage(): void {
    if (!this.auto || !this.auto.imagenes || this.auto.imagenes.length <= 1) return;
    this.modalImageIndex = this.modalImageIndex === 0 
      ? this.auto.imagenes.length - 1 
      : this.modalImageIndex - 1;
    this.imageZoom = 1; // Reset zoom al cambiar imagen
  }

  goToModalImage(index: number): void {
    if (!this.auto || index < 0 || index >= this.auto.imagenes.length) return;
    this.modalImageIndex = index;
    this.imageZoom = 1; // Reset zoom al cambiar imagen
  }

  zoomIn(): void {
    this.imageZoom = Math.min(this.imageZoom + 0.25, 3);
  }

  zoomOut(): void {
    this.imageZoom = Math.max(this.imageZoom - 0.25, 0.5);
  }

  resetZoom(): void {
    this.imageZoom = 1;
  }

  contactarWhatsApp(): void {
    if (!this.auto || !this.auto.concesionario?.telefono) {
      // Fallback al modal si no hay teléfono
      this.openContactModal();
      return;
    }

    // Limpiar el número de teléfono (remover espacios, guiones, etc.)
    let telefono = this.auto.concesionario.telefono.replace(/\s+/g, '').replace(/-/g, '');
    
    // Crear mensaje para WhatsApp
    const mensaje = encodeURIComponent(
      `Hola, estoy interesado en el ${this.auto.marca?.nombre} ${this.auto.modelo} ${this.auto.anio}.\n` +
      `Precio: US$ ${this.auto.precio.toLocaleString()}\n` +
      `¿Podrían proporcionarme más información?`
    );

    // Abrir WhatsApp (formato internacional: código país + número)
    // Si el número no tiene código de país, agregamos +51 (Perú)
    let numeroWhatsApp = telefono;
    if (!numeroWhatsApp.startsWith('+')) {
      // Remover cualquier cero inicial
      numeroWhatsApp = numeroWhatsApp.replace(/^0+/, '');
      numeroWhatsApp = '+51' + numeroWhatsApp;
    }

    const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    window.open(whatsappUrl, '_blank');
  }

  openContactModal(): void {
    if (this.auto) {
      // No requiere login para contactar
      this.contactData.autoId = this.auto.id;
      this.contactData.asunto = `Consulta sobre ${this.auto.marca?.nombre} ${this.auto.modelo} ${this.auto.anio}`;
      
      // Si está logueado, autocompletar datos
      if (this.authService.isLoggedIn()) {
        this.autocompletarDatosCliente();
      }
      
      this.showContactModal = true;
    }
  }

  // ✅ AUTOCOMPLETAR DATOS DEL CLIENTE LOGUEADO
  autocompletarDatosCliente(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.contactData.nombre = user.nombre || '';
      this.contactData.email = user.email || '';
      
      this.logger.debug('Datos autocompletados del cliente', { autoId: this.contactData.autoId });
    }
  }

  closeContactModal(): void {
    this.showContactModal = false;
    this.resetContactForm();
  }

  enviarContacto(): void {
    this.logger.debug('enviarContacto llamado', { autoId: this.contactData.autoId });
    
    if (!this.isFormValid()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Asegurar que el autoId esté presente
    if (this.auto) {
      this.contactData.autoId = this.auto.id;
    }

    this.contactService.enviarContacto(this.contactData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.logger.info('Contacto enviado exitosamente', { autoId: this.contactData.autoId });
        alert('¡Mensaje enviado correctamente! Te contactaremos pronto.');
        this.closeContactModal();
      },
      error: (error) => {
        this.logger.error('Error al enviar contacto', error);
        const errorMessage = error.error?.mensaje || error.message || 'Error desconocido';
        alert('Error al enviar mensaje: ' + errorMessage);
      }
    });
  }

  private isFormValid(): boolean {
    return !!(
      this.contactData.nombre?.trim() &&
      this.contactData.dni?.trim() &&
      this.contactData.email?.trim() &&
      this.contactData.telefono?.trim() &&
      this.contactData.mensaje?.trim()
    );
  }

  private resetContactForm(): void {
    if (this.auto) {
      this.contactData = {
        nombre: '',
        dni: '',
        email: '',
        telefono: '',
        asunto: `Consulta sobre ${this.auto.marca?.nombre} ${this.auto.modelo} ${this.auto.anio}`,
        mensaje: '',
        autoId: this.auto.id
      };
    } else {
      this.contactData = {
        nombre: '',
        dni: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        autoId: undefined
      };
    }
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
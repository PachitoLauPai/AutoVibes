import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Modal de contacto
  showContactModal = false;
  contactForm: FormGroup;
  enviandoContacto = false;
  mensajeContacto = '';
  contactoEnviado = false;

  // Modal de Sobre Nosotros
  showSobreNosotros = false;

  // Modal de Servicios
  showServicios = false;

  // WhatsApp
  whatsappLink = 'https://wa.me/51999999999?text=Hola%20AutoVibes%20tengo%20una%20consulta';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      asunto: ['', [Validators.required]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    console.log('NavbarComponent inicializado');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Navegación pública
   */
  irAlHome(): void {
    this.router.navigate(['/home']);
  }

  irAutos(): void {
    this.router.navigate(['/autos']);
  }

  /**
   * Modalidad de Contacto
   */
  abrirContacto(): void {
    this.showContactModal = true;
    this.contactoEnviado = false;
    this.mensajeContacto = '';
  }

  cerrarContacto(): void {
    this.showContactModal = false;
    this.contactForm.reset();
    this.contactoEnviado = false;
    this.enviandoContacto = false;
  }

  enviarContacto(): void {
    if (!this.contactForm.valid) {
      this.mensajeContacto = '❌ Por favor completa todos los campos correctamente.';
      return;
    }

    this.enviandoContacto = true;
    this.mensajeContacto = '';
    
    const contactData = this.contactForm.value;
    
    this.contactService.enviarContacto(contactData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: string) => {
          this.enviandoContacto = false;
          this.contactoEnviado = true;
          this.mensajeContacto = '✅ ' + (response || 'Mensaje enviado correctamente. Te contactaremos pronto.');
          this.contactForm.reset();
          
          // Cerrar automáticamente después de 3 segundos
          setTimeout(() => {
            this.cerrarContacto();
          }, 3000);
        },
        error: (error: Error) => {
          this.enviandoContacto = false;
          this.contactoEnviado = false;
          this.mensajeContacto = '❌ Error al enviar mensaje: ' + (error?.message || 'Intenta nuevamente');
          console.error('Error al enviar contacto:', error);
        }
      });
  }

  /**
   * Modal de Sobre Nosotros
   */
  irSobreNosotros(): void {
    this.showSobreNosotros = true;
  }

  cerrarSobreNosotros(): void {
    this.showSobreNosotros = false;
  }

  /**
   * Modal de Servicios
   */
  irServicios(): void {
    this.showServicios = true;
  }

  cerrarServicios(): void {
    this.showServicios = false;
  }

  /**
   * Cerrar modales al hacer click fuera (solo en desktop)
   */
  cerrarModalAlClickAfuera(event: MouseEvent, tipo: 'contacto' | 'sobreNosotros' | 'servicios'): void {
    const target = event.target as HTMLElement;
    if (tipo === 'contacto' && target.classList.contains('contact-modal')) {
      this.cerrarContacto();
    } else if (tipo === 'sobreNosotros' && target.classList.contains('info-modal')) {
      this.cerrarSobreNosotros();
    } else if (tipo === 'servicios' && target.classList.contains('info-modal')) {
      this.cerrarServicios();
    }
  }
}

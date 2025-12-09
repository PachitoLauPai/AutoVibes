import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';

interface Auto {
  id?: number;
  marca?: { nombre: string };
  modelo: string;
  anio: number;
  precio: number;
  color: string;
  kilometraje?: number;
  stock?: number;
  combustible?: { nombre: string };
  transmision?: { nombre: string };
  categoria?: { nombre: string };
  condicion?: { nombre: string };
  imagenes?: string[];
}

interface Contact {
  id?: number;
  nombre: string;
  correo?: string;
  email?: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  estado?: string;
  tipoTransaccion?: string;
  fechaCreacion?: Date;
  leido?: boolean;
  dni?: string;
  auto?: Auto;
}

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css'
})
export class ContactListComponent implements OnInit {
  contactos: Contact[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  selectedStatus = 'PENDIENTE';
  selectedContact: Contact | null = null;
  showDetail = false;
  editingStatus: { [key: number]: boolean } = {};
  newStatus: { [key: number]: string } = {};

  constructor(
    private router: Router,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.cargarContactos();
  }

  cargarContactos(): void {
    this.loading = true;
    this.error = '';

    this.contactService.obtenerContactos().subscribe({
      next: (contactos: Contact[]) => {
        this.contactos = contactos;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los contactos. Por favor, intenta más tarde.';
        this.loading = false;
        console.error('Error cargando contactos:', err);
      }
    });
  }

  get unreadCount(): number {
    return this.contactos.filter(c => !c.leido).length;
  }

  get contactosFiltrados(): Contact[] {
    let filtered = this.contactos;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nombre.toLowerCase().includes(term) ||
        (c.correo || c.email)?.toLowerCase().includes(term) ||
        c.asunto.toLowerCase().includes(term)
      );
    }

    // Si selectedStatus es 'TODOS', mostrar todos los estados válidos
    if (this.selectedStatus !== 'TODOS') {
      filtered = filtered.filter(c => c.estado === this.selectedStatus);
    } else {
      // Mostrar solo contactos con estados válidos
      filtered = filtered.filter(c => 
        c.estado === 'PENDIENTE' || 
        c.estado === 'EN_PROCESO' || 
        c.estado === 'VENTA_FINALIZADA' || 
        c.estado === 'CANCELADO'
      );
    }

    return filtered;;
  }

  marcarLeido(contacto: Contact): void {
    if (!contacto.id) return;
    contacto.leido = true;
    this.contactService.marcarComoLeido(contacto.id).subscribe({
      next: (contactoActualizado) => {
        contacto.estado = contactoActualizado.estado || 'EN_PROCESO';
        console.log('Contacto actualizado - Leído:', contacto.leido, 'Estado:', contacto.estado);
      },
      error: (err) => {
        console.error('Error marcando como leído:', err);
        contacto.leido = false;
      }
    });
  }

  marcarTodosLeidos(): void {
    this.contactos.forEach(contacto => {
      if (!contacto.leido) {
        this.marcarLeido(contacto);
      }
    });
  }

  cambiarEstadoDirecto(contacto: Contact, nuevoEstado: string): void {
    if (!contacto.id) return;
    
    this.contactService.actualizarEstado(contacto.id, nuevoEstado).subscribe({
      next: (contactoActualizado) => {
        contacto.estado = contactoActualizado.estado;
        console.log('Estado actualizado a:', nuevoEstado);
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);
      }
    });
  }

  verDetalles(contacto: Contact): void {
    this.selectedContact = contacto;
    this.showDetail = true;
    // Inicializar el estado actual para editar
    if (contacto.id) {
      this.newStatus[contacto.id] = contacto.estado || 'PENDIENTE';
    }
  }

  cerrarDetalles(): void {
    this.showDetail = false;
    this.selectedContact = null;
  }

  iniciarEdicionEstado(contacto: Contact): void {
    if (!contacto.id) return;
    this.editingStatus[contacto.id] = true;
    this.newStatus[contacto.id] = contacto.estado || 'PENDIENTE';
  }

  cancelarEdicionEstado(contactoId: number): void {
    this.editingStatus[contactoId] = false;
  }

  guardarNuevoEstado(contacto: Contact): void {
    if (!contacto.id) return;
    
    const nuevoEstado = this.newStatus[contacto.id];
    const estadoAnterior = contacto.estado || 'PENDIENTE';
    
    // Usar el nuevo endpoint que maneja stock automáticamente
    this.contactService.cambiarEstadoVenta(contacto.id, nuevoEstado, estadoAnterior).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        
        // Actualizar el estado del contacto
        contacto.estado = response.estadoNuevo;
        this.editingStatus[contacto.id!] = false;
        
        // Mostrar notificación del stock actualizado
        let mensaje = 'Estado actualizado exitosamente';
        if (response.nuevoStock !== null) {
          if (nuevoEstado === 'VENTA_FINALIZADA' && estadoAnterior !== 'VENTA_FINALIZADA') {
            mensaje += ` - Stock del auto disminuido a: ${response.nuevoStock} unidades`;
          } else if (nuevoEstado === 'CANCELADO' && estadoAnterior === 'VENTA_FINALIZADA') {
            mensaje += ` - Stock del auto recuperado a: ${response.nuevoStock} unidades`;
          }
        }
        
        alert(mensaje);
        
        // Recargar contactos para asegurar que los datos estén sincronizados
        this.cargarContactos();
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);
        alert('Error al actualizar el estado. Por favor, intenta de nuevo.');
      }
    });
  }

  eliminarContacto(id: number | undefined): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      this.contactService.eliminarContacto(id).subscribe({
        next: () => {
          this.cargarContactos();
          this.cerrarDetalles();
        },
        error: (err: any) => {
          console.error('Error al eliminar contacto:', err);
          alert('Error al eliminar el contacto');
        }
      });
    }
  }

  getEstadoBadgeClass(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge-warning';
      case 'EN_PROCESO':
        return 'badge-info';
      case 'VENTA_FINALIZADA':
        return 'badge-success';
      case 'CANCELADO':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getEstadoLabel(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'EN_PROCESO':
        return 'En Proceso';
      case 'VENTA_FINALIZADA':
        return 'Venta Finalizada';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  getImagenAuto(auto: Auto | undefined): string {
    if (!auto) return this.getPlaceholder();
    if (auto.imagenes && auto.imagenes.length > 0) {
      return auto.imagenes[0];
    }
    return this.getPlaceholder();
  }

  private getPlaceholder(): string {
    return 'https://via.placeholder.com/300x200?text=Sin+imagen';
  }
}

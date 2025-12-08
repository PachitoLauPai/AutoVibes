import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';

interface Contact {
  id?: number;
  nombre: string;
  correo: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  estado?: string;
  fechaCreacion?: Date;
  leido?: boolean;
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
  selectedStatus = 'todos';
  selectedContact: Contact | null = null;
  showDetail = false;

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
        c.correo.toLowerCase().includes(term) ||
        c.asunto.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus !== 'todos') {
      filtered = filtered.filter(c => c.estado === this.selectedStatus);
    }

    return filtered;
  }

  marcarLeido(contacto: Contact): void {
    if (!contacto.id) return;
    contacto.leido = true;
  }

  marcarTodosLeidos(): void {
    this.contactos.forEach(contacto => {
      contacto.leido = true;
    });
  }

  verDetalles(contacto: Contact): void {
    this.selectedContact = contacto;
    this.showDetail = true;
  }

  cerrarDetalles(): void {
    this.showDetail = false;
    this.selectedContact = null;
  }

  enviarRespuesta(contacto: Contact): void {
    if (!contacto.id) return;
    // Implementar lógica para enviar respuesta
    console.log('Enviando respuesta para contacto:', contacto);
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
}

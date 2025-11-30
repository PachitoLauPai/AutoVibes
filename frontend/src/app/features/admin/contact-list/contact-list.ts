import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-header">
      <h1>💬 Contactos Recibidos</h1>
      <div class="header-stats">
        <span class="stat">Total: 5</span>
        <span class="stat">Sin leer: 2</span>
      </div>
    </div>

    <div class="contacts-list">
      <div class="contact-item" *ngFor="let contact of [1,2,3,4,5]">
        <div class="contact-header">
          <h3>Contacto #{{ contact }}</h3>
          <span class="contact-date">Hace 2 horas</span>
        </div>
        <div class="contact-content">
          <p><strong>Nombre:</strong> Juan Pérez</p>
          <p><strong>Email:</strong> juan@example.com</p>
          <p><strong>Teléfono:</strong> +51 999 999 999</p>
          <p><strong>Asunto:</strong> Consulta sobre Toyota Corolla</p>
          <p><strong>Mensaje:</strong> Me interesa conocer más detalles sobre el auto, disponibilidad y formas de pago.</p>
        </div>
        <div class="contact-actions">
          <button (click)="marcarLeido(contact)" class="btn-sm btn-success">✓ Marcar como leído</button>
          <button (click)="enviarRespuesta(contact)" class="btn-sm btn-primary">↩️ Responder</button>
          <button (click)="eliminarContacto(contact)" class="btn-sm btn-delete">🗑️ Eliminar</button>
        </div>
      </div>

      <div class="empty-state" *ngIf="false">
        <p>No hay contactos</p>
      </div>
    </div>
  `,
  styles: [`
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .admin-header h1 {
      color: #333;
      margin: 0;
    }

    .header-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      background-color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-weight: 600;
      color: #333;
    }

    .contacts-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .contact-item {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #ff6600;
      transition: all 0.3s;
    }

    .contact-item:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .contact-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 1rem;
    }

    .contact-header h3 {
      color: #333;
      margin: 0;
    }

    .contact-date {
      color: #999;
      font-size: 0.9rem;
    }

    .contact-content {
      margin-bottom: 1rem;
    }

    .contact-content p {
      margin: 0.5rem 0;
      color: #666;
      line-height: 1.5;
    }

    .contact-content strong {
      color: #333;
    }

    .contact-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background-color: #5568d3;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover {
      background-color: #218838;
    }

    .btn-delete {
      background-color: #dc3545;
      color: white;
    }

    .btn-delete:hover {
      background-color: #c82333;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #999;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .admin-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .contact-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .contact-actions {
        flex-direction: column;
      }

      .btn-sm {
        width: 100%;
      }
    }
  `]
})
export class ContactListComponent implements OnInit {
  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.debug('ContactListComponent inicializado');
  }

  marcarLeido(id: number): void {
    this.logger.info('Marcando contacto como leído:', id);
  }

  enviarRespuesta(id: number): void {
    this.logger.info('Enviando respuesta para contacto:', id);
  }

  eliminarContacto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      this.logger.info('Eliminando contacto:', id);
    }
  }
}

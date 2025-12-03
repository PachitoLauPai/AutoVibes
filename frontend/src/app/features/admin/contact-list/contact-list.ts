import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css'
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

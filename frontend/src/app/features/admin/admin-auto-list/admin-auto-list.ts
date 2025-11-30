import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-admin-auto-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-header">
      <h1>🚗 Gestionar Autos</h1>
      <button (click)="agregarAuto()" class="btn-primary">
        ➕ Agregar Nuevo Auto
      </button>
    </div>

    <div class="auto-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let auto of [1,2,3]">
            <td>#{{ auto }}</td>
            <td>Toyota</td>
            <td>Corolla {{ auto }}</td>
            <td>$15,000</td>
            <td><span class="badge badge-success">Disponible</span></td>
            <td>
              <button (click)="editarAuto(auto)" class="btn-sm btn-edit">Editar</button>
              <button (click)="eliminarAuto(auto)" class="btn-sm btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
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

    .btn-primary {
      background-color: #ff6600;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      background-color: #ff5500;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
    }

    .auto-table {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background-color: #1a1a1a;
      color: white;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    tbody tr:hover {
      background-color: #f9f9f9;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .badge-success {
      background-color: #d4edda;
      color: #155724;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.85rem;
      cursor: pointer;
      margin-right: 0.5rem;
      transition: all 0.2s;
    }

    .btn-edit {
      background-color: #667eea;
      color: white;
    }

    .btn-edit:hover {
      background-color: #5568d3;
    }

    .btn-delete {
      background-color: #dc3545;
      color: white;
    }

    .btn-delete:hover {
      background-color: #c82333;
    }
  `]
})
export class AdminAutoListComponent implements OnInit {
  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.debug('AdminAutoListComponent inicializado');
  }

  agregarAuto(): void {
    this.logger.info('Navegando a formulario de nuevo auto');
    this.router.navigate(['/admin/autos/nuevo']);
  }

  editarAuto(id: number): void {
    this.logger.info('Editando auto:', id);
    this.router.navigate(['/admin/autos/editar', id]);
  }

  eliminarAuto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este auto?')) {
      this.logger.info('Eliminando auto:', id);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AutoService } from '../../../core/services/auto.service';
import { Auto } from '../../../core/models/auto.model';
import { Marca, CategoriaAuto } from '../../../core/models/shared.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  autos: Auto[] = [];
  autosFilterrados: Auto[] = [];  // ✅ CORRECTO (sin typo)

  // Filtros
  marcas: Marca[] = [];
  categorias: CategoriaAuto[] = [];

  filtroMarca: string = '';
  filtroCategoria: string = '';
  filtroModelo: string = '';

  loading = true;
  error = '';

  constructor(
    private autoService: AutoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarOpciones();
    this.cargarAutos();
  }

  cargarOpciones(): void {
    // Cargar marcas
    this.autoService.getMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas;
        console.log('✅ Marcas cargadas:', marcas);
      },
      error: (err) => console.error('Error cargando marcas:', err)
    });

    // Cargar categorías
    this.autoService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        console.log('✅ Categorías cargadas:', categorias);
      },
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }

  cargarAutos(): void {
    this.loading = true;
    this.error = '';
    
    this.autoService.getAutosDisponibles().subscribe({
      next: (autos) => {
        this.autos = autos;
        this.autosFilterrados = autos;  // ✅ CORRECTO
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los autos';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  buscar(): void {
    console.log('🔍 Buscando con filtros:', {
      marca: this.filtroMarca,
      categoria: this.filtroCategoria,
      modelo: this.filtroModelo
    });

    this.autosFilterrados = this.autos.filter(auto => {
      const coincideMarca = !this.filtroMarca || 
        auto.marca.id.toString() === this.filtroMarca;
      
      const coincideCategoria = !this.filtroCategoria || 
        auto.categoria.id.toString() === this.filtroCategoria;
      
      const coincideModelo = !this.filtroModelo || 
        auto.modelo.toLowerCase().includes(this.filtroModelo.toLowerCase());

      return coincideMarca && coincideCategoria && coincideModelo;
    });

    console.log('✅ Resultados encontrados:', this.autosFilterrados.length);
  }

  limpiarFiltros(): void {
    this.filtroMarca = '';
    this.filtroCategoria = '';
    this.filtroModelo = '';
    this.autosFilterrados = this.autos;
    console.log('🔄 Filtros limpiados');
  }

  verDetalles(autoId: number): void {
    this.router.navigate(['/autos', autoId]);
  }

  contactarVendedor(auto: Auto): void {
    this.router.navigate(['/autos', auto.id, 'contactar']);
  }
}
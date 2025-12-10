import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AutoService } from '../../../../core/services/auto.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VentaService } from '../../../../core/services/venta.service';
import { Auto } from '../../../../core/models/auto.model';
import { VentaResponse } from '../../../../core/models/venta.model';
import { Marca, CategoriaAuto, CondicionAuto, Combustible, Transmision } from '../../../../core/models/shared.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auto-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './auto-list.html',
  styleUrls: ['./auto-list.css']
})
export class AutoListComponent implements OnInit, OnDestroy {
  autos: Auto[] = [];
  autosFiltrados: Auto[] = [];
  ventasPorAuto: Map<number, VentaResponse[]> = new Map();
  loading: boolean = true;
  error: string = '';

  // Filtros
  marcas: Marca[] = [];
  categorias: CategoriaAuto[] = [];
  condiciones: CondicionAuto[] = [];
  combustibles: Combustible[] = [];
  transmisiones: Transmision[] = [];

  filtroCondicion: string = '';
  filtroMarca: string = '';
  filtroCategoria: string = '';
  filtroCombustible: string = '';
  filtroTransmision: string = '';
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;
  filtroAnioMin: number | null = null;
  filtroAnioMax: number | null = null;
  filtroKilometrajeMax: number | null = null;
  searchTerm: string = ''; // Término de búsqueda

  // Estado de filtros colapsables
  filtersOpen: any = {
    condicion: true,
    marca: true,
    precio: true,
    anio: true,
    kilometraje: true,
    transmision: true,
    categoria: true
  };

  currentImageIndex: Map<number, number> = new Map();
  private destroy$ = new Subject<void>();

  constructor(
    private autoService: AutoService,
    private ventaService: VentaService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.cargarOpciones();
    this.route.queryParams.subscribe(params => {
      if (params['condicion']) this.filtroCondicion = params['condicion'];
      if (params['marca']) this.filtroMarca = params['marca'];
      if (params['categoria']) this.filtroCategoria = params['categoria'];
      this.cargarAutos();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarOpciones(): void {
    this.autoService.getMarcas().pipe(takeUntil(this.destroy$)).subscribe({
      next: (marcas) => this.marcas = marcas,
      error: (err) => console.error('Error cargando marcas', err)
    });

    this.autoService.getCategorias().pipe(takeUntil(this.destroy$)).subscribe({
      next: (categorias) => this.categorias = categorias,
      error: (err) => console.error('Error cargando categorías', err)
    });

    this.autoService.getCondiciones().pipe(takeUntil(this.destroy$)).subscribe({
      next: (condiciones) => this.condiciones = condiciones,
      error: (err) => console.error('Error cargando condiciones', err)
    });

    this.autoService.getCombustibles().pipe(takeUntil(this.destroy$)).subscribe({
      next: (combustibles) => this.combustibles = combustibles,
      error: (err) => console.error('Error cargando combustibles', err)
    });

    this.autoService.getTransmisiones().pipe(takeUntil(this.destroy$)).subscribe({
      next: (transmisiones) => this.transmisiones = transmisiones,
      error: (err) => console.error('Error cargando transmisiones', err)
    });
  }

  cargarAutos(): void {
    this.loading = true;
    this.error = '';

    // Cargar solo autos disponibles para clientes
    this.autoService.getAutosDisponibles().pipe(takeUntil(this.destroy$)).subscribe({
      next: (autos: Auto[]) => {
        this.autos = autos;
        this.autosFiltrados = autos;
        this.aplicarFiltros();
        this.inicializarIndices();
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar los autos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  cargarVentasParaAutos(autos: Auto[]): void {
    // El backend no tiene /ventas/auto/{id}, por eso obtenemos todas y las agrupamos
    this.ventaService.getVentasAdmin().pipe(takeUntil(this.destroy$)).subscribe({
      next: (ventas: VentaResponse[]) => {
        this.ventasPorAuto.clear();
        ventas.forEach(v => {
          // VentaResponse devuelve autoId directamente
          const autoId = v.autoId ?? null;
          if (autoId == null) return;
          const arr = this.ventasPorAuto.get(Number(autoId)) || [];
          arr.push(v);
          this.ventasPorAuto.set(Number(autoId), arr);
        });
      },
      error: (err) => {
        // Error ya manejado por el interceptor
      }
    });
  }

  getUltimaVenta(auto: Auto): VentaResponse | null {
    const ventas = this.ventasPorAuto.get(auto.id);
    if (!ventas || ventas.length === 0) return null;

    return ventas.sort((a, b) =>
      new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
    )[0];
  }

  inicializarIndices(): void {
    this.autos.forEach(auto => {
      this.currentImageIndex.set(auto.id, 0);
    });
  }

  onImageError(event: any, auto: Auto): void {
    event.target.src = this.getDefaultImage(auto);
  }

  // ✅ CORREGIDO: Usar propiedades seguras con ?.
  getDefaultImage(auto: Auto): string {
    const marcaNombre = auto.marca?.nombre || 'Auto';
    return `https://via.placeholder.com/400x300/cccccc/666666?text=${marcaNombre}+${auto.modelo}`;
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  aplicarFiltros(): void {
    this.autosFiltrados = this.autos.filter(auto => {
      // Solo mostrar autos disponibles
      if (!auto.disponible) {
        return false;
      }

      // Filtro condición
      if (this.filtroCondicion && auto.condicion?.id.toString() !== this.filtroCondicion) {
        return false;
      }

      // Filtro marca
      if (this.filtroMarca && auto.marca?.id.toString() !== this.filtroMarca) {
        return false;
      }

      // Filtro categoría
      if (this.filtroCategoria && auto.categoria?.id.toString() !== this.filtroCategoria) {
        return false;
      }

      // Filtro combustible
      if (this.filtroCombustible && auto.combustible?.id.toString() !== this.filtroCombustible) {
        return false;
      }

      // Filtro transmisión
      if (this.filtroTransmision && auto.transmision?.id.toString() !== this.filtroTransmision) {
        return false;
      }

      // Filtro precio
      if (this.filtroPrecioMin && auto.precio < this.filtroPrecioMin) {
        return false;
      }
      if (this.filtroPrecioMax && auto.precio > this.filtroPrecioMax) {
        return false;
      }

      // Filtro año
      if (this.filtroAnioMin && auto.anio < this.filtroAnioMin) {
        return false;
      }
      if (this.filtroAnioMax && auto.anio > this.filtroAnioMax) {
        return false;
      }

      // Filtro kilometraje
      if (this.filtroKilometrajeMax && (auto.kilometraje || 0) > this.filtroKilometrajeMax) {
        return false;
      }

      // Filtro de búsqueda textual (searchTerm)
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase().trim();
        const marca = auto.marca?.nombre?.toLowerCase() || '';
        const modelo = auto.modelo?.toLowerCase() || '';
        const color = auto.color?.toLowerCase() || '';

        // Coincidencia en marca, modelo o color
        if (!marca.includes(term) && !modelo.includes(term) && !color.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroCondicion = '';
    this.filtroMarca = '';
    this.filtroCategoria = '';
    this.filtroCombustible = '';
    this.filtroTransmision = '';
    this.filtroPrecioMin = null;
    this.filtroPrecioMax = null;
    this.filtroAnioMin = null;
    this.filtroAnioMax = null;
    this.filtroKilometrajeMax = null;
    this.aplicarFiltros();
  }

  esNuevo(auto: Auto): boolean {
    return auto.condicion?.nombre === 'NUEVO';
  }

  // Métodos para toggle de filtros
  toggleFilter(filterName: string): void {
    this.filtersOpen[filterName] = !this.filtersOpen[filterName];
  }

  toggleCondicion(id: number): void {
    this.filtroCondicion = this.filtroCondicion === id.toString() ? '' : id.toString();
    this.aplicarFiltros();
  }

  toggleMarca(id: number): void {
    this.filtroMarca = this.filtroMarca === id.toString() ? '' : id.toString();
    this.aplicarFiltros();
  }

  toggleCategoria(id: number): void {
    this.filtroCategoria = this.filtroCategoria === id.toString() ? '' : id.toString();
    this.aplicarFiltros();
  }

  toggleTransmision(id: number): void {
    this.filtroTransmision = this.filtroTransmision === id.toString() ? '' : id.toString();
    this.aplicarFiltros();
  }

  setPrecioRange(min: number, max: number | null): void {
    this.filtroPrecioMin = min;
    this.filtroPrecioMax = max;
    this.aplicarFiltros();
  }

  setAnioRange(min: number, max: number): void {
    this.filtroAnioMin = min;
    this.filtroAnioMax = max;
    this.aplicarFiltros();
  }

  setKilometrajeMax(max: number | null): void {
    this.filtroKilometrajeMax = max;
    this.aplicarFiltros();
  }

  // Métodos para contadores
  getCountByCondicion(condicionId: number): number {
    return this.autos.filter(a => a.condicion?.id === condicionId && a.disponible).length;
  }

  getCountByMarca(marcaId: number): number {
    return this.autos.filter(a => a.marca?.id === marcaId && a.disponible).length;
  }

  getCountByCategoria(categoriaId: number): number {
    return this.autos.filter(a => a.categoria?.id === categoriaId && a.disponible).length;
  }

  getCountByTransmision(transmisionId: number): number {
    return this.autos.filter(a => a.transmision?.id === transmisionId && a.disponible).length;
  }

  getCountByPrecio(min: number, max: number | null): number {
    return this.autos.filter(a => {
      if (!a.disponible) return false;
      if (a.precio < min) return false;
      if (max !== null && a.precio > max) return false;
      return true;
    }).length;
  }

  getCountByAnio(min: number, max: number): number {
    return this.autos.filter(a => a.disponible && a.anio >= min && a.anio <= max).length;
  }

  getCountByKilometraje(min: number, max: number | null): number {
    return this.autos.filter(a => {
      if (!a.disponible) return false;
      const km = a.kilometraje || 0;
      if (km < min) return false;
      if (max !== null && km > max) return false;
      return true;
    }).length;
  }

  // Métodos para carrusel de imágenes
  getCurrentImage(auto: Auto): string {
    if (!auto.imagenes || auto.imagenes.length === 0) {
      return this.getDefaultImage(auto);
    }
    const index = this.currentImageIndex.get(auto.id) || 0;
    return auto.imagenes[index];
  }

  prevImage(auto: Auto, event?: Event): void {
    if (event) event.stopPropagation();
    if (!auto.imagenes || auto.imagenes.length === 0) return;
    const currentIndex = this.currentImageIndex.get(auto.id) || 0;
    const prevIndex = currentIndex === 0 ? auto.imagenes.length - 1 : currentIndex - 1;
    this.currentImageIndex.set(auto.id, prevIndex);
  }

  nextImage(auto: Auto, event?: Event): void {
    if (event) event.stopPropagation();
    if (!auto.imagenes || auto.imagenes.length === 0) return;
    const currentIndex = this.currentImageIndex.get(auto.id) || 0;
    const nextIndex = (currentIndex + 1) % auto.imagenes.length;
    this.currentImageIndex.set(auto.id, nextIndex);
  }

  // Método para obtener imagen de categoría
  getCategoryImage(categoriaNombre: string): string {
    // Mapeo de nombres de categoría (en mayúsculas como vienen de la BD) a archivos PNG
    const imageMap: { [key: string]: string } = {
      'SEDAN': '/categorias/sedan.png',
      'CAMIONETA': '/categorias/camioneta.png',
      'HATCHBACK': '/categorias/hatchback.png',
      'PICKUP': '/categorias/pick-up.png',  // El archivo tiene guión
      'VAN': '/categorias/vans.png',        // El archivo es plural
      'DEPORTIVO': '/categorias/deportivo.png'
    };

    const imagePath = imageMap[categoriaNombre] || '/categorias/default.png';
    console.log('Categoría:', categoriaNombre, '-> Imagen:', imagePath);
    return imagePath;
  }

  onCategoryImageError(event: any, categoriaNombre: string): void {
    // Si falla la imagen, usar emoji como fallback
    console.error('Error cargando imagen de categoría:', categoriaNombre, 'Ruta intentada:', event.target.src);
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    if (parent) {
      const emojiMap: { [key: string]: string } = {
        'SEDAN': '🚗',
        'CAMIONETA': '🚙',
        'HATCHBACK': '🚐',
        'PICKUP': '🚚',
        'VAN': '🚐',
        'DEPORTIVO': '🏎️'
      };
      const emoji = emojiMap[categoriaNombre] || '🚗';
      parent.innerHTML = `<span style="font-size: 2rem;">${emoji}</span>`;
    }
  }
}
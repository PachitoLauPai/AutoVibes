import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutoService } from '../../../../core/services/auto.service';
import { Auto } from '../../../../core/models/auto.model';
import { Marca, CategoriaAuto, Combustible, Transmision, CondicionAuto } from '../../../../core/models/shared.model';

@Component({
  selector: 'app-admin-auto-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-auto-list.html',
  styleUrl: './admin-auto-list.css'
})
export class AdminAutoListComponent implements OnInit {
  autos: Auto[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  selectedFilter = 'todos';

  // Modal properties
  showModal = false;
  modalMode: 'crear' | 'editar' | 'detalles' = 'crear';
  selectedAuto: Auto | null = null;
  autoForm!: FormGroup;
  marcas: Marca[] = [];
  categorias: CategoriaAuto[] = [];
  combustibles: Combustible[] = [];
  transmisiones: Transmision[] = [];
  condiciones: CondicionAuto[] = [];
  submitting = false;

  constructor(
    private router: Router,
    private autoService: AutoService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.cargarAutos();
    this.cargarCatalogos();
  }

  private initForm(): void {
    this.autoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anio: ['', Validators.required],
      precio: ['', Validators.required],
      color: ['', Validators.required],
      kilometraje: ['', Validators.required],
      categoria: ['', Validators.required],
      combustible: ['', Validators.required],
      transmision: ['', Validators.required],
      condicion: ['', Validators.required],
      descripcion: ['', Validators.required],
      disponible: [true],
      imagenes: [[]]
    });
  }

  cargarCatalogos(): void {
    this.autoService.getMarcas().subscribe(marcas => this.marcas = marcas);
    this.autoService.getCategorias().subscribe(categorias => this.categorias = categorias);
    this.autoService.getCombustibles().subscribe(combustibles => this.combustibles = combustibles);
    this.autoService.getTransmisiones().subscribe(transmisiones => this.transmisiones = transmisiones);
  }

  cargarAutos(): void {
    this.loading = true;
    this.error = '';
    
    this.autoService.getTodosLosAutos().subscribe({
      next: (autos: Auto[]) => {
        this.autos = autos;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los autos. Por favor, intenta más tarde.';
        this.loading = false;
        console.error('Error cargando autos:', err);
      }
    });
  }

  get autosDisponibles(): number {
    return this.autos.filter(auto => auto.disponible).length;
  }

  get autosNoDisponibles(): number {
    return this.autos.filter(auto => !auto.disponible).length;
  }

  get autosFilterados(): Auto[] {
    let filtered = this.autos;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(auto => 
        (auto.marca?.nombre?.toLowerCase().includes(term) || false) ||
        auto.modelo?.toLowerCase().includes(term) ||
        auto.color?.toLowerCase().includes(term)
      );
    }

    if (this.selectedFilter === 'disponibles') {
      filtered = filtered.filter(auto => auto.disponible);
    } else if (this.selectedFilter === 'noDisponibles') {
      filtered = filtered.filter(auto => !auto.disponible);
    }

    return filtered;
  }

  // Modal Methods
  abrirCrearAuto(): void {
    this.modalMode = 'crear';
    this.selectedAuto = null;
    this.initForm();
    this.showModal = true;
  }

  abrirEditarAuto(auto: Auto): void {
    this.modalMode = 'editar';
    this.selectedAuto = auto;
    this.cargarAutoEnForm(auto);
    this.showModal = true;
  }

  abrirDetalles(auto: Auto): void {
    this.modalMode = 'detalles';
    this.selectedAuto = auto;
    this.cargarAutoEnForm(auto);
    this.showModal = true;
  }

  private cargarAutoEnForm(auto: Auto): void {
    this.autoForm.patchValue({
      marca: auto.marca?.id,
      modelo: auto.modelo,
      anio: auto.anio,
      precio: auto.precio,
      color: auto.color,
      kilometraje: auto.kilometraje,
      categoria: auto.categoria?.id,
      combustible: auto.combustible?.id,
      transmision: auto.transmision?.id,
      condicion: auto.condicion?.id,
      descripcion: auto.descripcion,
      disponible: auto.disponible,
      imagenes: auto.imagenes || []
    });
  }

  guardarAuto(): void {
    if (this.autoForm.invalid) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.submitting = true;
    const formData = this.autoForm.value;

    // Asegurar que todos los valores sean enviados correctamente
    const autoRequest = {
      marcaId: formData.marca ? Number(formData.marca) : undefined,
      modelo: formData.modelo?.trim() || undefined,
      anio: formData.anio ? Number(formData.anio) : undefined,
      precio: formData.precio ? Number(formData.precio) : undefined,
      color: formData.color?.trim() || undefined,
      kilometraje: formData.kilometraje ? Number(formData.kilometraje) : 0,
      categoriaId: formData.categoria ? Number(formData.categoria) : undefined,
      combustibleId: formData.combustible ? Number(formData.combustible) : undefined,
      transmisionId: formData.transmision ? Number(formData.transmision) : undefined,
      condicionId: formData.condicion ? Number(formData.condicion) : undefined,
      descripcion: formData.descripcion?.trim() || undefined,
      disponible: !!formData.disponible, // Asegurar que sea boolean
      imagenes: Array.isArray(formData.imagenes) ? formData.imagenes : []
    };

    console.log('Datos a enviar:', autoRequest); // Debug

    if (this.modalMode === 'crear') {
      this.autoService.crearAuto(autoRequest).subscribe({
        next: (response) => {
          console.log('Auto creado:', response);
          alert('Auto creado exitosamente');
          this.cargarAutos();
          this.cerrarModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear el auto: ' + (err?.error?.message || err?.message || ''));
          this.submitting = false;
        }
      });
    } else if (this.modalMode === 'editar' && this.selectedAuto?.id) {
      this.autoService.actualizarAuto(this.selectedAuto.id, autoRequest).subscribe({
        next: (response) => {
          console.log('Auto actualizado:', response);
          alert('Auto actualizado exitosamente');
          // Esperar un poco para que la BD se actualice
          setTimeout(() => {
            this.cargarAutos();
            this.cerrarModal();
          }, 300);
          this.submitting = false;
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el auto: ' + (err?.error?.message || err?.message || ''));
          this.submitting = false;
        }
      });
    }
  }

  // Manejo de imágenes
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          const imageUrl = e.target.result as string;
          const currentImages = this.autoForm.get('imagenes')?.value || [];
          
          // Limitar a 5 imágenes
          if (currentImages.length < 5) {
            currentImages.push(imageUrl);
            this.autoForm.patchValue({ imagenes: currentImages });
          } else {
            alert('Máximo 5 imágenes por auto');
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    const currentImages = this.autoForm.get('imagenes')?.value || [];
    currentImages.splice(index, 1);
    this.autoForm.patchValue({ imagenes: currentImages });
  }

  addImageFromUrl(url: string): void {
    if (!url || !url.trim()) {
      alert('Por favor ingresa una URL válida');
      return;
    }

    // Validar que sea una URL
    try {
      new URL(url);
    } catch {
      alert('URL no válida. Asegúrate que comience con http:// o https://');
      return;
    }

    const currentImages = this.autoForm.get('imagenes')?.value || [];

    // Limitar a 5 imágenes
    if (currentImages.length < 5) {
      currentImages.push(url);
      this.autoForm.patchValue({ imagenes: currentImages });
    } else {
      alert('Máximo 5 imágenes por auto');
    }
  }

  eliminarAuto(auto: Auto): void {
    if (!auto.id) return;
    if (confirm(`¿Estás seguro de que deseas eliminar ${auto.marca?.nombre} ${auto.modelo}?`)) {
      this.submitting = true;
      this.autoService.eliminarAuto(auto.id).subscribe({
        next: () => {
          alert('Auto eliminado exitosamente');
          this.cargarAutos();
          this.submitting = false;
        },
        error: (err: any) => {
          console.error('Error al eliminar auto:', err);
          alert('Error al eliminar el auto: ' + (err?.error?.message || err?.message || 'Error desconocido'));
          this.submitting = false;
        }
      });
    }
  }

  cerrarModal(): void {
    this.showModal = false;
    this.selectedAuto = null;
    this.submitting = false;
    this.initForm();
  }

  get isFormDisabled(): boolean {
    return this.modalMode === 'detalles';
  }
}

import { 
  Marca, 
  Combustible, 
  Transmision, 
  CategoriaAuto, 
  CondicionAuto,
  Concesionario
} from './shared.model';

// ✅ Exporta la interfaz Auto
export interface Auto {
  id: number;
  marca: Marca;
  modelo: string;
  anio: number;
  precio: number;
  color: string;
  kilometraje: number;
  stock: number;  // Stock disponible (solo visible en admin)
  combustible: Combustible;
  transmision: Transmision;
  categoria: CategoriaAuto;
  condicion: CondicionAuto;
  concesionario?: Concesionario;
  descripcion: string;
  disponible: boolean;
  imagenes: string[];
  fechaCreacion?: string;
  fechaActualizacion?: string;
}
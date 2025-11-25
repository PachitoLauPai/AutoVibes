import { 
  Marca, 
  Combustible, 
  Transmision, 
  CategoriaAuto, 
  CondicionAuto 
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
  combustible: Combustible;
  transmision: Transmision;
  categoria: CategoriaAuto;
  condicion: CondicionAuto;
  descripcion: string;
  disponible: boolean;
  imagenes: string[];
  fechaCreacion?: string;
  fechaActualizacion?: string;
}
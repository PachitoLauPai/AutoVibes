export interface AutoRequest {
  marcaId?: number;
  modelo?: string;
  anio?: number;
  precio?: number;
  color?: string;
  kilometraje?: number;
  combustibleId?: number;
  transmisionId?: number;
  categoriaId?: number;
  condicionId?: number;
  descripcion?: string;
  disponible?: boolean;
  imagenes?: string[];
}
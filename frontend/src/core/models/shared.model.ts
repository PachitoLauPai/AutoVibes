export interface BaseEntity {
  id: number;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

export interface Rol extends BaseEntity {}

export interface Marca extends BaseEntity {
  fechaCreacion?: string;
}

export interface Combustible extends BaseEntity {}

export interface Transmision extends BaseEntity {}

export interface CategoriaAuto extends BaseEntity {}

export interface CondicionAuto extends BaseEntity {}

export interface EstadoVenta extends BaseEntity {}
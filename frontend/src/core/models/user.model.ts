import { Rol } from './shared.model';

export interface Usuario {
  id: number;
  email: string;
  password?: string;
  nombre: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  rol: Rol;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export type User = Usuario;

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  rolId?: number;
}
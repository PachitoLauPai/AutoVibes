import { Rol } from './shared.model';

export interface Usuario {
  id: number;
  email: string;
  password?: string;
  nombre: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  rol: Rol;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface Administrador extends Usuario {
  dni: string;
  correo: string;
}

export interface Cliente extends Usuario {
  dni: string;
  telefono: string;
  direccion: string;
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
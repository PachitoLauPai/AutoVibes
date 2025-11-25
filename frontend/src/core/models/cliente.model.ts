import { Usuario } from './user.model';

export interface Cliente {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  direccion: string;
  usuario?: Usuario; // ✅ Relación OneToOne (opcional en frontend)
}

// Para crear un nuevo cliente
export interface CreateClienteData {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  direccion: string;
  usuarioId?: number; // ID del usuario asociado
}

// Para formularios de registro que crean usuario y cliente juntos
export interface RegisterClienteData {
  // Datos de usuario
  email: string;
  password: string;
  nombre: string; // Nombre completo para el usuario
  
  // Datos específicos de cliente
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  direccion: string;
}
export interface VentaResponse {
  id: number;

  // Datos del cliente
  clienteNombre: string;
  clienteApellidos: string;
  clienteDni: string;
  clienteTelefono: string;
  clienteDireccion: string;

  // Datos del auto
  autoId: number;
  autoMarca: string;     // Nombre de marca
  marcaId: number;       // ID de marca
  autoModelo: string;
  autoAnio: number;
  autoPrecio: number;

  // Datos adicionales del auto
  autoColor: string;
  autoKilometraje: number;
  autoCombustible: string;
  autoTransmision: string;
  autoCategoria: string;
  autoCondicion: string;

  // ✅ NUEVO: Imágenes del auto
  autoImagenes?: string[];

  // Info venta
  estado: string;
  fechaSolicitud: string;
  fechaActualizacion: string;
}

export interface CreateVentaData {
  clienteId: number;
  autoId: number;
  estadoId: number;
}

export interface UpdateVentaData {
  estadoId?: number;
}

export interface ContactRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  direccion: string;
  autoId: number;
}

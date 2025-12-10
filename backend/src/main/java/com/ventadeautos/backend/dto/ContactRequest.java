package com.ventadeautos.backend.dto;

import lombok.Data;

@Data
public class ContactRequest {
    private String nombre;
    private String dni;
    private String email;
    private String telefono;
    private String asunto;
    private String mensaje;
    private Long autoId;  // Opcional - si es consulta sobre un auto específico
    private String estado;  // Nuevo: para cambios de estado por admin (PENDIENTE, EN_PROCESO, VENTA_FINALIZADA, CANCELADO)
    private String tipoTransaccion;  
}

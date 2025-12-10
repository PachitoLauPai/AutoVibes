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
    private Long autoId;  
    private String estado;  
    private String tipoTransaccion;  
}

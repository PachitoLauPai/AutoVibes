package com.ventadeautos.backend.dto;

import lombok.Data;

@Data
public class ContactRequest {
    private String nombres;
    private String apellidos;
    private String dni;
    private String telefono;
    private String direccion;
    private Long autoId;
}
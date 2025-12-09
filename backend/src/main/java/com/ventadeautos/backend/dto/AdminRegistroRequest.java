package com.ventadeautos.backend.dto;

import lombok.Data;

@Data
public class AdminRegistroRequest {
    private String nombre;
    private String apellido;
    private String dni;
    private String correo;
    private String password;
    private Long rolId; // ID del rol (generalmente será el rol ADMIN)
}

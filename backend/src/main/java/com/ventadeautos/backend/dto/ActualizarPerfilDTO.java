package com.ventadeautos.backend.dto;

import lombok.Data;

@Data
public class ActualizarPerfilDTO {
    private String nombre;
    private String email;
    private String apellidos;
    private String dni;
    private String telefono;
    private String direccion;
}

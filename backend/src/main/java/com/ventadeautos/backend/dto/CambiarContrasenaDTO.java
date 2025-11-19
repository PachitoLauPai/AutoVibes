package com.ventadeautos.backend.dto;

import lombok.Data;

@Data
public class CambiarContrasenaDTO {
    private String contrasenaActual;
    private String contrasenaNew;
    private String confirmarContrasena;
}

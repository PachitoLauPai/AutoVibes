package com.ventadeautos.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UsuarioDTO {
    private Long id;
    private String email;
    private String password;
    private String nombre;
    private String apellidos;
    private String dni;
    private String telefono;
    private String direccion;
    private RolDTO rol;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    @Data
    public static class RolDTO {
        private Long id;
        private String nombre;
        private String descripcion;
        private Boolean activa;
    }
}
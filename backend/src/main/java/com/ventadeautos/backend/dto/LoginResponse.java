package com.ventadeautos.backend.dto;

import com.ventadeautos.backend.model.Rol;
import lombok.Data;

@Data
public class LoginResponse {
    private Long id;
    private String email;
    private String nombre;
    private String apellido;
    private Rol rol;
    private String mensaje;
    private String token;  
}

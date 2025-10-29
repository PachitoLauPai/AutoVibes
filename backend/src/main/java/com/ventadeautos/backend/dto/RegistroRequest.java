package com.ventadeautos.backend.dto;

import com.ventadeautos.backend.model.Rol;
import lombok.Data;

@Data
public class RegistroRequest {
    private String email;
    private String password;
    private String nombre;
    private Rol rol = Rol.CLIENTE;
}
// AuthController.java
package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.LoginRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.dto.RegistroRequest;
import com.ventadeautos.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UsuarioService usuarioService;
    
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return usuarioService.login(request);
    }
    
    @PostMapping("/registro")
    public LoginResponse registrar(@RequestBody RegistroRequest request) {
        return usuarioService.registrar(request);
    }
}
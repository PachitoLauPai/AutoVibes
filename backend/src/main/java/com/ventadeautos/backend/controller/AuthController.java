// AuthController.java
package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.LoginRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    private final UsuarioService usuarioService;
    
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return usuarioService.loginAdmin(request);
    }
    
    // ✅ NUEVO: Alias para que el frontend pueda hacer login de admin
    @PostMapping("/admin/login")
    public LoginResponse adminLogin(@RequestBody LoginRequest request) {
        return usuarioService.loginAdmin(request);
    }
}
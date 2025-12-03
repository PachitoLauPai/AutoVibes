package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.LoginRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.model.Administrador;
import com.ventadeautos.backend.repository.AdministradorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdministradorService {
    
    private final AdministradorRepository administradorRepository;
    
    /**
     * Login de administrador
     */
    public LoginResponse loginAdmin(LoginRequest request) {
        log.info("Intentando login de admin: {}", request.getEmail());
        
        Optional<Administrador> adminOpt = administradorRepository.findByCorreo(request.getEmail());
        
        if (!adminOpt.isPresent()) {
            log.warn("Administrador no encontrado: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("Credenciales inválidas");
            return response;
        }
        
        Administrador admin = adminOpt.get();
        
        // Verificar que esté activo
        if (!admin.getActivo()) {
            log.warn("Administrador inactivo: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("Tu cuenta ha sido desactivada");
            return response;
        }
        
        // Verificar contraseña
        if (!admin.getPassword().equals(request.getPassword())) {
            log.warn("Contraseña incorrecta para admin: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("Credenciales inválidas");
            return response;
        }
        
        // Login exitoso
        log.info("Login de admin exitoso: {}", request.getEmail());
        LoginResponse response = new LoginResponse();
        response.setId(admin.getId());
        response.setEmail(admin.getCorreo());
        response.setNombre(admin.getNombre());
        response.setApellido(admin.getApellido());
        response.setRol(admin.getRol());
        response.setMensaje("Login de administrador exitoso");
        
        // Generar token simple
        String token = generateSimpleToken(admin.getId(), admin.getCorreo());
        response.setToken(token);
        
        return response;
    }
    
    /**
     * Generar un token simple
     */
    private String generateSimpleToken(Long id, String email) {
        return "token_" + id + "_" + System.currentTimeMillis();
    }
    
    /**
     * Obtener administrador por correo
     */
    public Optional<Administrador> obtenerPorCorreo(String correo) {
        return administradorRepository.findByCorreo(correo);
    }
    
    /**
     * Obtener administrador por ID
     */
    public Optional<Administrador> obtenerPorId(Long id) {
        return administradorRepository.findById(id);
    }
}

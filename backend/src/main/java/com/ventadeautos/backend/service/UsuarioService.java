package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.LoginRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.model.Rol;
import com.ventadeautos.backend.repository.UsuarioRepository;
import com.ventadeautos.backend.repository.RolRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    
    /**
     * Login genérico para usuarios (admin o cliente)
     */
    public LoginResponse login(LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
        
        if (usuarioOpt.isPresent() && 
            usuarioOpt.get().getPassword().equals(request.getPassword())) {
            
            Usuario usuario = usuarioOpt.get();
            LoginResponse response = new LoginResponse();
            response.setId(usuario.getId());
            response.setEmail(usuario.getEmail());
            response.setNombre(usuario.getNombre());
            response.setRol(usuario.getRol());
            response.setMensaje("Login exitoso");
            return response;
        }
        
        LoginResponse response = new LoginResponse();
        response.setMensaje("Credenciales inválidas");
        return response;
    }
    
    /**
     * Login específico para administradores
     */
    public LoginResponse loginAdmin(LoginRequest request) {
        log.info("Intentando login de admin: {}", request.getEmail());
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
        
        if (!usuarioOpt.isPresent()) {
            log.warn("Usuario no encontrado: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("Credenciales inválidas");
            return response;
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verificar que sea admin
        if (!usuario.getRol().getNombre().equals("ADMIN")) {
            log.warn("Intento de login admin desde usuario no-admin: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("No tienes permisos de administrador");
            return response;
        }
        
        // Verificar contraseña
        if (!usuario.getPassword().equals(request.getPassword())) {
            log.warn("Contraseña incorrecta para admin: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("Credenciales inválidas");
            return response;
        }
        
        // Login exitoso
        log.info("Login de admin exitoso: {}", request.getEmail());
        LoginResponse response = new LoginResponse();
        response.setId(usuario.getId());
        response.setEmail(usuario.getEmail());
        response.setNombre(usuario.getNombre());
        response.setRol(usuario.getRol());
        response.setMensaje("Login de administrador exitoso");
        
        // Generar token simple
        String token = generateSimpleToken(usuario.getId(), usuario.getEmail());
        response.setToken(token);
        
        return response;
    }
    
    /**
     * Generar un token simple
     */
    private String generateSimpleToken(Long userId, String email) {
        long timestamp = System.currentTimeMillis();
        return userId + "_" + email + "_" + timestamp + "_ADMIN";
    }
    
    /**
     * Obtener usuario por ID
     */
    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }
    
    /**
     * Obtener usuario por email
     */
    public Optional<Usuario> obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
}
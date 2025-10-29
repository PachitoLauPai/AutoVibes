package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final UsuarioRepository usuarioRepository;
    
    public Usuario getUsuarioAutenticado(HttpServletRequest request) {
        System.out.println("🔐 [AUTH] Iniciando autenticación...");
        String authHeader = request.getHeader("Authorization");
        System.out.println("🔐 [AUTH] Header recibido: " + (authHeader != null ? "PRESENTE" : "NULO"));
        
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            try {
                String base64Credentials = authHeader.substring(6);
                String credentials = new String(Base64.getDecoder().decode(base64Credentials));
                final String[] values = credentials.split(":", 2);
                
                String email = values[0];
                System.out.println("🔐 [AUTH] Email extraído: " + email);
                
                Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
                
                if (usuarioOpt.isPresent()) {
                    System.out.println("✅ [AUTH] Usuario encontrado: " + email);
                    return usuarioOpt.get();
                } else {
                    System.out.println("❌ [AUTH] Usuario NO encontrado: " + email);
                    throw new RuntimeException("Usuario no encontrado: " + email);
                }
                
            } catch (Exception e) {
                System.out.println("❌ [AUTH] Error en decodificación: " + e.getMessage());
                throw new RuntimeException("Error en autenticación: " + e.getMessage());
            }
        }
        
        System.out.println("❌ [AUTH] Header Authorization faltante o inválido");
        throw new RuntimeException("Se requiere autenticación Basic");
    }
}
package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.model.Rol;
import com.ventadeautos.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final UsuarioRepository usuarioRepository;
    
    public Usuario getUsuarioAutenticado(HttpServletRequest request) {
        System.out.println("🔓 [AUTH] Modo sin autenticación - Retornando usuario por defecto");
        
        // ✅ SIMPLEMENTE RETORNAMOS UN USUARIO SIN VERIFICAR NADA
        try {
            // Buscar el usuario admin primero
            Optional<Usuario> usuarioAdmin = usuarioRepository.findByEmail("admin@test.com");
            if (usuarioAdmin.isPresent()) {
                System.out.println("✅ [AUTH] Retornando admin@test.com");
                return usuarioAdmin.get();
            }
            
            // Si no existe, buscar cualquier usuario
            Optional<Usuario> cualquierUsuario = usuarioRepository.findById(1L);
            if (cualquierUsuario.isPresent()) {
                System.out.println("✅ [AUTH] Retornando usuario ID: 1");
                return cualquierUsuario.get();
            }
            
            // Si no hay usuarios en la BD, crear uno mock
            System.out.println("⚠️ [AUTH] Creando usuario mock temporal");
            Usuario usuarioMock = new Usuario();
            usuarioMock.setId(1L);
            usuarioMock.setEmail("usuario@test.com");
            usuarioMock.setNombre("Usuario Temporal");
            usuarioMock.setRol(Rol.CLIENTE);
            
            return usuarioMock;
            
        } catch (Exception e) {
            System.out.println("❌ [AUTH] Error: " + e.getMessage());
            
            // Fallback absoluto
            Usuario usuarioFallback = new Usuario();
            usuarioFallback.setId(1L);
            usuarioFallback.setEmail("fallback@test.com");
            usuarioFallback.setRol(Rol.CLIENTE);
            return usuarioFallback;
        }
    }
}
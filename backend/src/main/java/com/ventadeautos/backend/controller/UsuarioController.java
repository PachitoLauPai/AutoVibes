package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.model.Rol;
import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.service.AuthenticationService;
import com.ventadeautos.backend.service.UsuarioService;
import com.ventadeautos.backend.service.VentaService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {
    
    private final UsuarioService usuarioService;
    //private final AuthenticationService authenticationService;// COMENTA ESTA LÍNEA 
    
    @GetMapping
    public ResponseEntity<?> obtenerTodosLosUsuarios(HttpServletRequest request) {
        try {
            // ✅ TEMPORAL: PERMITIR SIN AUTENTICACIÓN
            // Usuario usuario = authenticationService.getUsuarioAutenticado(request);
            
            // TEMPORAL: Comentar verificación de admin
            // if (usuario.getRol() != Rol.ADMIN) {
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN)
            //         .body("Solo administradores pueden ver todos los usuarios");
            // }
            
            List<Usuario> usuarios = usuarioService.obtenerTodosLosUsuarios();
            return ResponseEntity.ok(usuarios);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Error de autenticación: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id, HttpServletRequest request) {
        try {
            // ✅ TEMPORAL: PERMITIR SIN AUTENTICACIÓN
            // Usuario usuario = authenticationService.getUsuarioAutenticado(request);
            
            // TEMPORAL: Comentar verificación de admin
            // if (usuario.getRol() != Rol.ADMIN) {
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN)
            //         .body("Solo administradores pueden eliminar usuarios");
            // }

            boolean eliminado = usuarioService.eliminarUsuario(id);
            if (eliminado) {
                return ResponseEntity.ok().body(Map.of(
                    "mensaje", "Usuario eliminado correctamente",
                    "eliminado", true
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "mensaje", "Usuario no encontrado",
                    "eliminado", false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "mensaje", "Error al eliminar usuario: " + e.getMessage(),
                "eliminado", false
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioActualizado, HttpServletRequest request) {
        try {
            // ✅ TEMPORAL: PERMITIR SIN AUTENTICACIÓN
            // Usuario usuarioAutenticado = authenticationService.getUsuarioAutenticado(request);
            
            // TEMPORAL: Comentar verificación de permisos
            // if (usuarioAutenticado.getRol() != Rol.ADMIN && !usuarioAutenticado.getId().equals(id)) {
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN)
            //         .body("No puedes editar otros usuarios");
            // }

            Usuario usuarioEditado = usuarioService.actualizarUsuario(id, usuarioActualizado);
            return ResponseEntity.ok(usuarioEditado);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar usuario: " + e.getMessage());
        }
    }
}
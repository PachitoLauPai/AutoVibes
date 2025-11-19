package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.UsuarioDTO;
import com.ventadeautos.backend.dto.ActualizarEstadoUsuarioDTO;
import com.ventadeautos.backend.dto.RegistroRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.dto.CambiarContrasenaDTO;
import com.ventadeautos.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {
    
    private final UsuarioService usuarioService;
    
    // ✅ CREAR USUARIO - MÉTODO POST CORREGIDO
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, Object> usuarioData) {
        try {
            System.out.println("🔍 Creando nuevo usuario: " + usuarioData.get("email"));
            System.out.println("📝 Datos recibidos: " + usuarioData);
            
            // Extraer datos del Map
            String email = (String) usuarioData.get("email");
            String password = (String) usuarioData.get("password");
            String nombre = (String) usuarioData.get("nombre");
            String apellidos = (String) usuarioData.get("apellidos");
            String dni = (String) usuarioData.get("dni");
            String telefono = (String) usuarioData.get("telefono");
            String direccion = (String) usuarioData.get("direccion");
            Boolean activo = usuarioData.get("activo") != null ? (Boolean) usuarioData.get("activo") : true;
            
            // Validar campos obligatorios
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "El email es obligatorio"));
            }
            if (nombre == null || nombre.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "El nombre es obligatorio"));
            }
            
            // Usar el método registrar existente
            RegistroRequest registroRequest = new RegistroRequest();
            registroRequest.setEmail(email);
            registroRequest.setPassword(password != null ? password : "cliente123");
            registroRequest.setNombre(nombre);
            
            LoginResponse response = usuarioService.registrar(registroRequest);
            
            if ("Usuario registrado exitosamente".equals(response.getMensaje())) {
                // Si el usuario se creó exitosamente, actualizar los datos adicionales
                if (apellidos != null || dni != null || telefono != null || direccion != null) {
                    
                    // Crear DTO para actualización
                    UsuarioDTO updateDTO = new UsuarioDTO();
                    updateDTO.setApellidos(apellidos);
                    updateDTO.setDni(dni);
                    updateDTO.setTelefono(telefono);
                    updateDTO.setDireccion(direccion);
                    
                    // Actualizar el usuario con los datos adicionales
                    usuarioService.actualizarUsuario(response.getId(), updateDTO);
                }
                
                System.out.println("✅ Usuario creado exitosamente: " + response.getEmail());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("mensaje", response.getMensaje()));
            }
            
        } catch (RuntimeException e) {
            System.err.println("❌ Error al crear usuario: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al crear usuario"));
        }
    }
    
    // ✅ Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> obtenerTodosLosUsuarios() {
        try {
            List<UsuarioDTO> usuarios = usuarioService.obtenerTodosLosUsuarios();
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            System.err.println("Error al obtener usuarios: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ✅ Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable Long id) {
        try {
            UsuarioDTO usuario = usuarioService.obtenerUsuarioPorId(id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            System.err.println("Usuario no encontrado: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno del servidor"));
        }
    }
    
    // ✅ Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarUsuario(@PathVariable Long id) {
        try {
            System.out.println("🔍 Intentando eliminar usuario ID: " + id);
            Map<String, Object> response = usuarioService.eliminarUsuario(id);
            System.out.println("✅ Usuario eliminado: " + response);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("❌ Error al eliminar usuario: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", e.getMessage());
            errorResponse.put("eliminado", false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Error interno al eliminar: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", "Error al eliminar usuario: " + e.getMessage());
            errorResponse.put("eliminado", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // ✅ Cambiar estado activo/inactivo
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestBody ActualizarEstadoUsuarioDTO estadoDTO) {
        try {
            System.out.println("🔍 Cambiando estado usuario ID: " + id + " a: " + estadoDTO.getActivo());
            UsuarioDTO usuarioActualizado = usuarioService.cambiarEstadoUsuario(id, estadoDTO);
            System.out.println("✅ Estado cambiado exitosamente");
            return ResponseEntity.ok(usuarioActualizado);
        } catch (RuntimeException e) {
            System.err.println("❌ Usuario no encontrado: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al cambiar estado del usuario"));
        }
    }
    
    // ✅ Actualizar información del usuario
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody UsuarioDTO usuarioDTO) {
        try {
            System.out.println("🔍 Actualizando usuario ID: " + id);
            System.out.println("📝 Datos recibidos: " + usuarioDTO);
            UsuarioDTO usuarioActualizado = usuarioService.actualizarUsuario(id, usuarioDTO);
            System.out.println("✅ Usuario actualizado exitosamente");
            return ResponseEntity.ok(usuarioActualizado);
        } catch (RuntimeException e) {
            System.err.println("❌ Error en datos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al actualizar usuario"));
        }
    }
    
    // ✅ Endpoint para estadísticas
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            System.out.println("📊 Obteniendo estadísticas de usuarios");
            Map<String, Object> estadisticas = usuarioService.obtenerEstadisticas();
            System.out.println("✅ Estadísticas: " + estadisticas);
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            System.err.println("❌ Error al obtener estadísticas: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", "Error al obtener estadísticas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // ✅ Endpoint para obtener usuarios en formato entidad (compatibilidad)
    @GetMapping("/entidades")
    public ResponseEntity<List<com.ventadeautos.backend.model.Usuario>> obtenerTodosLosUsuariosEntidad() {
        try {
            List<com.ventadeautos.backend.model.Usuario> usuarios = usuarioService.obtenerTodosLosUsuariosEntidad();
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            System.err.println("Error al obtener usuarios (entidades): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Endpoint para cambiar contraseña
    @PutMapping("/{id}/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(
            @PathVariable Long id,
            @RequestBody CambiarContrasenaDTO cambioDTO) {
        try {
            System.out.println("🔐 Cambiando contraseña para usuario ID: " + id);
            Map<String, Object> response = usuarioService.cambiarContrasena(id, cambioDTO);
            System.out.println("✅ Contraseña cambiada exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("❌ Error en cambio de contraseña: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al cambiar contraseña"));
        }
    }
}
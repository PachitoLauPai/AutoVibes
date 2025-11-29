package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.UsuarioDTO;
import com.ventadeautos.backend.dto.ActualizarEstadoUsuarioDTO;
import com.ventadeautos.backend.dto.RegistroRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.dto.CambiarContrasenaDTO;
import com.ventadeautos.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {
    
    private final UsuarioService usuarioService;
    
    // ✅ CREAR USUARIO - MÉTODO POST CORREGIDO
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, Object> usuarioData) {
        log.info("Creando nuevo usuario: {}", usuarioData.get("email"));
        try {
            
            // Extraer datos del Map
            String email = (String) usuarioData.get("email");
            String password = (String) usuarioData.get("password");
            String nombre = (String) usuarioData.get("nombre");
            String apellidos = (String) usuarioData.get("apellidos");
            String dni = (String) usuarioData.get("dni");
            String telefono = (String) usuarioData.get("telefono");
            String direccion = (String) usuarioData.get("direccion");
            
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
                
                log.info("Usuario creado exitosamente: {}", response.getEmail());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("mensaje", response.getMensaje()));
            }
            
        } catch (RuntimeException e) {
            log.error("Error al crear usuario: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            log.error("Error interno al crear usuario", e);
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
            log.error("Error al obtener usuarios: {}", e.getMessage(), e);
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
            log.error("Usuario no encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            log.error("Error interno al obtener usuario: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno del servidor"));
        }
    }
    
    // ✅ Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarUsuario(@PathVariable Long id) {
        log.info("Intentando eliminar usuario ID: {}", id);
        try {
            Map<String, Object> response = usuarioService.eliminarUsuario(id);
            log.info("Usuario eliminado exitosamente - ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al eliminar usuario ID: {} - {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", e.getMessage());
            errorResponse.put("eliminado", false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error interno al eliminar usuario ID: {}", id, e);
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
        log.info("Cambiando estado usuario ID: {} a: {}", id, estadoDTO.getActivo());
        try {
            UsuarioDTO usuarioActualizado = usuarioService.cambiarEstadoUsuario(id, estadoDTO);
            log.info("Estado cambiado exitosamente - Usuario ID: {}", id);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (RuntimeException e) {
            log.error("Usuario no encontrado ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            log.error("Error interno al cambiar estado usuario ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al cambiar estado del usuario"));
        }
    }
    
    // ✅ Actualizar información del usuario
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody UsuarioDTO usuarioDTO) {
        log.info("Actualizando usuario ID: {}", id);
        try {
            UsuarioDTO usuarioActualizado = usuarioService.actualizarUsuario(id, usuarioDTO);
            log.info("Usuario actualizado exitosamente - ID: {}", id);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (RuntimeException e) {
            log.error("Error en datos al actualizar usuario ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            log.error("Error interno al actualizar usuario ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al actualizar usuario"));
        }
    }
    
    // ✅ Endpoint para estadísticas
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        log.debug("Obteniendo estadísticas de usuarios");
        try {
            Map<String, Object> estadisticas = usuarioService.obtenerEstadisticas();
            log.debug("Estadísticas obtenidas exitosamente");
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("Error al obtener estadísticas: {}", e.getMessage(), e);
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
            log.error("Error al obtener usuarios (entidades): {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Endpoint para cambiar contraseña
    @PutMapping("/{id}/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(
            @PathVariable Long id,
            @RequestBody CambiarContrasenaDTO cambioDTO) {
        log.info("Cambiando contraseña para usuario ID: {}", id);
        try {
            Map<String, Object> response = usuarioService.cambiarContrasena(id, cambioDTO);
            log.info("Contraseña cambiada exitosamente - Usuario ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error en cambio de contraseña - Usuario ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            log.error("Error interno al cambiar contraseña - Usuario ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al cambiar contraseña"));
        }
    }
}
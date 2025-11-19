package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.LoginRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.dto.RegistroRequest;
import com.ventadeautos.backend.dto.UsuarioDTO;
import com.ventadeautos.backend.dto.ActualizarEstadoUsuarioDTO;
import com.ventadeautos.backend.dto.CambiarContrasenaDTO;
import com.ventadeautos.backend.dto.ActualizarPerfilDTO;
import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.model.Cliente;
import com.ventadeautos.backend.model.Rol;
import com.ventadeautos.backend.repository.UsuarioRepository;
import com.ventadeautos.backend.repository.ClienteRepository;
import com.ventadeautos.backend.repository.RolRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final RolRepository rolRepository;
    
    // ✅ MÉTODOS EXISTENTES DE AUTENTICACIÓN
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
    
    public LoginResponse registrar(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            LoginResponse response = new LoginResponse();
            response.setMensaje("El email ya está registrado");
            return response;
        }

        // ✅ Obtener el rol CLIENTE de la base de datos
        Rol rolCliente = rolRepository.findByNombre("CLIENTE")
                .orElseThrow(() -> new RuntimeException("Rol CLIENTE no encontrado en la base de datos"));
        
        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        usuario.setNombre(request.getNombre()); // Este es el "nickname"
        usuario.setRol(rolCliente);
        usuario.setActivo(true); // ✅ Por defecto activo
        
        usuarioRepository.save(usuario);
        
        // ✅ CREAR CLIENTE AUTOMÁTICAMENTE SI ES CLIENTE
        if (rolCliente.getNombre().equals("CLIENTE")) {
            Cliente cliente = new Cliente();
            cliente.setNombres(""); // Se completará al hacer la primera compra
            cliente.setApellidos(""); // Se completará al hacer la primera compra
            cliente.setDni(""); // Se completará al hacer la primera compra
            cliente.setTelefono(""); // Se completará al hacer la primera compra
            cliente.setDireccion(""); // Se completará al hacer la primera compra
            cliente.setUsuario(usuario); // Establecer relación con el usuario
            
            clienteRepository.save(cliente);
            System.out.println("✅ Cliente creado automáticamente para: " + usuario.getEmail());
        }
        
        LoginResponse response = new LoginResponse();
        response.setId(usuario.getId());
        response.setEmail(usuario.getEmail());
        response.setNombre(usuario.getNombre());
        response.setRol(usuario.getRol());
        response.setMensaje("Usuario registrado exitosamente");
        return response;
    }

    // ✅ NUEVOS MÉTODOS PARA GESTIÓN DE USUARIOS (ADMIN)
    
    public List<UsuarioDTO> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    public UsuarioDTO obtenerUsuarioPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        return convertirADTO(usuario);
    }
    
    @Transactional
    public Map<String, Object> eliminarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        
        usuarioRepository.delete(usuario);
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Usuario eliminado correctamente");
        response.put("eliminado", true);
        response.put("usuarioEliminado", usuario.getEmail());
        
        return response;
    }
    
    @Transactional
    public UsuarioDTO cambiarEstadoUsuario(Long id, ActualizarEstadoUsuarioDTO estadoDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        
        usuario.setActivo(estadoDTO.getActivo());
        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        
        return convertirADTO(usuarioActualizado);
    }
    
    @Transactional
    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        
        // Verificar si el email ya existe (excluyendo el usuario actual)
        if (usuarioDTO.getEmail() != null && 
            !usuario.getEmail().equals(usuarioDTO.getEmail()) &&
            usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con el email: " + usuarioDTO.getEmail());
        }
        
        // Actualizar campos permitidos
        if (usuarioDTO.getNombre() != null) {
            usuario.setNombre(usuarioDTO.getNombre());
        }
        if (usuarioDTO.getEmail() != null) {
            usuario.setEmail(usuarioDTO.getEmail());
        }
        if (usuarioDTO.getApellidos() != null) {
            usuario.setApellidos(usuarioDTO.getApellidos());
        }
        if (usuarioDTO.getDni() != null) {
            usuario.setDni(usuarioDTO.getDni());
        }
        if (usuarioDTO.getTelefono() != null) {
            usuario.setTelefono(usuarioDTO.getTelefono());
        }
        if (usuarioDTO.getDireccion() != null) {
            usuario.setDireccion(usuarioDTO.getDireccion());
        }
        if (usuarioDTO.getPassword() != null && !usuarioDTO.getPassword().isEmpty()) {
            usuario.setPassword(usuarioDTO.getPassword());
        }
        
        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        return convertirADTO(usuarioActualizado);
    }
    
    // ✅ MÉTODOS PARA ESTADÍSTICAS
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("totalUsuarios", usuarioRepository.count());
        estadisticas.put("usuariosActivos", usuarioRepository.countByActivo(true));
        estadisticas.put("usuariosInactivos", usuarioRepository.countByActivo(false));
        estadisticas.put("totalAdmins", usuarioRepository.countByRolNombre("ADMIN"));
        estadisticas.put("totalClientes", usuarioRepository.countByRolNombre("CLIENTE"));
        
        return estadisticas;
    }
    
    // ✅ MÉTODO DE CONVERSIÓN A DTO
    private UsuarioDTO convertirADTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setEmail(usuario.getEmail());
        dto.setPassword(usuario.getPassword());
        dto.setNombre(usuario.getNombre());
        dto.setApellidos(usuario.getApellidos());
        dto.setDni(usuario.getDni());
        dto.setTelefono(usuario.getTelefono());
        dto.setDireccion(usuario.getDireccion());
        dto.setActivo(usuario.getActivo());
        dto.setFechaCreacion(usuario.getFechaCreacion());
        dto.setFechaActualizacion(usuario.getFechaActualizacion());
        
        // Convertir rol a DTO
        UsuarioDTO.RolDTO rolDTO = new UsuarioDTO.RolDTO();
        rolDTO.setId(usuario.getRol().getId());
        rolDTO.setNombre(usuario.getRol().getNombre());
        rolDTO.setDescripcion(usuario.getRol().getDescripcion());
        rolDTO.setActiva(usuario.getRol().getActiva());
        
        dto.setRol(rolDTO);
        
        return dto;
    }
    
    // ✅ MÉTODOS EXISTENTES (para compatibilidad)
    public List<Usuario> obtenerTodosLosUsuariosEntidad() {
        return usuarioRepository.findAll();
    }
    
    public boolean eliminarUsuarioSimple(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public Usuario actualizarUsuarioEntidad(Long id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id)
            .map(usuario -> {
                if (usuarioActualizado.getNombre() != null) {
                    usuario.setNombre(usuarioActualizado.getNombre());
                }
                if (usuarioActualizado.getEmail() != null) {
                    if (!usuario.getEmail().equals(usuarioActualizado.getEmail()) && 
                        usuarioRepository.existsByEmail(usuarioActualizado.getEmail())) {
                        throw new RuntimeException("El email ya está en uso por otro usuario");
                    }
                    usuario.setEmail(usuarioActualizado.getEmail());
                }
                if (usuarioActualizado.getRol() != null) {
                    usuario.setRol(usuarioActualizado.getRol());
                }
                
                return usuarioRepository.save(usuario);
            })
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }
    
    // ✅ MÉTODO PARA CAMBIAR CONTRASEÑA
    @Transactional
    public Map<String, Object> cambiarContrasena(Long id, CambiarContrasenaDTO cambioDTO) {
        // Validar que las nuevas contraseñas coincidan
        if (!cambioDTO.getContrasenaNew().equals(cambioDTO.getConfirmarContrasena())) {
            throw new RuntimeException("Las nuevas contraseñas no coinciden");
        }
        
        // Validar que la nueva contraseña sea diferente a la actual
        if (cambioDTO.getContrasenaNew().equals(cambioDTO.getContrasenaActual())) {
            throw new RuntimeException("La nueva contraseña debe ser diferente a la actual");
        }
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        
        // Verificar que la contraseña actual sea correcta
        if (!usuario.getPassword().equals(cambioDTO.getContrasenaActual())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // Actualizar contraseña
        usuario.setPassword(cambioDTO.getContrasenaNew());
        usuarioRepository.save(usuario);
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Contraseña actualizada exitosamente");
        response.put("exitoso", true);
        
        return response;
    }
}
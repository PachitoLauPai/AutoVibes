// UsuarioService.java
package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.LoginRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.dto.RegistroRequest;
import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.model.Cliente;
import com.ventadeautos.backend.model.Rol;
import com.ventadeautos.backend.repository.UsuarioRepository;
import com.ventadeautos.backend.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    
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
        
        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        usuario.setNombre(request.getNombre()); // Este es el "nickname"
        usuario.setRol(request.getRol());
        
        usuarioRepository.save(usuario);
        
        // ✅ CREAR CLIENTE AUTOMÁTICAMENTE SI ES CLIENTE
        if (request.getRol() == Rol.CLIENTE) {
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

    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }

    public boolean eliminarUsuario(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Usuario actualizarUsuario(Long id, Usuario usuarioActualizado) {
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
}
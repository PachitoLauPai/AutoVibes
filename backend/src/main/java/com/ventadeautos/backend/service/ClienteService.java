package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Cliente;
import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {
    
    private final ClienteRepository clienteRepository;
    
    /**
     * Crear un nuevo cliente (usado en registro legacy)
     */
    public Cliente crearCliente(String nombres, String apellidos, String dni, String telefono, String direccion, Usuario usuario) {
        // Verificar si ya existe un cliente con ese DNI
        if (clienteRepository.existsByDni(dni)) {
            throw new RuntimeException("Ya existe un cliente con el DNI: " + dni);
        }
        
        Cliente cliente = new Cliente();
        cliente.setNombres(nombres);
        cliente.setApellidos(apellidos);
        cliente.setDni(dni);
        cliente.setTelefono(telefono);
        cliente.setDireccion(direccion);
        cliente.setUsuario(usuario);
        
        return clienteRepository.save(cliente);
    }
    
    /**
     * Actualizar cliente existente
     */
    public Cliente actualizarCliente(Long id, String nombres, String apellidos, String dni, String telefono, String direccion) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        
        cliente.setNombres(nombres);
        cliente.setApellidos(apellidos);
        cliente.setDni(dni);
        cliente.setTelefono(telefono);
        cliente.setDireccion(direccion);
        
        return clienteRepository.save(cliente);
    }
    
    public Optional<Cliente> obtenerClientePorUsuarioId(Long usuarioId) {
        return clienteRepository.findByUsuarioId(usuarioId);
    }
    
    public boolean existeClientePorUsuarioId(Long usuarioId) {
        return clienteRepository.existsByUsuarioId(usuarioId);
    }
    
    public Optional<Cliente> obtenerClientePorId(Long id) {
        return clienteRepository.findById(id);
    }
}
package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.ContactRequest;
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
    
    public Cliente crearOActualizarCliente(ContactRequest contactRequest, Usuario usuario) {
        // Verificar si ya existe un cliente para este usuario
        Optional<Cliente> clienteExistente = clienteRepository.findByUsuarioId(usuario.getId());
        
        if (clienteExistente.isPresent()) {
            // Actualizar cliente existente
            Cliente cliente = clienteExistente.get();
            cliente.setNombres(contactRequest.getNombres());
            cliente.setApellidos(contactRequest.getApellidos());
            cliente.setDni(contactRequest.getDni());
            cliente.setTelefono(contactRequest.getTelefono());
            cliente.setDireccion(contactRequest.getDireccion());
            return clienteRepository.save(cliente);
        } else {
            // Verificar si ya existe un cliente con ese DNI
            if (clienteRepository.existsByDni(contactRequest.getDni())) {
                throw new RuntimeException("Ya existe un cliente con el DNI: " + contactRequest.getDni());
            }
            
            // Crear nuevo cliente
            Cliente cliente = new Cliente();
            cliente.setNombres(contactRequest.getNombres());
            cliente.setApellidos(contactRequest.getApellidos());
            cliente.setDni(contactRequest.getDni());
            cliente.setTelefono(contactRequest.getTelefono());
            cliente.setDireccion(contactRequest.getDireccion());
            cliente.setUsuario(usuario);
            
            return clienteRepository.save(cliente);
        }
    }
    
    public Optional<Cliente> obtenerClientePorUsuarioId(Long usuarioId) {
        return clienteRepository.findByUsuarioId(usuarioId);
    }
    
    public boolean existeClientePorUsuarioId(Long usuarioId) {
        return clienteRepository.existsByUsuarioId(usuarioId);
    }
}
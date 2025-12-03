package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Cliente;
import com.ventadeautos.backend.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClienteService {
    
    private final ClienteRepository clienteRepository;
    
    /**
     * Obtener todos los clientes
     */
    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }
    
    /**
     * Obtener cliente por ID
     */
    public Optional<Cliente> obtenerPorId(Long id) {
        return clienteRepository.findById(id);
    }
    
    /**
     * Obtener cliente por DNI
     */
    public Optional<Cliente> obtenerPorDni(String dni) {
        return clienteRepository.findByDni(dni);
    }
    
    /**
     * Crear cliente
     */
    public Cliente crearCliente(Cliente cliente) {
        log.info("Creando cliente: {}", cliente.getDni());
        return clienteRepository.save(cliente);
    }
    
    /**
     * Actualizar cliente
     */
    public Optional<Cliente> actualizarCliente(Long id, Cliente clienteData) {
        return clienteRepository.findById(id).map(cliente -> {
            if (clienteData.getNombre() != null) {
                cliente.setNombre(clienteData.getNombre());
            }
            if (clienteData.getApellido() != null) {
                cliente.setApellido(clienteData.getApellido());
            }
            if (clienteData.getTelefono() != null) {
                cliente.setTelefono(clienteData.getTelefono());
            }
            if (clienteData.getDireccion() != null) {
                cliente.setDireccion(clienteData.getDireccion());
            }
            if (clienteData.getActivo() != null) {
                cliente.setActivo(clienteData.getActivo());
            }
            return clienteRepository.save(cliente);
        });
    }
    
    /**
     * Eliminar cliente
     */
    public boolean eliminarCliente(Long id) {
        if (clienteRepository.existsById(id)) {
            clienteRepository.deleteById(id);
            log.info("Cliente eliminado: {}", id);
            return true;
        }
        return false;
    }
}

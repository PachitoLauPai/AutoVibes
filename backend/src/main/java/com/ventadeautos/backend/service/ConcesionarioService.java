package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Concesionario;
import com.ventadeautos.backend.repository.ConcesionarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ConcesionarioService {
    
    private final ConcesionarioRepository concesionarioRepository;
    
    @Transactional(readOnly = true)
    public List<Concesionario> obtenerTodosLosConcesionarios() {
        log.info("Service: Obteniendo todos los concesionarios (incluyendo inactivos)");
        try {
            List<Concesionario> concesionarios = concesionarioRepository.findAll();
            log.info("Service: Se encontraron {} concesionarios en total", concesionarios.size());
            return concesionarios;
        } catch (Exception e) {
            log.error("Service: Error al obtener todos los concesionarios", e);
            throw e;
        }
    }
    
    @Transactional(readOnly = true)
    public List<Concesionario> obtenerConcesionariosActivos() {
        log.info("Service: Obteniendo concesionarios activos");
        try {
            List<Concesionario> concesionarios = concesionarioRepository.findByActivoTrue();
            log.info("Service: Se encontraron {} concesionarios activos", concesionarios.size());
            if (concesionarios.isEmpty()) {
                log.warn("Service: No se encontraron concesionarios activos");
            } else {
                log.debug("Service: Concesionarios encontrados: {}", 
                    concesionarios.stream().map(Concesionario::getNombre).toList());
            }
            return concesionarios;
        } catch (Exception e) {
            log.error("Service: Error al obtener concesionarios activos", e);
            throw e;
        }
    }
    
    public Optional<Concesionario> obtenerConcesionarioPorId(Long id) {
        log.info("Service: Buscando concesionario con ID: {}", id);
        try {
            Optional<Concesionario> concesionario = concesionarioRepository.findById(id);
            if (concesionario.isPresent()) {
                log.info("Service: Concesionario encontrado: {}", concesionario.get().getNombre());
            } else {
                log.warn("Service: No se encontró concesionario con ID: {}", id);
            }
            return concesionario;
        } catch (Exception e) {
            log.error("Service: Error al buscar concesionario con ID: {}", id, e);
            throw e;
        }
    }
    
    public Optional<Concesionario> obtenerConcesionarioPorNombre(String nombre) {
        log.info("Service: Buscando concesionario con nombre: {}", nombre);
        return concesionarioRepository.findByNombre(nombre);
    }
    
    public Concesionario crearConcesionario(String nombre, String direccion, String telefono, String email) {
        log.info("Service: Creando nuevo concesionario - Nombre: {}, Dirección: {}, Teléfono: {}, Email: {}", 
            nombre, direccion, telefono, email);
        try {
            // Verificar si ya existe
            if (concesionarioRepository.findByNombre(nombre).isPresent()) {
                log.warn("Service: Intento de crear concesionario duplicado: {}", nombre);
                throw new RuntimeException("El concesionario '" + nombre + "' ya existe");
            }
            
            Concesionario concesionario = new Concesionario();
            concesionario.setNombre(nombre);
            concesionario.setDireccion(direccion);
            concesionario.setTelefono(telefono);
            concesionario.setEmail(email);
            concesionario.setActivo(true);
            
            Concesionario guardado = concesionarioRepository.save(concesionario);
            log.info("Service: Concesionario creado exitosamente con ID: {}", guardado.getId());
            return guardado;
        } catch (Exception e) {
            log.error("Service: Error al crear concesionario: {}", nombre, e);
            throw e;
        }
    }
    
    public Concesionario actualizarConcesionario(Long id, String nombre, String direccion, String telefono, String email, Boolean activo) {
        log.info("Service: Actualizando concesionario con ID: {}", id);
        try {
            Concesionario concesionario = concesionarioRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service: Concesionario con ID {} no encontrado para actualizar", id);
                    return new RuntimeException("Concesionario no encontrado");
                });
            
            log.debug("Service: Datos actuales - Nombre: {}, Activo: {}", concesionario.getNombre(), concesionario.getActivo());
            
            // Verificar si el nuevo nombre ya existe (excluyendo el actual)
            if (!concesionario.getNombre().equals(nombre) && concesionarioRepository.findByNombre(nombre).isPresent()) {
                log.warn("Service: Intento de actualizar concesionario con nombre duplicado: {}", nombre);
                throw new RuntimeException("El concesionario '" + nombre + "' ya existe");
            }
            
            concesionario.setNombre(nombre);
            if (direccion != null) {
                concesionario.setDireccion(direccion);
            }
            if (telefono != null) {
                concesionario.setTelefono(telefono);
            }
            if (email != null) {
                concesionario.setEmail(email);
            }
            if (activo != null) {
                concesionario.setActivo(activo);
            }
            
            Concesionario actualizado = concesionarioRepository.save(concesionario);
            log.info("Service: Concesionario actualizado exitosamente - ID: {}, Nombre: {}", actualizado.getId(), actualizado.getNombre());
            return actualizado;
        } catch (Exception e) {
            log.error("Service: Error al actualizar concesionario con ID: {}", id, e);
            throw e;
        }
    }
    
    public void eliminarConcesionario(Long id) {
        log.info("Service: Eliminando concesionario con ID: {}", id);
        try {
            Concesionario concesionario = concesionarioRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service: Concesionario con ID {} no encontrado para eliminar", id);
                    return new RuntimeException("Concesionario no encontrado");
                });
            
            // Verificar si tiene autos asociados
            if (concesionario.getAutos() != null && !concesionario.getAutos().isEmpty()) {
                log.warn("Service: No se puede eliminar concesionario {} porque tiene {} autos asociados", 
                    concesionario.getNombre(), concesionario.getAutos().size());
                throw new RuntimeException("No se puede eliminar el concesionario porque tiene autos asociados");
            }
            
            concesionarioRepository.delete(concesionario);
            log.info("Service: Concesionario eliminado exitosamente - ID: {}", id);
        } catch (Exception e) {
            log.error("Service: Error al eliminar concesionario con ID: {}", id, e);
            throw e;
        }
    }
    
    public Concesionario desactivarConcesionario(Long id) {
        log.info("Service: Desactivando concesionario con ID: {}", id);
        try {
            Concesionario concesionario = concesionarioRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service: Concesionario con ID {} no encontrado para desactivar", id);
                    return new RuntimeException("Concesionario no encontrado");
                });
            
            concesionario.setActivo(false);
            Concesionario desactivado = concesionarioRepository.save(concesionario);
            log.info("Service: Concesionario desactivado exitosamente - ID: {}, Nombre: {}", 
                desactivado.getId(), desactivado.getNombre());
            return desactivado;
        } catch (Exception e) {
            log.error("Service: Error al desactivar concesionario con ID: {}", id, e);
            throw e;
        }
    }
}


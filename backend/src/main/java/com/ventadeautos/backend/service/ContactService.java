package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.ContactRequest;
import com.ventadeautos.backend.exception.ResourceNotFoundException;
import com.ventadeautos.backend.model.Contact;
import com.ventadeautos.backend.model.Auto;
import com.ventadeautos.backend.repository.ContactRepository;
import com.ventadeautos.backend.repository.AutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ContactService {
    
    private final ContactRepository contactRepository;
    private final AutoRepository autoRepository;
    
    /**
     * Guardar un nuevo contacto desde el formulario público
     */
    public ResponseEntity<Contact> guardarContacto(ContactRequest request) {
        log.info("Guardando nuevo contacto de: {}", request.getNombre());
        
        try {
            // Validar campos obligatorios
            if (request.getNombre() == null || request.getNombre().isEmpty()) {
                log.warn("Intento de contacto sin nombre");
                return ResponseEntity.badRequest().build();
            }
            
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                log.warn("Intento de contacto sin email");
                return ResponseEntity.badRequest().build();
            }
            
            // Crear nuevo contacto
            Contact contact = new Contact();
            contact.setNombre(request.getNombre());
            contact.setDni(request.getDni() != null ? request.getDni() : "");
            contact.setEmail(request.getEmail());
            contact.setTelefono(request.getTelefono() != null ? request.getTelefono() : "");
            contact.setAsunto(request.getAsunto() != null ? request.getAsunto() : "Consulta general");
            contact.setMensaje(request.getMensaje() != null ? request.getMensaje() : "");
            contact.setLeido(false);
            contact.setRespondido(false);
            
            // Si hay autoId, asociar el auto
            if (request.getAutoId() != null && request.getAutoId() > 0) {
                Auto auto = autoRepository.findById((Long)request.getAutoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Auto", request.getAutoId()));
                contact.setAuto(auto);
                log.debug("Contacto asociado al auto ID: {}", request.getAutoId());
            }
            
            Contact contactGuardado = contactRepository.save(contact);
            log.info("Contacto guardado exitosamente - ID: {}, Email: {}", contactGuardado.getId(), contactGuardado.getEmail());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(contactGuardado);
            
        } catch (ResourceNotFoundException e) {
            log.error("Error al guardar contacto: Auto no encontrado - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error al guardar contacto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener todos los contactos (para admin)
     */
    public List<Contact> obtenerTodosLosContactos() {
        log.debug("Obteniendo todos los contactos");
        return contactRepository.findAllOrderByFechaDesc();
    }
    
    /**
     * Obtener contactos no leídos
     */
    public List<Contact> obtenerContactosNoLeidos() {
        log.debug("Obteniendo contactos no leídos");
        return contactRepository.findByLeidoFalse();
    }
    
    /**
     * Obtener contactos no respondidos
     */
    public List<Contact> obtenerContactosNoRespondidos() {
        log.debug("Obteniendo contactos no respondidos");
        return contactRepository.findByRespondidoFalse();
    }
    
    /**
     * Obtener contacto por ID
     */
    public Contact obtenerContactoPorId(Long id) {
        log.debug("Obteniendo contacto ID: {}", id);
        return contactRepository.findById(id)
            .orElseThrow(() -> {
                log.error("Contacto no encontrado: {}", id);
                return new ResourceNotFoundException("Contacto", id);
            });
    }
    
    /**
     * Marcar contacto como leído y cambiar estado a EN_PROCESO
     */
    public Contact marcarComoLeido(Long id) {
        log.info("Marcando contacto {} como leído y cambiando estado a EN_PROCESO", id);
        Contact contact = obtenerContactoPorId(id);
        contact.setLeido(true);
        contact.setEstado("EN_PROCESO");  // Cambiar estado automáticamente
        return contactRepository.save(contact);
    }
    
    /**
     * Marcar contacto como respondido
     */
    public Contact marcarComoRespondido(Long id) {
        log.info("Marcando contacto {} como respondido", id);
        Contact contact = obtenerContactoPorId(id);
        contact.setRespondido(true);
        return contactRepository.save(contact);
    }
    
    /**
     * Actualizar estado del contacto y ajustar stock automáticamente
     */
    public Contact actualizarEstado(Long id, String nuevoEstado) {
        log.info("Actualizando estado del contacto {} a: {}", id, nuevoEstado);
        Contact contact = obtenerContactoPorId(id);
        String estadoAnterior = contact.getEstado();
        
        // Validar que el estado sea válido
        if (!nuevoEstado.equals("PENDIENTE") && !nuevoEstado.equals("EN_PROCESO") 
            && !nuevoEstado.equals("VENTA_FINALIZADA") && !nuevoEstado.equals("CANCELADO")) {
            log.warn("Intento de actualizar contacto con estado inválido: {}", nuevoEstado);
            throw new IllegalArgumentException("Estado inválido. Use: PENDIENTE, EN_PROCESO, VENTA_FINALIZADA o CANCELADO");
        }
        
        // Actualizar estado
        contact.setEstado(nuevoEstado);
        
        // ✅ LÓGICA DE STOCK: Ajustar stock del auto asociado
        if (contact.getAuto() != null) {
            Auto auto = contact.getAuto();
            
            // Si cambia a VENTA_FINALIZADA: disminuir stock
            if (nuevoEstado.equals("VENTA_FINALIZADA") && !estadoAnterior.equals("VENTA_FINALIZADA")) {
                if (auto.getStock() > 0) {
                    auto.setStock(auto.getStock() - 1);
                    log.info("Stock disminuido para auto ID: {}. Nuevo stock: {}", auto.getId(), auto.getStock());
                } else {
                    log.warn("No hay stock disponible para disminuir en auto ID: {}", auto.getId());
                }
            }
            
            // Si se cambia desde VENTA_FINALIZADA a CANCELADO: recuperar stock
            if (nuevoEstado.equals("CANCELADO") && estadoAnterior.equals("VENTA_FINALIZADA")) {
                auto.setStock(auto.getStock() + 1);
                log.info("Stock recuperado para auto ID: {}. Nuevo stock: {}", auto.getId(), auto.getStock());
            }
            
            // Si se cambia desde CANCELADO a VENTA_FINALIZADA: disminuir stock nuevamente
            if (nuevoEstado.equals("VENTA_FINALIZADA") && estadoAnterior.equals("CANCELADO")) {
                if (auto.getStock() > 0) {
                    auto.setStock(auto.getStock() - 1);
                    log.info("Stock disminuido para auto ID: {}. Nuevo stock: {}", auto.getId(), auto.getStock());
                } else {
                    log.warn("No hay stock disponible para disminuir en auto ID: {}", auto.getId());
                }
            }
            
            // Si se cambia desde otros estados a CANCELADO (que no sea VENTA_FINALIZADA), no hace nada
            
            // Guardar cambios en auto
            autoRepository.save(auto);
        }
        
        return contactRepository.save(contact);
    }
    
    /**
     * Actualizar tipo de transacción (COMPRA, VENTA)
     */
    public Contact actualizarTipoTransaccion(Long id, String nuevoTipo) {
        log.info("Actualizando tipo de transacción del contacto {} a: {}", id, nuevoTipo);
        Contact contact = obtenerContactoPorId(id);
        
        // Validar que el tipo sea válido
        if (!nuevoTipo.equals("COMPRA") && !nuevoTipo.equals("VENTA") && !nuevoTipo.equals("PENDIENTE")) {
            log.warn("Intento de actualizar contacto con tipo inválido: {}", nuevoTipo);
            throw new IllegalArgumentException("Tipo inválido. Use: COMPRA, VENTA o PENDIENTE");
        }
        
        contact.setTipoTransaccion(nuevoTipo);
        return contactRepository.save(contact);
    }
    
    /**
     * Obtener contactos por estado
     */
    public List<Contact> obtenerContactosPorEstado(String estado) {
        log.debug("Obteniendo contactos con estado: {}", estado);
        return contactRepository.findByEstado(estado);
    }
    
    /**
     * Obtener contactos por auto
     */
    public List<Contact> obtenerContactosPorAuto(Long autoId) {
        log.debug("Obteniendo contactos para auto ID: {}", autoId);
        return contactRepository.findByAutoId(autoId);
    }
    
    /**
     * Obtener contactos por email
     */
    public List<Contact> obtenerContactosPorEmail(String email) {
        log.debug("Obteniendo contactos para email: {}", email);
        return contactRepository.findByEmail(email);
    }
    
    /**
     * Contar contactos no leídos
     */
    public long contarNoLeidos() {
        return contactRepository.countByLeidoFalse();
    }
    
    /**
     * Contar contactos creados hoy
     */
    public long obtenerContactosHoy() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioDia = hoy.atStartOfDay();
        LocalDateTime finDia = hoy.atTime(23, 59, 59);
        return contactRepository.countByFechaCreacionBetween(inicioDia, finDia);
    }
    
    /**
     * Eliminar contacto
     */
    public Map<String, Object> eliminarContacto(Long id) {
        log.info("Eliminando contacto ID: {}", id);
        
        Contact contact = obtenerContactoPorId(id);
        contactRepository.deleteById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Contacto eliminado correctamente");
        response.put("id", id);
        response.put("email", contact.getEmail());
        
        return response;
    }
    
    /**
     * Obtener estadísticas de contactos
     */
    public Map<String, Object> obtenerEstadisticas() {
        log.debug("Obteniendo estadísticas de contactos");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalContactos", contactRepository.count());
        stats.put("noLeidos", contactRepository.countByLeidoFalse());
        stats.put("noRespondidos", contactRepository.findByRespondidoFalse().size());
        
        return stats;
    }
}

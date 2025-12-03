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
    public ResponseEntity<String> guardarContacto(ContactRequest request) {
        log.info("Guardando nuevo contacto de: {}", request.getNombre());
        
        try {
            // Validar campos obligatorios
            if (request.getNombre() == null || request.getNombre().isEmpty()) {
                log.warn("Intento de contacto sin nombre");
                return ResponseEntity.badRequest().body("El nombre es obligatorio");
            }
            
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                log.warn("Intento de contacto sin email");
                return ResponseEntity.badRequest().body("El email es obligatorio");
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
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body("Contacto guardado correctamente. Nos pondremos en contacto pronto.");
            
        } catch (ResourceNotFoundException e) {
            log.error("Error al guardar contacto: Auto no encontrado - {}", e.getMessage());
            return ResponseEntity.badRequest().body("El auto especificado no existe");
        } catch (Exception e) {
            log.error("Error al guardar contacto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al procesar el contacto. Intenta más tarde.");
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
     * Marcar contacto como leído
     */
    public Contact marcarComoLeido(Long id) {
        log.info("Marcando contacto {} como leído", id);
        Contact contact = obtenerContactoPorId(id);
        contact.setLeido(true);
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

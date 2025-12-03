package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.ContactRequest;
import com.ventadeautos.backend.model.Contact;
import com.ventadeautos.backend.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ContactController {
    
    private final ContactService contactService;
    
    @PostMapping("/enviar")
    public ResponseEntity<String> enviarContacto(@RequestBody ContactRequest request) {
        return contactService.guardarContacto(request);
    }
    
    // =============================================
    // ENDPOINTS PARA ADMIN
    // =============================================
    
    @GetMapping("/admin/todos")
    public ResponseEntity<List<Contact>> obtenerTodosLosContactos() {
        List<Contact> contactos = contactService.obtenerTodosLosContactos();
        return ResponseEntity.ok(contactos);
    }
    
    @GetMapping("/admin/no-leidos")
    public ResponseEntity<List<Contact>> obtenerContactosNoLeidos() {
        List<Contact> contactos = contactService.obtenerContactosNoLeidos();
        return ResponseEntity.ok(contactos);
    }
    
    @GetMapping("/admin/no-respondidos")
    public ResponseEntity<List<Contact>> obtenerContactosNoRespondidos() {
        List<Contact> contactos = contactService.obtenerContactosNoRespondidos();
        return ResponseEntity.ok(contactos);
    }
    
    @GetMapping("/admin/{id}")
    public ResponseEntity<Contact> obtenerContactoPorId(@PathVariable Long id) {
        Contact contacto = contactService.obtenerContactoPorId(id);
        return ResponseEntity.ok(contacto);
    }
    
    @PutMapping("/admin/{id}/marcar-leido")
    public ResponseEntity<Contact> marcarComoLeido(@PathVariable Long id) {
        Contact contacto = contactService.marcarComoLeido(id);
        return ResponseEntity.ok(contacto);
    }
    
    @PutMapping("/admin/{id}/marcar-respondido")
    public ResponseEntity<Contact> marcarComoRespondido(@PathVariable Long id) {
        Contact contacto = contactService.marcarComoRespondido(id);
        return ResponseEntity.ok(contacto);
    }
    
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Map<String, Object>> eliminarContacto(@PathVariable Long id) {
        Map<String, Object> resultado = contactService.eliminarContacto(id);
        return ResponseEntity.ok(resultado);
    }
    
    @GetMapping("/admin/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> stats = contactService.obtenerEstadisticas();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/admin/auto/{autoId}")
    public ResponseEntity<List<Contact>> obtenerContactosPorAuto(@PathVariable Long autoId) {
        List<Contact> contactos = contactService.obtenerContactosPorAuto(autoId);
        return ResponseEntity.ok(contactos);
    }
}

package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.ContactRequest;
import com.ventadeautos.backend.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContactController {
    
    private final ContactService contactService;
    
    @PostMapping("/enviar")
    public ResponseEntity<String> enviarContacto(@RequestBody ContactRequest request) {
        return contactService.guardarContacto(request);
    }
}

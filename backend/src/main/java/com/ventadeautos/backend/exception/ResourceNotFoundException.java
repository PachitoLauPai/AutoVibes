package com.ventadeautos.backend.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s no encontrado con ID: %d", resourceName, id));
    }
    
    public ResourceNotFoundException(String resourceName, String identifier) {
        super(String.format("%s no encontrado: %s", resourceName, identifier));
    }
}


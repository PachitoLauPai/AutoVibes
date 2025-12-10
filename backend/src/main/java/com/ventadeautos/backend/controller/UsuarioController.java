package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.LoginRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.service.AdministradorService; // Usar AdministradorService
import com.ventadeautos.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AdministradorService administradorService; // Inyectar AdministradorService

    // Endpoint para login general de usuarios (Clientes, etc, si aplica)
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return usuarioService.login(request);
    }

    // Endpoint para login exclusivo de administradores (usando tabla
    // administradores)
    @PostMapping("/admin/login")
    public LoginResponse adminLogin(@RequestBody LoginRequest request) {
        return administradorService.loginAdmin(request);
    }

    // Endpoint para listar todos los usuarios (administradores)
    @GetMapping
    public java.util.List<com.ventadeautos.backend.model.Administrador> listarUsuarios() {
        return administradorService.listarAdmins();
    }

    // Endpoint para listar todos los administradores (usando tabla administradores)
    @GetMapping("/admins")
    public java.util.List<com.ventadeautos.backend.model.Administrador> listarAdmins() {
        return administradorService.listarAdmins();
    }

    // Endpoint para registrar un nuevo administrador
    @PostMapping("/admin/registrar")
    public com.ventadeautos.backend.model.Administrador registrarAdmin(
            @RequestBody com.ventadeautos.backend.dto.AdminRegistroRequest request) {
        return administradorService.registrarAdmin(request);
    }

    // Endpoint para crear un nuevo usuario (administrador)
    @PostMapping
    public com.ventadeautos.backend.model.Administrador crearUsuario(
            @RequestBody com.ventadeautos.backend.dto.AdminRegistroRequest request) {
        return administradorService.registrarAdmin(request);
    }

    // Endpoint para actualizar un administrador
    @PutMapping("/admin/{id}")
    public com.ventadeautos.backend.model.Administrador actualizarAdmin(
            @PathVariable Long id,
            @RequestBody com.ventadeautos.backend.model.Administrador adminActualizado) {
        return administradorService.actualizarAdmin(id, adminActualizado);
    }

    // Endpoint para actualizar un usuario (administrador)
    @PutMapping("/{id}")
    public com.ventadeautos.backend.model.Administrador actualizarUsuario(
            @PathVariable Long id,
            @RequestBody com.ventadeautos.backend.model.Administrador adminActualizado) {
        return administradorService.actualizarAdmin(id, adminActualizado);
    }

    // Endpoint para eliminar un usuario (administrador)
    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        administradorService.eliminarAdmin(id);
    }

    // Endpoint para cambiar el estado activo/inactivo de un usuario
    @PatchMapping("/{id}/estado")
    @CrossOrigin(origins = "http://localhost:4200")
    public com.ventadeautos.backend.model.Administrador cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> request) {
        Boolean nuevoEstado = request.get("activo");
        return administradorService.cambiarEstadoAdmin(id, nuevoEstado);
    }
}

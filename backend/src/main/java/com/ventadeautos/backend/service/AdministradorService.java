package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.AdminRegistroRequest;
import com.ventadeautos.backend.dto.LoginRequest;
import com.ventadeautos.backend.dto.LoginResponse;
import com.ventadeautos.backend.model.Administrador;
import com.ventadeautos.backend.model.Rol;
import com.ventadeautos.backend.repository.AdministradorRepository;
import com.ventadeautos.backend.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdministradorService {

    private final AdministradorRepository administradorRepository;
    private final RolRepository rolRepository;

    /**
     * Login de administrador
     */
    public LoginResponse loginAdmin(LoginRequest request) {
        log.info("Intentando login de admin: {}", request.getEmail());

        Optional<Administrador> adminOpt = administradorRepository.findByCorreo(request.getEmail());

        if (!adminOpt.isPresent()) {
            log.warn("Administrador no encontrado: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("Credenciales inválidas");
            return response;
        }

        Administrador admin = adminOpt.get();

        // Verificar que esté activo
        if (!admin.getActivo()) {
            log.warn("Administrador inactivo: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("Tu cuenta ha sido desactivada");
            return response;
        }

        // Verificar contraseña
        if (!admin.getPassword().equals(request.getPassword())) {
            log.warn("Contraseña incorrecta para admin: {}", request.getEmail());
            LoginResponse response = new LoginResponse();
            response.setMensaje("Credenciales inválidas");
            return response;
        }

        // Login exitoso
        log.info("Login de admin exitoso: {}", request.getEmail());
        LoginResponse response = new LoginResponse();
        response.setId(admin.getId());
        response.setEmail(admin.getCorreo());
        response.setNombre(admin.getNombre());
        response.setApellido(admin.getApellido());
        response.setRol(admin.getRol());
        response.setMensaje("Login de administrador exitoso");

        // Generar token simple
        String token = generateSimpleToken(admin.getId(), admin.getCorreo());
        response.setToken(token);

        return response;
    }

    /**
     * Generar un token simple
     */
    private String generateSimpleToken(Long id, String email) {
        return "token_" + id + "_" + System.currentTimeMillis();
    }

    /**
     * Obtener administrador por correo
     */
    public Optional<Administrador> obtenerPorCorreo(String correo) {
        return administradorRepository.findByCorreo(correo);
    }

    /**
     * Obtener administrador por ID
     */
    public Optional<Administrador> obtenerPorId(Long id) {
        return administradorRepository.findById(id);
    }

    /**
     * Listar todos los administradores
     */
    public java.util.List<Administrador> listarAdmins() {
        return administradorRepository.findAll();
    }

    /**
     * Registrar un nuevo administrador usando DTO
     */
    public Administrador registrarAdmin(AdminRegistroRequest request) {
        log.info("Registrando nuevo administrador desde DTO: {}", request.getCorreo());

        // Validar que no exista el correo
        if (administradorRepository.findByCorreo(request.getCorreo()).isPresent()) {
            log.warn("El correo ya está registrado: {}", request.getCorreo());
            throw new RuntimeException("El correo electrónico ya está registrado");
        }

        // Validar que no exista el DNI
        if (administradorRepository.findByDni(request.getDni()).isPresent()) {
            log.warn("El DNI ya está registrado: {}", request.getDni());
            throw new RuntimeException("El DNI ya está registrado");
        }

        // Obtener el rol ADMIN
        Rol rolAdmin = rolRepository.findByNombre("ADMIN")
                .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado en la base de datos"));

        // Crear el nuevo administrador
        Administrador nuevoAdmin = new Administrador();
        nuevoAdmin.setNombre(request.getNombre());
        nuevoAdmin.setApellido(request.getApellido());
        nuevoAdmin.setDni(request.getDni());
        nuevoAdmin.setCorreo(request.getCorreo());
        nuevoAdmin.setPassword(request.getPassword());
        nuevoAdmin.setRol(rolAdmin);
        nuevoAdmin.setActivo(true);

        // Guardar el administrador
        Administrador adminGuardado = administradorRepository.save(nuevoAdmin);
        log.info("Administrador registrado exitosamente: {} (ID: {})", adminGuardado.getCorreo(),
                adminGuardado.getId());

        return adminGuardado;
    }

    /**
     * Registrar un nuevo administrador (método directo)
     */
    public Administrador registrarAdmin(Administrador nuevoAdmin) {
        log.info("Registrando nuevo administrador: {}", nuevoAdmin.getCorreo());

        // Validar que no exista el correo
        if (administradorRepository.findByCorreo(nuevoAdmin.getCorreo()).isPresent()) {
            log.warn("El correo ya está registrado: {}", nuevoAdmin.getCorreo());
            throw new RuntimeException("El correo electrónico ya está registrado");
        }

        // Validar que no exista el DNI
        if (administradorRepository.findByDni(nuevoAdmin.getDni()).isPresent()) {
            log.warn("El DNI ya está registrado: {}", nuevoAdmin.getDni());
            throw new RuntimeException("El DNI ya está registrado");
        }

        // Establecer valores por defecto
        if (nuevoAdmin.getActivo() == null) {
            nuevoAdmin.setActivo(true);
        }

        // Guardar el administrador
        Administrador adminGuardado = administradorRepository.save(nuevoAdmin);
        log.info("Administrador registrado exitosamente: {} (ID: {})", adminGuardado.getCorreo(),
                adminGuardado.getId());

        return adminGuardado;
    }

    /**
     * Actualizar un administrador existente
     */
    public Administrador actualizarAdmin(Long id, Administrador adminActualizado) {
        log.info("Actualizando administrador ID: {}", id);

        Optional<Administrador> adminOpt = administradorRepository.findById(id);
        if (!adminOpt.isPresent()) {
            log.warn("Administrador no encontrado: {}", id);
            throw new RuntimeException("Administrador no encontrado");
        }

        Administrador admin = adminOpt.get();

        // Actualizar campos
        if (adminActualizado.getNombre() != null) {
            admin.setNombre(adminActualizado.getNombre());
        }
        if (adminActualizado.getApellido() != null) {
            admin.setApellido(adminActualizado.getApellido());
        }
        if (adminActualizado.getCorreo() != null && !admin.getCorreo().equals(adminActualizado.getCorreo())) {
            // Verificar que el nuevo correo no exista
            if (administradorRepository.findByCorreo(adminActualizado.getCorreo()).isPresent()) {
                throw new RuntimeException("El correo electrónico ya está registrado");
            }
            admin.setCorreo(adminActualizado.getCorreo());
        }
        if (adminActualizado.getPassword() != null) {
            admin.setPassword(adminActualizado.getPassword());
        }
        if (adminActualizado.getActivo() != null) {
            admin.setActivo(adminActualizado.getActivo());
        }
        if (adminActualizado.getRol() != null) {
            admin.setRol(adminActualizado.getRol());
        }

        Administrador adminActualizadoGuardado = administradorRepository.save(admin);
        log.info("Administrador actualizado exitosamente: {}", adminActualizadoGuardado.getId());

        return adminActualizadoGuardado;
    }

    /**
     * Eliminar un administrador
     */
    public void eliminarAdmin(Long id) {
        log.info("Eliminando administrador con ID: {}", id);

        if (!administradorRepository.existsById(id)) {
            throw new RuntimeException("Administrador no encontrado con ID: " + id);
        }

        administradorRepository.deleteById(id);
        log.info("Administrador eliminado exitosamente: {}", id);
    }

    /**
     * Cambiar estado activo/inactivo de un administrador
     */
    public Administrador cambiarEstadoAdmin(Long id, Boolean nuevoEstado) {
        log.info("Cambiando estado del administrador con ID: {} a {}", id, nuevoEstado);

        Administrador admin = administradorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Administrador no encontrado con ID: " + id));

        admin.setActivo(nuevoEstado);
        Administrador adminActualizado = administradorRepository.save(admin);

        log.info("Estado del administrador actualizado exitosamente: {}", adminActualizado.getId());
        return adminActualizado;
    }
}

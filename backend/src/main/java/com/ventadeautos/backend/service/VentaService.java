package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.ContactRequest;
import com.ventadeautos.backend.dto.VentaResponse;
import com.ventadeautos.backend.model.*;
import com.ventadeautos.backend.repository.AutoRepository;
import com.ventadeautos.backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VentaService {
    
    private final VentaRepository ventaRepository;
    private final ClienteService clienteService;
    private final AutoRepository autoRepository;
    
    public Venta crearSolicitudContacto(ContactRequest contactRequest, Usuario usuario) {
        System.out.println("=== 🚨 DEBUG INICIANDO ===");
        System.out.println("📦 ContactRequest: " + contactRequest);
        System.out.println("👤 Usuario ID: " + usuario.getId() + ", Email: " + usuario.getEmail());
        System.out.println("🚗 Auto ID: " + contactRequest.getAutoId());
        
        try {
            // 1. Verificar auto
            System.out.println("🔍 Buscando auto...");
            Auto auto = autoRepository.findById(contactRequest.getAutoId())
                .orElseThrow(() -> {
                    System.out.println("❌ AUTO NO ENCONTRADO: " + contactRequest.getAutoId());
                    return new RuntimeException("Auto no encontrado");
                });
            System.out.println("✅ Auto encontrado: " + auto.getMarca() + " " + auto.getModelo());
            
            // 2. Verificar cliente
            System.out.println("🔍 Procesando cliente...");
            Cliente cliente = clienteService.crearOActualizarCliente(contactRequest, usuario);
            System.out.println("✅ Cliente procesado: " + cliente.getNombres());
            
            // 3. Verificar venta existente
            System.out.println("🔍 Verificando ventas existentes...");
            Optional<Venta> ventaExistente = ventaRepository.findByClienteIdAndAutoId(cliente.getId(), auto.getId());
            if (ventaExistente.isPresent()) {
                System.out.println("❌ VENTA EXISTENTE: " + ventaExistente.get().getId());
                throw new RuntimeException("Ya existe una solicitud de contacto pendiente para este auto");
            }
            
            // 4. Crear venta
            System.out.println("🔍 Creando nueva venta...");
            Venta venta = new Venta();
            venta.setCliente(cliente);
            venta.setAuto(auto);
            venta.setEstado(EstadoVenta.PENDIENTE);
            
            Venta ventaGuardada = ventaRepository.save(venta);
            System.out.println("✅ Venta creada exitosamente: " + ventaGuardada.getId());
            
            return ventaGuardada;
            
        } catch (Exception e) {
            System.out.println("❌ ERROR CRÍTICO: " + e.getMessage());
            e.printStackTrace(); // 🔥 ESTO ES CLAVE - muestra la línea exacta del error
            throw e;
        }
    }
    public List<Venta> obtenerVentasPorCliente(Long usuarioId) {
        return ventaRepository.findByClienteUsuarioId(usuarioId);
    }
    
    public List<Venta> obtenerTodasLasVentas() {
        return ventaRepository.findAllByOrderByFechaSolicitudDesc();
    }
    
    public List<Venta> obtenerVentasPorEstado(EstadoVenta estado) {
        return ventaRepository.findByEstado(estado);
    }
    
    public Venta actualizarEstadoVenta(Long ventaId, EstadoVenta nuevoEstado) {
        Venta venta = ventaRepository.findById(ventaId)
            .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        
        EstadoVenta estadoAnterior = venta.getEstado();
        venta.setEstado(nuevoEstado);
        
        // ✅ GESTIÓN AUTOMÁTICA DE DISPONIBILIDAD DEL AUTO
        gestionarDisponibilidadAuto(venta, estadoAnterior, nuevoEstado);
        
        return ventaRepository.save(venta);
    }
    
    // ✅ NUEVO MÉTODO PARA GESTIONAR DISPONIBILIDAD
    private void gestionarDisponibilidadAuto(Venta venta, EstadoVenta estadoAnterior, EstadoVenta nuevoEstado) {
        Auto auto = venta.getAuto();
        
        // Si la venta se FINALIZA o CANCELA, LIBERAR el auto
        if ((nuevoEstado == EstadoVenta.FINALIZADO || nuevoEstado == EstadoVenta.CANCELADO) 
            && estadoAnterior == EstadoVenta.PENDIENTE) {
            auto.setDisponible(true);
            autoRepository.save(auto);
        }
        
        // Si se REACTIVA una venta (vuelve a PENDIENTE), BLOQUEAR el auto
        if (nuevoEstado == EstadoVenta.PENDIENTE && estadoAnterior != EstadoVenta.PENDIENTE) {
            // Verificar que el auto no esté ya bloqueado por otra venta pendiente
            boolean existeOtraVentaPendiente = ventaRepository.findByAutoId(auto.getId())
                .stream()
                .anyMatch(v -> v.getEstado() == EstadoVenta.PENDIENTE && !v.getId().equals(venta.getId()));
            
            if (!existeOtraVentaPendiente) {
                auto.setDisponible(false);
                autoRepository.save(auto);
            }
        }
    }
    
    public VentaResponse convertirAVentaResponse(Venta venta) {
        VentaResponse dto = new VentaResponse();
        dto.setId(venta.getId());
        dto.setClienteNombre(venta.getCliente().getNombres());
        dto.setClienteApellidos(venta.getCliente().getApellidos());
        dto.setClienteDni(venta.getCliente().getDni());
        dto.setClienteTelefono(venta.getCliente().getTelefono());
        dto.setClienteDireccion(venta.getCliente().getDireccion());
        dto.setAutoId(venta.getAuto().getId());
        dto.setAutoMarca(venta.getAuto().getMarca());
        dto.setAutoModelo(venta.getAuto().getModelo());
        dto.setAutoAnio(venta.getAuto().getAnio());
        dto.setAutoPrecio(venta.getAuto().getPrecio());
        dto.setEstado(venta.getEstado().name());
        dto.setFechaSolicitud(venta.getFechaSolicitud());
        dto.setFechaActualizacion(venta.getFechaActualizacion());
        
        return dto;
    }
    
    public List<VentaResponse> convertirListaAVentaResponse(List<Venta> ventas) {
        return ventas.stream()
            .map(this::convertirAVentaResponse)
            .collect(Collectors.toList());
    }



     // ✅ NUEVO MÉTODO: Verificar si un usuario tiene ventas activas
    public boolean tieneVentasActivas(Long usuarioId) {
        // Buscar cliente asociado al usuario
        Optional<Cliente> cliente = clienteService.obtenerClientePorUsuarioId(usuarioId);
        
        if (cliente.isPresent()) {
            // Verificar si el cliente tiene ventas pendientes
            List<Venta> ventasPendientes = ventaRepository.findByClienteIdAndEstado(
                cliente.get().getId(), EstadoVenta.PENDIENTE);
            return !ventasPendientes.isEmpty();
        }
        
        return false;
    }


}
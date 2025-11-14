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
            
            // ✅ Verificar que el auto esté disponible
            if (!auto.getDisponible()) {
                throw new RuntimeException("El auto no está disponible para venta");
            }
            
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
            
            // 5. ✅ ACTUALIZAR DISPONIBILIDAD DEL AUTO AUTOMÁTICAMENTE
            actualizarDisponibilidadAuto(auto.getId());
            
            return ventaGuardada;
            
        } catch (Exception e) {
            System.out.println("❌ ERROR CRÍTICO: " + e.getMessage());
            e.printStackTrace();
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
        
        Venta ventaActualizada = ventaRepository.save(venta);
        
        // ✅ ACTUALIZAR DISPONIBILIDAD DEL AUTO DESPUÉS DE CAMBIAR ESTADO
        actualizarDisponibilidadAuto(venta.getAuto().getId());
        
        return ventaActualizada;
    }
    
    // ✅ NUEVO MÉTODO PARA ACTUALIZAR DISPONIBILIDAD DEL AUTO
    private void actualizarDisponibilidadAuto(Long autoId) {
        Auto auto = autoRepository.findById(autoId)
            .orElseThrow(() -> new RuntimeException("Auto no encontrado"));
        
        // Verificar si el auto tiene ventas pendientes
        List<Venta> ventasDelAuto = ventaRepository.findByAutoId(autoId);
        boolean tieneVentasPendientes = ventasDelAuto.stream()
                .anyMatch(v -> v.getEstado() == EstadoVenta.PENDIENTE);
        
        // Si tiene ventas pendientes, el auto NO debe estar disponible
        // Si no tiene ventas pendientes, el auto SÍ debe estar disponible
        boolean nuevaDisponibilidad = !tieneVentasPendientes;
        
        // Solo actualizar si cambió la disponibilidad
        if (auto.getDisponible() != nuevaDisponibilidad) {
            auto.setDisponible(nuevaDisponibilidad);
            autoRepository.save(auto);
            
            System.out.println("🔄 Auto ID: " + auto.getId() + 
                              " - Nueva disponibilidad: " + auto.getDisponible() + 
                              " - Ventas pendientes: " + tieneVentasPendientes);
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

    // ✅ MÉTODO: Verificar si un usuario tiene ventas activas
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
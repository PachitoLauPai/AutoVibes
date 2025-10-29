package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.EstadoVenta;
import com.ventadeautos.backend.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByClienteUsuarioId(Long usuarioId);
    List<Venta> findByEstado(EstadoVenta estado);
    List<Venta> findByAutoId(Long autoId);
    Optional<Venta> findByClienteIdAndAutoId(Long clienteId, Long autoId);
    List<Venta> findAllByOrderByFechaSolicitudDesc();
    List<Venta> findByClienteIdAndEstado(Long clienteId, EstadoVenta estado);
}
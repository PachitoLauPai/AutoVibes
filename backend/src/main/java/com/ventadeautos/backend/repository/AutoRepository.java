package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Auto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AutoRepository extends JpaRepository<Auto, Long> {
    
    List<Auto> findByDisponibleTrue();
    List<Auto> findByModeloContainingIgnoreCase(String modelo);
    
    // Consultas con marca
    List<Auto> findByMarcaIdAndDisponibleTrue(Long marcaId);
    List<Auto> findByMarcaNombreContainingIgnoreCaseAndDisponibleTrue(String marcaNombre);
    
    List<Auto> findByCategoriaIdAndDisponibleTrue(Long categoriaId);
    List<Auto> findByCondicionIdAndDisponibleTrue(Long condicionId);
    List<Auto> findByCombustibleIdAndDisponibleTrue(Long combustibleId);
    List<Auto> findByTransmisionIdAndDisponibleTrue(Long transmisionId);
    
    // ✅ NUEVO: Consultas combinadas
    List<Auto> findByCategoriaIdAndCondicionIdAndDisponibleTrue(Long categoriaId, Long condicionId);
    List<Auto> findByMarcaIdAndCategoriaIdAndDisponibleTrue(Long marcaId, Long categoriaId);
    List<Auto> findByMarcaIdAndCondicionIdAndDisponibleTrue(Long marcaId, Long condicionId);

    List<Auto> findByDisponibleFalse();
    
    // ✅ NUEVO: Métodos faltantes para el servicio
    List<Auto> findByCategoriaIdAndCombustibleIdAndDisponibleTrue(Long categoriaId, Long combustibleId);
    
    @Query("SELECT a FROM Auto a WHERE " +
           "(:marcaId IS NULL OR a.marca.id = :marcaId) AND " +
           "(:categoriaId IS NULL OR a.categoria.id = :categoriaId) AND " +
           "(:condicionId IS NULL OR a.condicion.id = :condicionId) AND " +
           "(:combustibleId IS NULL OR a.combustible.id = :combustibleId) AND " +
           "(:transmisionId IS NULL OR a.transmision.id = :transmisionId) AND " +
           "a.disponible = true")
    List<Auto> findByFiltros(@Param("marcaId") Long marcaId,
                            @Param("categoriaId") Long categoriaId,
                            @Param("condicionId") Long condicionId,
                            @Param("combustibleId") Long combustibleId,
                            @Param("transmisionId") Long transmisionId);
    
    @Query("SELECT a FROM Auto a WHERE a.disponible = true AND " +
           "NOT EXISTS (SELECT v FROM Venta v WHERE v.auto = a AND v.estado.nombre = 'PENDIENTE')")
    List<Auto> findAutosDisponiblesSinVentasPendientes();
    
    @Query("SELECT a FROM Auto a WHERE EXISTS (SELECT v FROM Venta v WHERE v.auto = a AND v.estado.nombre = 'PENDIENTE')")
    List<Auto> findAutosConVentasPendientes();
    
    // ✅ NUEVO: Cargar auto con todas las relaciones
    @Query("SELECT a FROM Auto a LEFT JOIN FETCH a.marca LEFT JOIN FETCH a.categoria LEFT JOIN FETCH a.condicion LEFT JOIN FETCH a.combustible LEFT JOIN FETCH a.transmision WHERE a.id = :id")
    Optional<Auto> findByIdWithMarca(@Param("id") Long id);
    
    // ✅ NUEVO: Cargar todos los autos con relaciones
    @Query("SELECT a FROM Auto a LEFT JOIN FETCH a.marca LEFT JOIN FETCH a.categoria LEFT JOIN FETCH a.condicion")
    List<Auto> findAllWithRelations();
}

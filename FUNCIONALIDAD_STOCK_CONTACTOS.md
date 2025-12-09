# 🚗 Funcionalidad de Stock Vinculado a Estados de Venta

## 📋 Descripción General

Se ha implementado un sistema de **control automático de stock** que se vincula directamente con los estados de las fichas de contacto. Cuando un cliente elige un auto y el administrador marca la venta como "FINALIZADA" o "CANCELADA", el stock se actualiza automáticamente.

---

## 🔄 Flujo de Funcionamiento

### 1️⃣ Estados Disponibles en Contactos

```
PENDIENTE          → Contacto nuevo, sin procesar
EN_PROCESO         → Contacto leído, en negociación
VENTA_FINALIZADA   → Venta completada (stock disminuye)
CANCELADO          → Venta cancelada (stock se recupera)
```

### 2️⃣ Cambios de Stock Automáticos

#### **Caso 1: De cualquier estado a VENTA_FINALIZADA**
```
Acción: Marcar venta como FINALIZADA
Resultado: Stock del auto se DISMINUYE en 1 unidad
Ejemplo:
  - Auto: Toyota Corolla
  - Stock anterior: 5 unidades
  - Stock después: 4 unidades
  - Notificación: "Stock del auto disminuido a: 4 unidades"
```

#### **Caso 2: De VENTA_FINALIZADA a CANCELADO**
```
Acción: Cambiar de VENTA_FINALIZADA a CANCELADO
Resultado: Stock del auto se RECUPERA en 1 unidad
Ejemplo:
  - Auto: Toyota Corolla
  - Stock anterior: 4 unidades (vendido)
  - Stock después: 5 unidades (recuperado)
  - Notificación: "Stock del auto recuperado a: 5 unidades"
```

#### **Caso 3: De CANCELADO a VENTA_FINALIZADA**
```
Acción: Cambiar de CANCELADO a VENTA_FINALIZADA
Resultado: Stock del auto se DISMINUYE nuevamente en 1 unidad
Ejemplo:
  - Auto: Toyota Corolla
  - Stock anterior: 5 unidades (recuperado)
  - Stock después: 4 unidades (vendido nuevamente)
  - Notificación: "Stock del auto disminuido a: 4 unidades"
```

#### **Caso 4: Cambios entre PENDIENTE/EN_PROCESO/CANCELADO**
```
Acción: No hay stock involucrado (venta no finalizada)
Resultado: Stock no cambia
Ejemplo:
  - De PENDIENTE a EN_PROCESO → Sin cambio de stock
  - De EN_PROCESO a PENDIENTE → Sin cambio de stock
  - De EN_PROCESO a CANCELADO → Sin cambio de stock (nunca fue finalizada)
```

---

## 🎯 Cómo Usar la Funcionalidad

### En el Panel de Contactos (Admin)

1. **Abrir detalles del contacto**
   - Haz clic en "Ver Detalles" en la tarjeta del contacto

2. **Ver estado actual de la venta**
   - Se muestra con un badge de color:
     - 🟡 **Amarillo (PENDIENTE)**: Contacto sin procesar
     - 🔵 **Azul (EN_PROCESO)**: En negociación
     - 🟢 **Verde (VENTA_FINALIZADA)**: Venta completada
     - 🔴 **Rojo (CANCELADO)**: Venta cancelada

3. **Ver información del auto**
   - Se muestra el modelo, año, precio, etc.
   - **Nuevo**: Se muestra el **Stock Disponible** con badge de color:
     - 🟢 **Verde**: Stock alto (> 5 unidades)
     - 🟡 **Amarillo**: Stock medio (2-5 unidades)
     - 🔴 **Rojo**: Stock bajo (< 2 unidades)

4. **Cambiar estado de la venta**
   - Haz clic en "Cambiar" al lado del estado
   - Selecciona el nuevo estado del dropdown
   - Haz clic en "Guardar"
   - El stock se actualiza automáticamente según el cambio

5. **Confirmación**
   - Se muestra una alerta con el mensaje de cambio
   - Si afecta el stock, verás: "Stock del auto [disminuido/recuperado] a: X unidades"

---

## 🔧 Detalles Técnicos

### Backend

**Archivo**: `ContactService.java`

**Método modificado**: `actualizarEstado()`
```java
public Contact actualizarEstado(Long id, String nuevoEstado) {
    // Obtiene el contacto y su auto asociado
    Contact contact = obtenerContactoPorId(id);
    Auto auto = contact.getAuto();
    
    // Lógica:
    // 1. Si cambia a VENTA_FINALIZADA y NO era FINALIZADA: stock--
    // 2. Si cambia de VENTA_FINALIZADA a CANCELADO: stock++
    // 3. Si cambia de CANCELADO a VENTA_FINALIZADA: stock--
    // 4. Otros cambios: sin afectar stock
    
    // Guarda cambios en auto y contacto
    autoRepository.save(auto);
    return contactRepository.save(contact);
}
```

**Nuevo endpoint**: `PUT /api/contact/admin/{id}/cambiar-estado-venta`
```
Petición:
{
  "estado": "VENTA_FINALIZADA",
  "estadoAnterior": "EN_PROCESO"
}

Respuesta:
{
  "mensaje": "Estado actualizado y stock ajustado correctamente",
  "contactoId": 5,
  "estadoAnterior": "EN_PROCESO",
  "estadoNuevo": "VENTA_FINALIZADA",
  "autoId": 1,
  "nuevoStock": 4
}
```

### Frontend

**Archivo**: `contact-list.ts`

**Método actualizado**: `guardarNuevoEstado()`
```typescript
guardarNuevoEstado(contacto: Contact): void {
    // 1. Obtiene el nuevo estado seleccionado
    // 2. Llama al endpoint cambiar-estado-venta
    // 3. Recibe la respuesta con el nuevo stock
    // 4. Muestra una alerta con la información de cambio
    // 5. Recarga los contactos para sincronizar
}
```

**HTML actualizado**: Agregada sección de Stock en el modal de detalles
```html
<div class="spec-item">
  <span class="spec-label">Stock Disponible:</span>
  <span class="spec-value stock-badge" 
        [ngClass]="{'stock-high': ..., 'stock-medium': ..., 'stock-low': ...}">
    {{ selectedContact.auto.stock }} unidades
  </span>
</div>
```

---

## 📊 Ejemplos Prácticos

### Ejemplo 1: Nueva Venta
```
Contacto: Juan Pérez - Toyota Corolla
1. Cambiar estado de PENDIENTE a EN_PROCESO
   → Stock: sin cambios (5 unidades)
   
2. Cambiar estado de EN_PROCESO a VENTA_FINALIZADA
   → Stock: DISMINUYE (5 → 4 unidades)
   → Alerta: "Stock del auto disminuido a: 4 unidades"
```

### Ejemplo 2: Cancelación y Reasignación
```
Contacto: María López - Honda Civic
1. Estado actual: VENTA_FINALIZADA
   → Stock actual: 2 unidades
   
2. Cambiar a CANCELADO
   → Stock: AUMENTA (2 → 3 unidades)
   → Alerta: "Stock del auto recuperado a: 3 unidades"
   
3. Reasignar a otro cliente, cambiar a VENTA_FINALIZADA
   → Stock: DISMINUYE (3 → 2 unidades)
   → Alerta: "Stock del auto disminuido a: 2 unidades"
```

### Ejemplo 3: Cambios sin afectar stock
```
Contacto: Carlos García - Ford Mustang
1. Cambiar de PENDIENTE a EN_PROCESO
   → Stock: sin cambios (2 unidades)
   
2. Cambiar de EN_PROCESO a CANCELADO
   → Stock: sin cambios (2 unidades, porque nunca fue FINALIZADA)
```

---

## ⚠️ Consideraciones Importantes

1. **Stock no puede ser negativo**
   - Si intentas finalizar una venta sin stock disponible, se muestra un warning
   - El sistema evita que el stock sea negativo

2. **Sincronización en tiempo real**
   - El frontend recarga los contactos después de cada cambio
   - La información del auto se actualiza automáticamente

3. **Auditoría**
   - Los cambios se registran en los logs del servidor
   - Se puede ver qué auto y cuándo se cambió el stock

4. **Transacciones**
   - Las operaciones están marcadas con `@Transactional`
   - Se garantiza que stock y estado se actualizan juntos

---

## 🧪 Prueba la Funcionalidad

### Pasos para probar:

1. **Accede al panel de Admin**
2. **Ve a Gestión de Contactos**
3. **Selecciona un contacto con auto asociado**
4. **Haz clic en "Ver Detalles"**
5. **Verifica el stock actual en la sección "Vehículo de Interés"**
6. **Cambia el estado a "Venta Finalizada"**
7. **Confirma el cambio y verifica el stock disminuyó**
8. **Cambia nuevamente a "Cancelado"**
9. **Confirma el cambio y verifica el stock se recuperó**

---

## 📝 Resumen de Cambios

| Componente | Cambio |
|---|---|
| **ContactService.java** | Método `actualizarEstado()` con lógica de stock |
| **ContactController.java** | Nuevo endpoint `cambiar-estado-venta` |
| **contact.service.ts** | Nuevo método `cambiarEstadoVenta()` |
| **contact-list.ts** | Método `guardarNuevoEstado()` mejorado |
| **contact-list.html** | Sección de stock en modal de detalles |
| **contact-list.css** | Estilos para badges de stock |

---

## 🎉 Resultado

Ahora tienes un sistema **integrado y automático** donde:
- ✅ Los estados de venta están vinculados con el stock
- ✅ El stock se actualiza automáticamente al cambiar estados
- ✅ El admin puede ver el stock disponible de cada auto
- ✅ Las operaciones están protegidas y auditadas
- ✅ El sistema mantiene la integridad de datos

¡Tu sistema de gestión de concesionaria ahora es más completo y funcional! 🚗


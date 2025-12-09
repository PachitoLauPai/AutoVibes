# 🧪 GUÍA DE TESTING: Stock Vinculado a Contactos

## 📋 Plan de Testing

### Objetivos
- Verificar que el stock se actualiza cuando cambia el estado de venta
- Verificar que las notificaciones se muestran correctamente
- Verificar que la integridad de datos se mantiene
- Verificar que los cambios son reversibles

---

## ✅ TEST 1: Venta Nueva (Disminución de Stock)

### Precondiciones
- [ ] Backend ejecutándose
- [ ] Frontend ejecutándose
- [ ] Admin logueado

### Pasos

1. **Navegar a Gestión de Contactos**
   ```
   Menú Admin → Gestión de Contactos
   ```
   ✓ Debes ver la lista de contactos

2. **Seleccionar un contacto con auto asociado**
   ```
   Ejemplo: "Juan Pérez - Toyota Corolla"
   Estado actual: "PENDIENTE" o "EN_PROCESO"
   ```
   ✓ Debes ver el contacto en la lista

3. **Hacer clic en "Ver Detalles"**
   ```
   Botón: [👁️ Ver Detalles]
   ```
   ✓ Se abre modal con detalles completos

4. **Anotar Stock Actual**
   ```
   En la sección "Vehículo de Interés"
   Buscar: "📦 Stock Disponible: X unidades"
   Anotar el número: ___________
   ```
   ✓ Stock visible en el modal
   ✓ Debe tener un color (verde/amarillo/rojo)

5. **Cambiar Estado a VENTA_FINALIZADA**
   ```
   1. Ir a sección "Estado de la Venta"
   2. Clic en [Cambiar]
   3. Select: "VENTA_FINALIZADA"
   4. Clic en [Guardar]
   ```
   ✓ Se envía petición al backend

6. **Verificar Alerta**
   ```
   Debe aparecer alerta con mensaje:
   "Stock del auto disminuido a: X unidades"
   
   Donde X = stock anterior - 1
   ```
   ✓ Alerta con información correcta

7. **Verificar Cambio en Modal**
   ```
   Después de cerrar alerta:
   - Estado: ✅ VENTA_FINALIZADA (cambió)
   - Stock: X-1 unidades (disminuyó)
   - Color del badge: Puede haber cambiado
   ```
   ✓ Todos los cambios visibles

8. **Ir a Gestión de Autos para Verificar**
   ```
   Menú Admin → Gestión de Autos
   Buscar el auto (ej: Toyota Corolla)
   Verificar stock en tarjeta
   ```
   ✓ Stock en Autos coincide con Contactos

### Resultado Esperado
```
✅ Stock disminuyó en exactamente 1 unidad
✅ Estado cambió a VENTA_FINALIZADA
✅ Alerta se mostró con información correcta
✅ Valores sincronizados en todos lados
```

---

## ✅ TEST 2: Cancelación de Venta (Recuperación de Stock)

### Precondiciones
- [ ] Contacto con VENTA_FINALIZADA (del test anterior)
- [ ] Admin logueado

### Pasos

1. **Abrir Detalles del Mismo Contacto**
   ```
   Gestión de Contactos → Ver Detalles
   ```
   ✓ Modal abierto

2. **Anotar Stock Actual**
   ```
   Stock actual: ___________
   (Debe ser el disminuido del test anterior)
   ```
   ✓ Stock visible

3. **Cambiar Estado a CANCELADO**
   ```
   1. Ir a sección "Estado de la Venta"
   2. Clic en [Cambiar]
   3. Select: "CANCELADO"
   4. Clic en [Guardar]
   ```
   ✓ Se envía petición al backend

4. **Verificar Alerta**
   ```
   Debe aparecer alerta con mensaje:
   "Stock del auto recuperado a: X unidades"
   
   Donde X = stock anterior + 1
   (Debes regresar al stock original)
   ```
   ✓ Alerta con información correcta

5. **Verificar Cambio en Modal**
   ```
   - Estado: 🔴 CANCELADO (cambió)
   - Stock: X+1 unidades (aumentó)
   - Color del badge: Cambió a color original
   ```
   ✓ Stock recuperado a su valor original

6. **Verificar en Gestión de Autos**
   ```
   Gestión de Autos → Buscar auto
   Stock debe haber vuelto al original
   ```
   ✓ Sincronizado correctamente

### Resultado Esperado
```
✅ Stock aumentó en exactamente 1 unidad
✅ Stock volvió al valor original
✅ Estado cambió a CANCELADO
✅ Alerta informó de "recuperación"
```

---

## ✅ TEST 3: Cambios sin Afectar Stock

### Precondiciones
- [ ] Contacto con estado PENDIENTE
- [ ] Admin logueado
- [ ] Anotar stock actual

### Pasos

1. **Abrir Detalles del Contacto**
   ```
   Estado: ⏳ PENDIENTE
   Stock: __________ (anotar)
   ```

2. **Cambiar a EN_PROCESO**
   ```
   1. [Cambiar]
   2. Select: EN_PROCESO
   3. [Guardar]
   ```

3. **Verificar Stock NO Cambió**
   ```
   Stock debe ser el mismo (sin cambios)
   NO debe haber alerta de stock
   Solo cambio de estado
   ```
   ✓ Stock igual

4. **Cambiar a CANCELADO**
   ```
   1. [Cambiar]
   2. Select: CANCELADO
   3. [Guardar]
   ```

5. **Verificar Stock SIGUE igual**
   ```
   Stock debe ser idéntico al original
   NO se recuperó ni disminuyó
   Porque nunca pasó por VENTA_FINALIZADA
   ```
   ✓ Stock sin cambios

### Resultado Esperado
```
✅ Estados cambian sin afectar stock
✅ Stock se mantiene igual
✅ Solo cambia cuando afecta VENTA_FINALIZADA
```

---

## ✅ TEST 4: Reactivación de Venta

### Precondiciones
- [ ] Contacto con estado CANCELADO (del test 2)
- [ ] Stock en valor recuperado

### Pasos

1. **Abrir Detalles**
   ```
   Estado: 🔴 CANCELADO
   Stock: X unidades (recuperado)
   ```

2. **Cambiar a EN_PROCESO**
   ```
   1. [Cambiar]
   2. Select: EN_PROCESO
   3. [Guardar]
   ```
   ✓ Estado cambió, stock igual

3. **Cambiar a VENTA_FINALIZADA**
   ```
   1. [Cambiar]
   2. Select: VENTA_FINALIZADA
   3. [Guardar]
   ```

4. **Verificar Stock Disminuyó**
   ```
   Alerta: "Stock del auto disminuido a: X-1"
   Stock cambió de: X → X-1
   ```
   ✓ Stock disminuyó nuevamente

### Resultado Esperado
```
✅ Venta reactivada correctamente
✅ Stock se disminuyó nuevamente
✅ Sistema permite reactivaciones
```

---

## ✅ TEST 5: Cambios Múltiples

### Precondiciones
- [ ] Contacto con cualquier estado
- [ ] Anotar stock original

### Pasos

**Secuencia de cambios:**
```
1. PENDIENTE → EN_PROCESO
   Stock: sin cambios ✓

2. EN_PROCESO → VENTA_FINALIZADA
   Stock: disminuye (-1)
   Alerta: "disminuido"

3. VENTA_FINALIZADA → CANCELADO
   Stock: aumenta (+1)
   Alerta: "recuperado"

4. CANCELADO → EN_PROCESO
   Stock: sin cambios ✓

5. EN_PROCESO → VENTA_FINALIZADA
   Stock: disminuye (-1) nuevamente
   Alerta: "disminuido"

6. VENTA_FINALIZADA → CANCELADO
   Stock: aumenta (+1)
   Alerta: "recuperado"
```

### Verificación Final
```
Stock debe ser igual al original
(Si inicio con 5, termina con 5)

Porque:
- Disminuyó: 5 → 4
- Recuperó: 4 → 5
- Disminuyó: 5 → 4
- Recuperó: 4 → 5
```

### Resultado Esperado
```
✅ Cambios múltiples funcionan correctamente
✅ Stock se calcula correctamente en cada transición
✅ Sistema es reversible
```

---

## ✅ TEST 6: Validación de Datos

### Verificar Consistencia

1. **En Contactos**
   ```
   Anotar:
   - Contacto ID: ___
   - Auto ID: ___
   - Stock mostrado: ___
   - Estado: ___
   ```

2. **En Autos**
   ```
   Buscar el mismo auto por ID
   Anotar:
   - Stock en tarjeta: ___
   - Debe ser igual al de Contactos
   ```

3. **Base de Datos (opcional)**
   ```
   SELECT c.id, c.auto_id, a.stock, c.estado
   FROM contactos c
   JOIN autos a ON c.auto_id = a.id;
   
   Verificar que stocks coinciden
   ```

### Resultado Esperado
```
✅ Todos los valores sincronizados
✅ No hay inconsistencias
✅ BD está actualizada
```

---

## ✅ TEST 7: Notificaciones y UI

### Verificar Alertas

1. **Cuando disminuye stock**
   ```
   Alerta debe mostrar:
   ✓ "Estado actualizado y stock ajustado correctamente"
   ✓ "Stock del auto disminuido a: X unidades"
   ✓ Número correcto de unidades
   ```

2. **Cuando aumenta stock**
   ```
   Alerta debe mostrar:
   ✓ "Estado actualizado y stock ajustado correctamente"
   ✓ "Stock del auto recuperado a: X unidades"
   ✓ Número correcto de unidades
   ```

3. **Badges de Color**
   ```
   Verde (🟢): Stock > 5
   Amarillo (🟡): Stock 2-5
   Rojo (🔴): Stock < 2
   
   Verificar que cambian correctamente
   ```

### Resultado Esperado
```
✅ Alertas claras y precisas
✅ Colores actualizan correctamente
✅ Información es útil y veraz
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: Stock no disminuye
```
Causa: Posible error en backend
Solución:
1. Revisar logs del servidor
2. Verificar que ContactService.actualizarEstado() es llamado
3. Verificar conexión a BD
4. Recompilación y reinicio
```

### Problema 2: Alerta no se muestra
```
Causa: Error en frontend
Solución:
1. Revisar consola del navegador (F12)
2. Ver si hay errores JavaScript
3. Verificar que guardarNuevoEstado() existe
4. Limpiar caché del navegador
```

### Problema 3: Stock diferente en Contactos y Autos
```
Causa: BD desincronizada
Solución:
1. Recargar página
2. Hacer cambio de estado para resincronizar
3. Si persiste, revisar BD directamente
4. Posible problema de transacciones
```

### Problema 4: No ve el botón "Cambiar"
```
Causa: Versión antigua cargada
Solución:
1. Limpiar caché (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+Shift+R)
3. Cerrar y reabrir navegador
4. Verificar que archivos HTML están actualizados
```

---

## 📊 Checklist de Testing Completo

```
TEST 1: Venta Nueva
 ☐ Stock disminuyó
 ☐ Alerta mostró "disminuido"
 ☐ Estado cambió a FINALIZADA
 ☐ Sincronizado en Autos

TEST 2: Cancelación
 ☐ Stock aumentó
 ☐ Alerta mostró "recuperado"
 ☐ Estado cambió a CANCELADO
 ☐ Stock volvió al original

TEST 3: Cambios sin Stock
 ☐ PENDIENTE → EN_PROCESO (sin cambios)
 ☐ EN_PROCESO → CANCELADO (sin cambios)
 ☐ Stock se mantuvo igual

TEST 4: Reactivación
 ☐ CANCELADO → VENTA_FINALIZADA
 ☐ Stock disminuyó nuevamente
 ☐ Alerta funcionó

TEST 5: Cambios Múltiples
 ☐ Secuencia completa funcionó
 ☐ Stock volvió al original al final
 ☐ Cada transición correcta

TEST 6: Validación de Datos
 ☐ Contactos y Autos sincronizados
 ☐ BD consistente
 ☐ No hay valores anómalos

TEST 7: Notificaciones y UI
 ☐ Alertas claras
 ☐ Badges de color correctos
 ☐ UI responsiva

PROBLEMAS:
 ☐ Sin errores en consola
 ☐ Sin excepciones en backend
 ☐ Logs limpios
```

---

## 🎯 Resultado Final del Testing

```
Si todos los tests pasaron: ✅ SISTEMA FUNCIONAL

¿Qué prueba esto?
✓ Stock se actualiza automáticamente
✓ Cambios se detectan correctamente
✓ Integridad de datos se mantiene
✓ Notificaciones funcionan
✓ Sistema es reversible
✓ UI es responsive
✓ Listo para producción
```

---

## 📝 Reporte de Testing

### Usar este formato para documentar:

```
REPORTE DE TESTING: Stock Vinculado a Contactos
Fecha: [DD/MM/YYYY]
Tester: [Tu nombre]

RESULTADO GENERAL: [APROBADO/FALLIDO]

TEST 1: [APROBADO/FALLIDO]
Observaciones: ___________

TEST 2: [APROBADO/FALLIDO]
Observaciones: ___________

...

PROBLEMAS ENCONTRADOS:
1. [Descripción]
   Solución: [Acción tomada]

2. [Descripción]
   Solución: [Acción tomada]

CONCLUSIÓN:
[Sistema funcional / Requiere ajustes]

Firma: ___________
```

---

**¡Listo para testear!** 🚀

Cualquier problema, revisa los logs y la documentación técnica.


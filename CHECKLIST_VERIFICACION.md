# ✅ CHECKLIST DE VERIFICACIÓN - Sistema de Contactos

## 📋 Verificación Previa a Inicio

Antes de iniciar los servidores, verifica esto:

### Backend (Java/Spring Boot)

- [x] `Contact.java` tiene campo `estado`
- [x] `Contact.java` tiene relación `@ManyToOne` con Auto
- [x] `ContactRequest.java` tiene campo `dni`
- [x] `ContactRequest.java` tiene campo `estado`
- [x] `ContactController.java` tiene endpoint PUT `/admin/{id}/actualizar-estado`
- [x] `ContactService.java` tiene método `actualizarEstado()`
- [x] `ContactService.java` tiene método `obtenerContactosPorEstado()`
- [x] `ContactService.java` valida estados (PENDIENTE, EN_PROCESO, VENTA_FINALIZADA, CANCELADO)
- [x] `ContactRepository.java` tiene método `findByEstado()`
- [x] **Backend compila**: `mvn compile -q` ✅ PASADO

### Frontend (Angular/TypeScript)

- [x] `contact.service.ts` tiene interfaz `ContactRequest` con `dni` y `estado`
- [x] `contact.service.ts` tiene interfaz `Contact` con `auto` y `estado`
- [x] `contact.service.ts` tiene método `actualizarEstado()`
- [x] `auto-detail.ts` guarda contacto ANTES de abrir WhatsApp
- [x] `auto-detail.ts` agrega prefijo "+51" al teléfono
- [x] `contact-list.ts` tiene interfaz `Auto` con todos los campos
- [x] `contact-list.ts` tiene propiedades `editingStatus` y `newStatus`
- [x] `contact-list.ts` tiene métodos: `iniciarEdicionEstado()`, `guardarNuevoEstado()`, `cancelarEdicionEstado()`
- [x] `contact-list.ts` tiene métodos: `getEstadoBadgeClass()`, `getEstadoLabel()`, `getImagenAuto()`
- [x] `contact-list.html` muestra tarjeta de auto con imagen
- [x] `contact-list.html` tiene sección de estado con botón "Cambiar Estado"
- [x] `contact-list.html` muestra detalles completos del vehículo en modal
- [x] `contact-list.css` tiene estilos para badges (warning, info, success, danger)
- [x] `contact-list.css` tiene estilos para sección de estado
- [x] `contact-list.css` tiene estilos para tarjeta de auto
- [x] **Frontend compila**: `npm run build` ✅ PASADO

### Documentación

- [x] `README_IMPLEMENTACION.md` - README principal
- [x] `IMPLEMENTACION_CONTACTOS_CON_ESTADO.md` - Resumen técnico
- [x] `GUIA_PRUEBA_CONTACTOS.md` - Guía de pruebas
- [x] `INSTRUCCIONES_TECNICAS.md` - Documentación técnica
- [x] `ESTADO_FINAL_IMPLEMENTACION.md` - Estado final
- [x] `RESUMEN_CAMBIOS_CODIGO.md` - Resumen de cambios
- [x] `VISTA_PREVIA_INTERFAZ.md` - Previsualizaciones

---

## 🚀 Verificación de Inicialización

### PASO 1: Iniciar Backend

```bash
cd backend
mvn spring-boot:run
```

**Verificar**:
- [ ] Aplicación inicia sin errores
- [ ] Ves mensaje: "Started Application in X.XXX seconds"
- [ ] En los logs NO hay errores críticos (warnings OK)
- [ ] Puerto 8080 está escuchando

**Logs esperados**:
```
2024-01-15 10:30:45.123  INFO Hibernate: create table contactos
2024-01-15 10:30:45.234  INFO Hibernate: alter table contactos add column estado varchar(50) not null
2024-01-15 10:30:46.789  INFO Tomcat started on port(s): 8080
2024-01-15 10:30:46.890  INFO Started Application in 1.234 seconds
```

**Si hay error**:
- ❌ Check: ¿MySQL está corriendo en localhost:3306?
- ❌ Check: ¿Usuario/contraseña en application.properties son correctos?
- ❌ Check: ¿Puerto 8080 está libre?

---

### PASO 2: Iniciar Frontend

```bash
cd frontend
npm start
```

**Verificar**:
- [ ] Compilación exitosa
- [ ] Server escucha en localhost:4200
- [ ] Ves mensaje: "Compiled successfully"
- [ ] NO hay errores en terminal (warnings OK)

**Si hay error**:
- ❌ Check: ¿Node.js está instalado? `node --version`
- ❌ Check: ¿npm está instalado? `npm --version`
- ❌ Check: ¿Carpeta node_modules existe? Si no: `npm install`

---

## 🧪 Prueba #1: Crear Contacto (Cliente)

### Objetivo
Verificar que un contacto se guarda en BD cuando el cliente presiona "Contactar"

### Pasos
1. [ ] Abre http://localhost:4200 en navegador
2. [ ] Ve a "Autos" → Lista de autos
3. [ ] Haz click en un auto
4. [ ] Haz click en botón "Contactar por WhatsApp"
5. [ ] Se abre modal con formulario
6. [ ] Rellena:
   - Nombre: `Test User`
   - DNI: `12345678`
   - Email: `test@example.com`
   - Teléfono: `987654321` (sin +51)
   - Mensaje: `Test message`
7. [ ] Haz click "Enviar"

### Verificación
- [ ] ✅ Se abre WhatsApp (puede no funcionar en desktop pero intenta)
- [ ] ✅ Ves alerta "¡Contacto guardado!"
- [ ] ✅ Modal se cierra
- [ ] ✅ NO hay errores en devtools (F12)

### En Base de Datos
Ejecuta en MySQL:
```sql
SELECT * FROM contactos WHERE nombre = 'Test User';
```

Deberías ver:
- [ ] ✅ 1 fila con los datos del contacto
- [ ] ✅ `estado` = `'PENDIENTE'`
- [ ] ✅ `auto_id` = ID del auto que seleccionaste
- [ ] ✅ `correo` = `test@example.com`
- [ ] ✅ `dni` = `12345678`

---

## 🧪 Prueba #2: Ver Contactos en Admin

### Objetivo
Verificar que el admin puede ver contactos en el panel

### Pasos
1. [ ] Ve a http://localhost:4200/admin/contact-list
2. [ ] (Si requiere login, usa credenciales admin)
3. [ ] Deberías ver lista de contactos

### Verificación
- [ ] ✅ Aparece el contacto que creaste en Prueba #1
- [ ] ✅ Se ve nombre: `Test User`
- [ ] ✅ Se ve badge 🟨 `Pendiente`
- [ ] ✅ Se ve tarjeta del auto con imagen y nombre
- [ ] ✅ NO hay errores en devtools (F12)

### Datos mostrados
Verifica que se ven estos datos:
- [ ] ✅ Nombre del cliente
- [ ] ✅ Email/correo
- [ ] ✅ DNI
- [ ] ✅ Teléfono
- [ ] ✅ Marca y modelo del auto
- [ ] ✅ Imagen del auto
- [ ] ✅ Estado actual

---

## 🧪 Prueba #3: Ver Detalles Completos

### Objetivo
Verificar que el modal muestra todos los detalles

### Pasos
1. [ ] En la lista de contactos, haz click en "Ver Detalles" de un contacto
2. [ ] Se abre modal con información completa

### Verificación Modal - Cliente
- [ ] ✅ Nombre completo del cliente
- [ ] ✅ DNI del cliente
- [ ] ✅ Email del cliente
- [ ] ✅ Teléfono del cliente
- [ ] ✅ Asunto
- [ ] ✅ Mensaje completo
- [ ] ✅ Fecha de creación

### Verificación Modal - Vehículo
- [ ] ✅ Imagen grande del auto
- [ ] ✅ Marca (ej: Toyota)
- [ ] ✅ Modelo (ej: Corolla)
- [ ] ✅ Año (ej: 2023)
- [ ] ✅ Color (ej: Blanco)
- [ ] ✅ Precio (ej: S/ 45,000)
- [ ] ✅ Combustible (ej: Gasolina)
- [ ] ✅ Transmisión (ej: Automática)
- [ ] ✅ Categoría (ej: Sedán)
- [ ] ✅ Condición (ej: Nuevo)

### Verificación Modal - Estado
- [ ] ✅ Se muestra estado actual con badge y color
- [ ] ✅ Botón "Cambiar Estado" visible

---

## 🧪 Prueba #4: Cambiar Estado

### Objetivo
Verificar que admin puede cambiar estado del contacto

### Pasos
1. [ ] Abre detalles de un contacto (Prueba #3)
2. [ ] Haz click en botón "Cambiar Estado"
3. [ ] Interfaz cambia a modo edición
4. [ ] Se ve dropdown con opciones:
   - [ ] ✅ Pendiente
   - [ ] ✅ En Proceso
   - [ ] ✅ Venta Finalizada
   - [ ] ✅ Cancelado
5. [ ] Selecciona "En Proceso"
6. [ ] Haz click "Guardar"

### Verificación Inmediata
- [ ] ✅ Ves alerta: "Estado actualizado exitosamente"
- [ ] ✅ Badge cambia a 🔵 azul "En Proceso"
- [ ] ✅ Modo edición se cierra
- [ ] ✅ NO hay errores en devtools

### Verificación en Base de Datos
Ejecuta:
```sql
SELECT id, nombre, estado FROM contactos WHERE nombre = 'Test User';
```

Deberías ver:
- [ ] ✅ `estado` = `'EN_PROCESO'`

### Verificación Visual en Lista
- [ ] ✅ Cierra modal
- [ ] ✅ Vuelves a la lista de contactos
- [ ] ✅ El contacto ahora muestra 🔵 "En Proceso"

---

## 🧪 Prueba #5: Todos los Estados

### Objetivo
Probar cambio a todos los estados posibles

### Pasos
Para un mismo contacto, cambia el estado a cada opción:

1. [ ] **PENDIENTE** 🟨
   - Cambiar a: PENDIENTE
   - [ ] ✅ Badge amarillo
   - [ ] ✅ BD actualizada
   
2. [ ] **EN_PROCESO** 🔵
   - Cambiar a: EN_PROCESO
   - [ ] ✅ Badge azul
   - [ ] ✅ BD actualizada
   
3. [ ] **VENTA_FINALIZADA** 🟢
   - Cambiar a: VENTA_FINALIZADA
   - [ ] ✅ Badge verde
   - [ ] ✅ BD actualizada
   
4. [ ] **CANCELADO** 🔴
   - Cambiar a: CANCELADO
   - [ ] ✅ Badge rojo
   - [ ] ✅ BD actualizada

---

## 🧪 Prueba #6: Filtro por Estado

### Objetivo
Verificar que el filtro funciona

### Pasos
1. [ ] En lista de contactos, ve dropdown "Filtro"
2. [ ] Selecciona "En Proceso"
3. [ ] Lista se filtra

### Verificación
- [ ] ✅ Solo se muestran contactos con estado "EN_PROCESO"
- [ ] ✅ Los demás contactos desaparecen
- [ ] ✅ Contador se actualiza

### Repite para otros estados
- [ ] ✅ Filtrar por: Pendiente
- [ ] ✅ Filtrar por: Venta Finalizada
- [ ] ✅ Filtrar por: Cancelado
- [ ] ✅ Filtrar por: Todos

---

## 🧪 Prueba #7: Búsqueda

### Objetivo
Verificar que la búsqueda funciona

### Pasos
1. [ ] En lista, ve campo "Buscar"
2. [ ] Escribe nombre parcial: "Test"
3. [ ] Lista se filtra

### Verificación
- [ ] ✅ Solo se muestran contactos cuyo nombre contiene "Test"
- [ ] ✅ Búsqueda es case-insensitive (funciona "test" y "TEST")

### Prueba con otros criterios
- [ ] ✅ Buscar por email: escribe "test@"
- [ ] ✅ Buscar por asunto: escribe parte del asunto

---

## 🧪 Prueba #8: Responsive Design

### Objetivo
Verificar que se ve bien en móvil

### Pasos (en Chrome DevTools)
1. [ ] Abre inspector (F12)
2. [ ] Click en "Toggle device toolbar" (Ctrl+Shift+M)
3. [ ] Selecciona tamaño "iPhone 12"
4. [ ] Recarga página (F5)

### Verificación
- [ ] ✅ Lista de contactos se ve bien
- [ ] ✅ Tarjetas se adaptan al ancho
- [ ] ✅ Modal es legible
- [ ] ✅ Botones son clickeables (> 48px)
- [ ] ✅ Imagen del auto se ve
- [ ] ✅ Scrolling horizontal NO hay

### Prueba en otros tamaños
- [ ] ✅ iPad (768px)
- [ ] ✅ Tablet (1024px)
- [ ] ✅ Desktop (1920px)

---

## 🧪 Prueba #9: Casos Extremos

### Contacto sin auto asociado
1. [ ] En BD, inserta contacto con `auto_id = NULL`
2. [ ] Recarga lista
3. [ ] [ ] ✅ Se muestra contacto
4. [ ] [ ] ✅ Se ve mensaje "Sin vehículo asociado"
5. [ ] [ ] ✅ No hay errores

### Auto sin imagen
1. [ ] Edita auto en BD: `imagenes = NULL`
2. [ ] Ve detalles de contacto
3. [ ] [ ] ✅ Se muestra placeholder en lugar de imagen
4. [ ] [ ] ✅ No hay error 404

### Contacto con mensaje muy largo
1. [ ] Crea contacto con mensaje de 500+ caracteres
2. [ ] Abre detalles
3. [ ] [ ] ✅ Se ve completo (scrollable si es necesario)
4. [ ] [ ] ✅ No rompe layout

---

## 🔍 Verificación de API (con curl)

### Test 1: GET todos los contactos
```bash
curl -X GET http://localhost:8080/api/contact/admin/todos \
  -H "Content-Type: application/json"
```

**Respuesta esperada**: 200 OK + JSON con array de contactos

### Test 2: POST nuevo contacto
```bash
curl -X POST http://localhost:8080/api/contact/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Test Contacto",
    "dni":"99999999",
    "correo":"test@example.com",
    "telefonoWhatsapp":"+51987654321",
    "asunto":"Test",
    "mensaje":"Test message",
    "autoId":5
  }'
```

**Respuesta esperada**: 201 Created + JSON del contacto creado con `estado: "PENDIENTE"`

### Test 3: PUT actualizar estado
```bash
curl -X PUT http://localhost:8080/api/contact/admin/1/actualizar-estado \
  -H "Content-Type: application/json" \
  -d '{"estado":"EN_PROCESO"}'
```

**Respuesta esperada**: 200 OK + JSON del contacto actualizado

### Test 4: Validación - Estado inválido
```bash
curl -X PUT http://localhost:8080/api/contact/admin/1/actualizar-estado \
  -H "Content-Type: application/json" \
  -d '{"estado":"ESTADO_INVALIDO"}'
```

**Respuesta esperada**: 400 Bad Request + mensaje de error

---

## ⚠️ Verificación de Errores Comunes

### ERROR: "Cannot read property 'imagenes' of undefined"
- [ ] Check: ¿El auto tiene imágenes en BD?
- [ ] Check: ¿El contacto tiene `auto_id` válido?
- [ ] Solución: Verifica que el auto exista

### ERROR: "Estado no válido"
- [ ] Check: ¿Escribiste el estado correctamente?
- [ ] Valores válidos: PENDIENTE, EN_PROCESO, VENTA_FINALIZADA, CANCELADO
- [ ] Solución: Verifica ortografía exacta

### ERROR: CORS
- [ ] Check: ¿Backend está corriendo?
- [ ] Check: ¿Frontend accede a http://localhost:8080?
- [ ] Solución: Reinicia backend

### ERROR: Base de datos no se conecta
- [ ] Check: ¿MySQL está corriendo? `sudo service mysql status`
- [ ] Check: ¿Usuario/contraseña correctos en application.properties?
- [ ] Check: ¿Base de datos 'ventadeautos' existe?
- [ ] Solución: Revisa logs del backend

---

## 📊 Resumen Final

Una vez completadas TODAS las pruebas anteriores:

- [ ] ✅ Prueba #1: Crear contacto - PASADA
- [ ] ✅ Prueba #2: Ver contactos - PASADA
- [ ] ✅ Prueba #3: Detalles completos - PASADA
- [ ] ✅ Prueba #4: Cambiar estado - PASADA
- [ ] ✅ Prueba #5: Todos los estados - PASADA
- [ ] ✅ Prueba #6: Filtro por estado - PASADA
- [ ] ✅ Prueba #7: Búsqueda - PASADA
- [ ] ✅ Prueba #8: Responsive design - PASADA
- [ ] ✅ Prueba #9: Casos extremos - PASADA
- [ ] ✅ API Tests con curl - PASADOS
- [ ] ✅ Errores comunes revisados - TODO OK

---

## 🎉 SISTEMA LISTO PARA PRODUCCIÓN

Si todas las pruebas pasaron:

✅ Backend funcionando correctamente
✅ Frontend compilando sin errores
✅ Base de datos sincronizada
✅ APIs respondiendo correctamente
✅ UI responsiva y funcional
✅ Manejo de errores correcto
✅ Validaciones en lugar
✅ Documentación completa

**ESTADO**: 🟢 LISTO PARA DEPLOYMENT

---

## 📞 Próximos Pasos

1. [ ] Hacer backup de base de datos
2. [ ] Documentar credenciales de acceso
3. [ ] Entrenar equipo en uso del admin panel
4. [ ] Monitorear logs en producción
5. [ ] Recopilar feedback de usuarios

---

**Última verificación**: [FECHA ACTUAL]
**Responsable**: [TU NOMBRE]
**Estado**: ✅ COMPLETADO

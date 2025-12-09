# 🧪 Guía de Prueba - Sistema de Contactos

## Requisitos Previos
- Backend ejecutándose en `http://localhost:8080`
- Frontend ejecutándose en `http://localhost:4200`
- Base de datos MySQL en `localhost:3306`
- Usuario admin autenticado

---

## ✅ Pruebas del Cliente (Frontend)

### 1. Envío de Contacto desde Detalle de Auto

**Pasos:**
1. Navega a `http://localhost:4200`
2. Selecciona cualquier auto de la lista (ej: Toyota Corolla)
3. Desplázate hacia abajo hasta encontrar el botón "Contactar a través de WhatsApp"
4. Haz clic en el botón
5. Se debe abrir un modal con formulario

**Validación:**
- ✅ Modal se abre correctamente
- ✅ Los campos: Nombre, DNI, Email, Teléfono, Mensaje aparecen
- ✅ El asunto se pre-llena con el nombre del auto

### 2. Llenado y Envío del Formulario

**Datos de prueba:**
```
Nombre: Juan Pérez García
DNI: 12345678
Email: juan@example.com
Teléfono: 987654321
Mensaje: Me interesa conocer más sobre este vehículo
```

**Pasos:**
1. Completa todos los campos del formulario
2. Haz clic en el botón "Contactar a través de WhatsApp"

**Validación:**
- ✅ Se muestra mensaje "Contacto guardado"
- ✅ Se abre WhatsApp en una nueva pestaña
- ✅ El mensaje pre-completado incluye los datos del cliente
- ✅ Modal se cierra automáticamente

**Mensaje en WhatsApp debe contener:**
```
Hola, me interesa el [MARCA] [MODELO] [AÑO].

Mis datos:
Nombre: Juan Pérez García
Email: juan@example.com
Teléfono: +51987654321
Mensaje: Me interesa conocer más sobre este vehículo
```

### 3. Validaciones del Formulario

**Prueba 1: Campo vacío**
- Intenta enviar sin completar algún campo
- ✅ Debe mostrar alerta "Por favor complete todos los campos obligatorios"

**Prueba 2: Teléfono inválido**
- Ingresa teléfono: `123456` (menos de 9 dígitos)
- ✅ Debe mostrar alerta "El teléfono debe tener 9 dígitos y comenzar con 9"

**Prueba 3: Teléfono válido sin 9 inicial**
- Ingresa teléfono: `876543210`
- ✅ Debe mostrar alerta "El teléfono debe tener 9 dígitos y comenzar con 9"

---

## 🛠️ Pruebas del Admin (Backend + Frontend)

### 1. Acceso al Panel de Contactos

**Pasos:**
1. Navega a `http://localhost:4200/admin`
2. Inicia sesión con credenciales admin
3. Busca la sección "Contactos" en el menú

**Validación:**
- ✅ Se carga la página correctamente
- ✅ Muestra el listado de contactos
- ✅ Se muestran estadísticas (Total, Sin leer)

### 2. Ver Detalles de un Contacto

**Pasos:**
1. En la sección de contactos, busca un contacto que enviaste
2. Haz clic en el botón "Ver Detalles"
3. Se debe abrir un modal expandido

**Validación en el modal:**
- ✅ Aparece sección "Información Personal del Cliente" con:
  - Nombre
  - DNI
  - Email (correo)
  - Teléfono
  - Fecha de contacto

- ✅ Aparece sección "Estado del Contacto" con:
  - Badge del estado actual (PENDIENTE = amarillo)
  - Botón "Cambiar Estado"

- ✅ Aparece sección "Mensaje" con:
  - Asunto
  - Cuerpo del mensaje

- ✅ Aparece sección "Vehículo de Interés" con:
  - Imagen del auto
  - Marca, Modelo, Año
  - Color, Precio
  - Combustible, Transmisión
  - Categoría, Condición

### 3. Cambiar Estado del Contacto

**Pasos:**
1. En el modal de detalles, localiza la sección "Estado del Contacto"
2. Haz clic en el botón "Cambiar Estado"
3. Debe aparecer un selector dropdown con opciones

**Validación:**
- ✅ Aparece selector con opciones:
  - Pendiente
  - En Proceso
  - Venta Finalizada
  - Cancelado

**Prueba 1: Cambiar a EN_PROCESO**
1. Selecciona "En Proceso" del dropdown
2. Haz clic en "Guardar"
3. ✅ Debe actualizarse el badge a color azul
4. ✅ Debe mostrar "En Proceso"

**Prueba 2: Cambiar a VENTA_FINALIZADA**
1. Haz clic nuevamente en "Cambiar Estado"
2. Selecciona "Venta Finalizada"
3. Haz clic en "Guardar"
4. ✅ Debe actualizarse el badge a color verde

**Prueba 3: Cambiar a CANCELADO**
1. Haz clic nuevamente en "Cambiar Estado"
2. Selecciona "Cancelado"
3. Haz clic en "Guardar"
4. ✅ Debe actualizarse el badge a color rojo

**Prueba 4: Cancelar cambio**
1. Haz clic en "Cambiar Estado"
2. Selecciona una opción diferente
3. Haz clic en "Cancelar"
4. ✅ El estado debe volver al anterior sin guardarse

### 4. Filtrado por Estado

**Pasos:**
1. En el listado de contactos, busca los botones de filtro
2. Haz clic en "En Proceso"

**Validación:**
- ✅ Solo muestra contactos con estado EN_PROCESO
- ✅ El botón está resaltado/activo

**Repite con otros estados:**
- ✅ "Pendientes" (si existen)
- ✅ "Respondidos" (si existen)
- ✅ "Todos" (muestra todos)

### 5. Búsqueda de Contactos

**Pasos:**
1. En el campo de búsqueda, escribe un nombre
2. Ej: "Juan"

**Validación:**
- ✅ Se filtran los contactos que contienen "Juan"
- ✅ También funciona con email y asunto

### 6. Marcar como Leído

**Pasos:**
1. Busca un contacto sin leer (badge "Sin leer" visible)
2. Haz clic en el botón "Marcar como leído"

**Validación:**
- ✅ El badge "Sin leer" desaparece
- ✅ El contador de "Sin leer" disminuye

### 7. Eliminar Contacto

**Pasos:**
1. Haz clic en el botón "Eliminar" de un contacto
2. Debe aparecer una confirmación

**Validación:**
- ✅ Aparece diálogo de confirmación
- ✅ Si confirma, el contacto se elimina
- ✅ La lista se actualiza

---

## 📊 Pruebas de Base de Datos

### 1. Verificar que se guardan contactos

**Conexión a MySQL:**
```bash
mysql -u root -p ventadeautos
```

**Query:**
```sql
SELECT * FROM contactos ORDER BY fecha_creacion DESC;
```

**Validación:**
- ✅ Se muestran los contactos creados
- ✅ El campo `estado` tiene valor "PENDIENTE" por defecto
- ✅ El campo `auto_id` tiene el ID correcto del auto
- ✅ Campos rellenados correctamente: nombre, dni, email, telefono, mensaje

### 2. Verificar cambio de estado

**Query después de cambiar estado:**
```sql
SELECT id, nombre, estado FROM contactos ORDER BY fecha_creacion DESC LIMIT 1;
```

**Validación:**
- ✅ El campo `estado` muestra el nuevo valor (EN_PROCESO, VENTA_FINALIZADA, etc.)

### 3. Verificar relación con Auto

**Query:**
```sql
SELECT 
  c.id,
  c.nombre,
  c.estado,
  c.auto_id,
  a.marca_id,
  a.modelo,
  a.precio
FROM contactos c
LEFT JOIN autos a ON c.auto_id = a.id
ORDER BY c.fecha_creacion DESC;
```

**Validación:**
- ✅ Los contactos mostrados tienen `auto_id` correcto
- ✅ El auto relacionado existe y tiene datos (modelo, precio, etc.)

---

## 🔌 Pruebas de API (Backend)

### 1. Enviar Contacto (POST)

**Comando:**
```bash
curl -X POST http://localhost:8080/api/contact/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "dni": "99999999",
    "email": "test@test.com",
    "telefono": "912345678",
    "asunto": "Test",
    "mensaje": "Testing",
    "autoId": 1
  }'
```

**Validación:**
- ✅ Respuesta: `HTTP 201`
- ✅ Body: "Contacto guardado correctamente..."

### 2. Obtener Todos los Contactos (GET)

**Comando:**
```bash
curl http://localhost:8080/api/contact/admin/todos
```

**Validación:**
- ✅ Respuesta: `HTTP 200`
- ✅ Array de contactos con campos completos
- ✅ Incluye `auto` con datos del vehículo

### 3. Actualizar Estado (PUT)

**Comando:**
```bash
curl -X PUT http://localhost:8080/api/contact/admin/1/actualizar-estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "EN_PROCESO"
  }'
```

**Validación:**
- ✅ Respuesta: `HTTP 200`
- ✅ Body incluye el contacto actualizado
- ✅ Campo `estado` = "EN_PROCESO"

### 4. Obtener Contactos No Leídos (GET)

**Comando:**
```bash
curl http://localhost:8080/api/contact/admin/no-leidos
```

**Validación:**
- ✅ Respuesta: `HTTP 200`
- ✅ Solo contactos con `leido = false`

### 5. Eliminar Contacto (DELETE)

**Comando:**
```bash
curl -X DELETE http://localhost:8080/api/contact/admin/1
```

**Validación:**
- ✅ Respuesta: `HTTP 200`
- ✅ Body: mensajedeconfirmación

---

## 🎯 Prueba End-to-End Completa

### Escenario: Flujo Completo Cliente-Admin

1. **Cliente**
   - Accede a página de auto
   - Llena formulario de contacto
   - Envía (se guarda en BD y abre WhatsApp)

2. **Verificación en BD**
   - Query SELECT confirma el contacto guardado
   - Estado = PENDIENTE
   - Auto_id asociado correctamente

3. **Admin**
   - Accede a panel de contactos
   - Ve el nuevo contacto en la lista
   - Ver detalles muestra datos completos + auto

4. **Cambio de Estado**
   - Admin cambia estado a EN_PROCESO
   - BD actualiza estado
   - Frontend muestra badge azul

5. **Finalización**
   - Admin cambia a VENTA_FINALIZADA
   - Badge cambia a verde
   - Contacto permanece en historial

---

## ⚠️ Casos Edge a Probar

1. **Contacto sin Auto**
   - Crear contacto sin autoId
   - ✅ Debe decir "Este contacto no está asociado a un vehículo específico"

2. **Auto eliminado**
   - Eliminar un auto
   - Ver contacto asociado
   - ✅ La relación debe manejarse gracefully

3. **Múltiples contactos del mismo cliente**
   - Crear varios contactos con mismo email
   - ✅ Todos deben guardarse

4. **Estados inválidos**
   - Intentar actualizar con estado incorrecto (por API)
   - ✅ Debe retornar error 400

5. **Teléfono con formato**
   - Teléfono: "+51987654321"
   - Teléfono: "987-654-321"
   - ✅ Debe validar correctamente

---

## 📝 Checklist de Validación

- [ ] Cliente puede enviar contacto desde detalle de auto
- [ ] Contacto se guarda en BD con estado PENDIENTE
- [ ] Auto se asocia correctamente al contacto
- [ ] WhatsApp se abre automáticamente
- [ ] Admin ve todos los contactos en panel
- [ ] Detalles muestran información del cliente
- [ ] Detalles muestran información del auto con imagen
- [ ] Admin puede cambiar estado del contacto
- [ ] Estados se guardan correctamente en BD
- [ ] Badges muestran color correcto según estado
- [ ] Búsqueda filtra contactos correctamente
- [ ] Filtro por estado funciona
- [ ] Marcar como leído funciona
- [ ] Eliminar contacto funciona
- [ ] API retorna datos correctamente
- [ ] Validaciones de entrada funcionan

---

**¡Listo para probar!** 🚀

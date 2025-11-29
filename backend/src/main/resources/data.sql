-- Limpiar todas las tablas (en orden correcto)
DELETE FROM auto_imagenes;
DELETE FROM ventas;
DELETE FROM autos;
DELETE FROM concesionarios;
DELETE FROM marcas;
DELETE FROM categorias_auto;
DELETE FROM combustibles;
DELETE FROM condiciones_auto;
DELETE FROM estados_venta;
DELETE FROM roles;
DELETE FROM transmisiones;
DELETE FROM usuarios;

-- Insertar Roles
INSERT INTO roles (id, nombre, descripcion, activa) VALUES 
(1, 'ADMIN', 'Administrador del sistema', true),
(2, 'CLIENTE', 'Cliente de la concesionaria', true);

-- Insertar Estados de Venta
INSERT INTO estados_venta (id, nombre, descripcion, activa) VALUES 
(1, 'PENDIENTE', 'Solicitud de contacto pendiente', true),
(2, 'FINALIZADO', 'Venta finalizada', true),
(3, 'CANCELADO', 'Venta cancelada', true);

-- Insertar Categorías de Auto
INSERT INTO categorias_auto (id, nombre, descripcion, activa) VALUES 
(1, 'SEDAN', 'Automóvil de turismo', true),
(2, 'CAMIONETA', 'Vehículo utilitario deportivo', true),
(3, 'HATCHBACK', 'Automóvil compacto', true),
(4, 'PICKUP', 'Vehículo de carga', true),
(5, 'VAN', 'Vehículo familiar', true),
(6, 'DEPORTIVO', 'Automóvil de alto rendimiento', true);

-- Insertar Combustibles
INSERT INTO combustibles (id, nombre, descripcion, activa) VALUES 
(1, 'GASOLINA', 'Combustible tradicional', true),
(2, 'DIESEL', 'Combustible diésel', true),
(3, 'HIBRIDO', 'Motor híbrido', true),
(4, 'ELECTRICO', 'Vehículo eléctrico', true);

-- Insertar Condiciones de Auto
INSERT INTO condiciones_auto (id, nombre, descripcion, activa) VALUES 
(1, 'NUEVO', 'Vehículo nuevo (0 km)', true),
(2, 'USADO', 'Vehículo usado', true);

-- Insertar Transmisiones
INSERT INTO transmisiones (id, nombre, descripcion, activa) VALUES 
(1, 'MANUAL', 'Transmisión manual', true),
(2, 'AUTOMATICA', 'Transmisión automática', true);

-- Insertar Marcas
INSERT INTO marcas (id, nombre, descripcion, activa) VALUES 
(1, 'Toyota', 'Fabricante japonés de automóviles', true),
(2, 'Honda', 'Fabricante japonés de automóviles y motocicletas', true),
(3, 'Ford', 'Fabricante americano de automóviles', true),
(4, 'Volkswagen', 'Fabricante alemán de automóviles', true),
(5, 'BMW', 'Fabricante alemán de automóviles de lujo', true),
(6, 'Mercedes-Benz', 'Fabricante alemán de automóviles de lujo', true),
(7, 'Audi', 'Fabricante alemán de automóviles de lujo', true),
(8, 'Nissan', 'Fabricante japonés de automóviles', true),
(9, 'Hyundai', 'Fabricante coreano de automóviles', true),
(10, 'Kia', 'Fabricante coreano de automóviles', true),
(11, 'Mazda', 'Fabricante japonés de automóviles', true),
(12, 'Subaru', 'Fabricante japonés de automóviles', true);

-- Insertar Concesionarios
INSERT INTO concesionarios (id, nombre, direccion, telefono, email, activo, fecha_creacion) VALUES 
(1, 'JC Ugarte', 'Av. Javier Prado Este 4200, Surco', '01-500-1000', 'ventas@jcugarte.com', true, NOW()),
(2, 'Autosell.Pe', 'Av. República de Panamá 3055, San Isidro', '01-500-2000', 'info@autosell.pe', true, NOW()),
(3, 'One Marsano', 'Av. Javier Prado Este 4200, Surco', '01-500-3000', 'contacto@onemarsano.com', true, NOW()),
(4, 'Mitsui Seminuevos', 'Av. Javier Prado Este 4200, Surco', '01-500-4000', 'seminuevos@mitsui.com', true, NOW()),
(5, 'Semi Nuevos Gruporana', 'Av. República de Panamá 3055, San Isidro', '01-500-5000', 'ventas@gruporana.com', true, NOW()),
(6, 'Diveusados La Victoria', 'Av. Javier Prado Este 4200, Surco', '01-500-6000', 'ventas@diveusados.com', true, NOW()),
(7, 'Auto Traders', 'Av. República de Panamá 3055, San Isidro', '01-500-7000', 'info@autotraders.com', true, NOW()),
(8, 'Semi Nuevos Premium', 'Av. Javier Prado Este 4200, Surco', '01-500-8000', 'ventas@premium.com', true, NOW());

-- Insertar Usuarios (ACTUALIZADO con nuevas columnas)
INSERT INTO usuarios (id, email, password, nombre, apellidos, dni, telefono, direccion, rol_id, activo, fecha_creacion, fecha_actualizacion) VALUES 
(1, 'admin@test.com', 'admin123', 'Administrador', 'Principal', '12345678', '987654321', 'Av. Principal 123', 1, true, NOW(), NOW()),
(2, 'cliente@test.com', 'cliente123', 'Juan', 'Pérez', '87654321', '123456789', 'Calle Secundaria 456', 2, true, NOW(), NOW());

-- Insertar Autos (con las nuevas relaciones incluyendo concesionario_id)
INSERT INTO autos (id, marca_id, modelo, anio, precio, color, kilometraje, combustible_id, transmision_id, categoria_id, condicion_id, concesionario_id, descripcion, disponible) VALUES 
-- Autos NUEVOS
-- Toyota Corolla - Sedán Nuevo
(1, 1, 'Corolla', 2023, 25500.00, 'Blanco', 0, 1, 2, 1, 1, 1, 'Auto nuevo full equipo, perfecto estado', true),
-- Honda Civic - Sedán Nuevo
(2, 2, 'Civic', 2023, 23000.00, 'Gris', 0, 1, 2, 1, 1, 2, 'Deportivo y económico, bajo consumo', true),
-- Ford Mustang - Deportivo Nuevo
(3, 3, 'Mustang', 2024, 45000.00, 'Rojo', 0, 1, 2, 6, 1, 3, 'Deportivo americano iconico, motor V8', true),
-- BMW Serie 3 - Sedán Nuevo
(5, 5, 'Serie 3', 2024, 52000.00, 'Negro', 0, 1, 2, 1, 1, 4, 'Sedán de lujo con excelente manejo', true),
-- Audi A4 - Sedán Nuevo
(7, 7, 'A4', 2024, 48000.00, 'Blanco', 0, 1, 2, 1, 1, 5, 'Calidad premium y tracción integral', true),
-- Hyundai Tucson - Camioneta Nueva Híbrida
(9, 9, 'Tucson', 2024, 32000.00, 'Verde', 0, 3, 2, 2, 1, 6, 'SUV familiar con tecnología híbrida', true),
-- Mazda CX-5 - Camioneta Nueva
(11, 11, 'CX-5', 2024, 34000.00, 'Rojo', 0, 1, 2, 2, 1, 7, 'Diseño premium y eficiente', true),
-- Autos USADOS
-- Volkswagen Golf - Hatchback Usado
(4, 4, 'Golf', 2023, 28000.00, 'Azul', 1500, 1, 1, 3, 2, 1, 'Hatchback versátil y divertido de conducir', true),
-- Mercedes-Benz Clase C - Sedán Usado
(6, 6, 'Clase C', 2023, 55000.00, 'Plateado', 5000, 1, 2, 1, 2, 2, 'Elegancia y tecnología alemana', true),
-- Nissan Sentra - Sedán Usado
(8, 8, 'Sentra', 2023, 22000.00, 'Gris', 8000, 1, 1, 1, 2, 3, 'Económico y confiable para el día a día', true),
-- Kia Sportage - Camioneta Usada
(10, 10, 'Sportage', 2023, 31000.00, 'Blanco', 12000, 1, 2, 2, 2, 4, 'SUV espacioso y bien equipado', true),
-- Subaru Outback - Camioneta Usada
(12, 12, 'Outback', 2023, 36000.00, 'Azul', 7000, 1, 1, 2, 2, 5, 'Todo terreno con tracción integral', true);

-- Insertar imágenes para Toyota Corolla (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(1, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(1, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(1, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(1, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(1, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg');

-- Insertar imágenes para Honda Civic (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(2, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg'),
(2, 'https://www.shutterstock.com/image-photo/lime-green-car-on-road-600nw-2647622383.jpg'),
(2, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(2, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(2, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg');

-- Insertar imágenes para Ford Mustang (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(3, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(3, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(3, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(3, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(3, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg');

-- Insertar imágenes para Volkswagen Golf (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(4, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(4, 'https://www.shutterstock.com/image-photo/lime-green-car-on-road-600nw-2647622383.jpg'),
(4, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(4, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(4, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75');

-- Insertar imágenes para BMW Serie 3 (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(5, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(5, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(5, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(5, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(5, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg');

-- Insertar imágenes para Mercedes-Benz Clase C (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(6, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg'),
(6, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(6, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(6, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(6, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg');

-- Insertar imágenes para Audi A4 (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(7, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(7, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(7, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(7, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(7, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg');

-- Insertar imágenes para Nissan Sentra (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(8, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(8, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg'),
(8, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(8, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(8, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg');

-- Insertar imágenes para Hyundai Tucson (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(9, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(9, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(9, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg'),
(9, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(9, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75');

-- Insertar imágenes para Kia Sportage (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(10, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg'),
(10, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(10, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(10, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(10, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg');

-- Insertar imágenes para Mazda CX-5 (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(11, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(11, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg'),
(11, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(11, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg'),
(11, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg');

-- Insertar imágenes para Subaru Outback (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(12, 'https://www.univision.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2Fd4%2F4a%2F006304a74db4902c0b4d8d8026c8%2Fchevrolet-corvette-c8-stingray-2020-1280-08.jpg&w=1280&q=75'),
(12, 'https://euroshop.com.pe/wp-content/uploads/2025/03/hipercarros-lujo.jpg'),
(12, 'https://geely.pe/wp-content/uploads/2025/01/camioneta-familiar-geely-starray-700x385.jpg'),
(12, 'https://loscoches.com/wp-content/uploads/2021/04/carros-deportivos-potencia.jpg'),
(12, 'https://leasyauto.com/static/uploads/8f9ba2f0-aac2-47dd-98c3-8c111aff1450.jpeg');
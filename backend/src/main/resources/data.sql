-- Limpiar tablas
DELETE FROM auto_imagenes;
DELETE FROM autos;
DELETE FROM usuarios;

-- Insertar usuarios
INSERT INTO usuarios (id, email, password, nombre, rol) VALUES 
(1, 'admin@test.com', 'admin123', 'Administrador Principal', 'ADMIN'),
(2, 'cliente@test.com', 'cliente123', 'Cliente Ejemplo', 'CLIENTE');



-- Insertar 10 autos adicionales
INSERT INTO autos (id, marca, modelo, anio, precio, color, kilometraje, combustible, transmision, descripcion, disponible) VALUES 
(1, 'Toyota', 'Corolla', 2023, 25500.00, 'Blanco', 0, 'GASOLINA', 'AUTOMATICA', 'Auto nuevo full equipo, perfecto estado', true),
(2, 'Honda', 'Civic', 2023, 23000.00, 'Gris', 0, 'GASOLINA', 'AUTOMATICA', 'Deportivo y económico, bajo consumo', true),
(3, 'Ford', 'Mustang', 2024, 45000.00, 'Rojo', 0, 'GASOLINA', 'AUTOMATICA', 'Deportivo americano iconico, motor V8', true),
(4, 'Volkswagen', 'Golf', 2023, 28000.00, 'Azul', 1500, 'GASOLINA', 'MANUAL', 'Hatchback versátil y divertido de conducir', true),
(5, 'BMW', 'Serie 3', 2024, 52000.00, 'Negro', 0, 'GASOLINA', 'AUTOMATICA', 'Sedán de lujo con excelente manejo', true),
(6, 'Mercedes-Benz', 'Clase C', 2023, 55000.00, 'Plateado', 5000, 'GASOLINA', 'AUTOMATICA', 'Elegancia y tecnología alemana', true),
(7, 'Audi', 'A4', 2024, 48000.00, 'Blanco', 0, 'GASOLINA', 'AUTOMATICA', 'Calidad premium y tracción integral', true),
(8, 'Nissan', 'Sentra', 2023, 22000.00, 'Gris', 8000, 'GASOLINA', 'MANUAL', 'Económico y confiable para el día a día', true),
(9, 'Hyundai', 'Tucson', 2024, 32000.00, 'Verde', 0, 'HIBRIDO', 'AUTOMATICA', 'SUV familiar con tecnología híbrida', true),
(10, 'Kia', 'Sportage', 2023, 31000.00, 'Blanco', 12000, 'GASOLINA', 'AUTOMATICA', 'SUV espacioso y bien equipado', true),
(11, 'Mazda', 'CX-5', 2024, 34000.00, 'Rojo', 0, 'GASOLINA', 'AUTOMATICA', 'Diseño premium y eficiente', true),
(12, 'Subaru', 'Outback', 2023, 36000.00, 'Azul', 7000, 'GASOLINA', 'MANUAL', 'Todo terreno con tracción integral', true);


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
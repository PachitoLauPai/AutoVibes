-- Limpiar todas las tablas (en orden correcto)
DELETE FROM auto_imagenes;
DELETE FROM contactos;
DELETE FROM ventas;
DELETE FROM autos;
DELETE FROM marcas;
DELETE FROM categorias_auto;
DELETE FROM combustibles;
DELETE FROM condiciones_auto;
DELETE FROM estados_venta;
DELETE FROM transmisiones;
DELETE FROM clientes;
DELETE FROM administradores;
DELETE FROM usuarios;
DELETE FROM roles;

-- Insertar Roles
INSERT INTO roles (id, nombre, descripcion, activa) VALUES 
(1, 'ADMIN', 'Administrador del sistema', true),
(2, 'CLIENTE', 'Cliente de la concesionaria', true);

-- Insertar Administradores (Solo ADMIN puede acceder al sistema)
INSERT INTO administradores (id, nombre, apellido, dni, correo, password, rol_id, activo) VALUES 
(1, 'Administrador', 'Principal', '12345678', 'admin@test.com', 'admin123', 1, true),
(2, 'Carlos', 'García', '87654321', 'carlos@admin.com', 'password123', 1, true);

-- Insertar Clientes (No acceso al panel de admin)
INSERT INTO clientes (id, nombre, apellido, dni, telefono, direccion, rol_id, activo) VALUES 
(1, 'Juan', 'Pérez', '11111111', '987654321', 'Calle Secundaria 456', 2, true),
(2, 'María', 'López', '22222222', '912345678', 'Avenida Principal 123', 2, true),
(3, 'Pedro', 'González', '33333333', '923456789', 'Carrera 5 #100', 2, true);

-- Estados de Venta
INSERT INTO estados_venta (id, nombre, descripcion, activa) VALUES 
(1, 'PENDIENTE', 'Solicitud de contacto pendiente', true),
(2, 'FINALIZADO', 'Venta finalizada', true),
(3, 'CANCELADO', 'Venta cancelada', true);

-- Categorías de Auto
INSERT INTO categorias_auto (id, nombre, descripcion, activa) VALUES 
(1, 'SEDAN', 'Automóvil de turismo', true),
(2, 'CAMIONETA', 'Vehículo utilitario deportivo', true),
(3, 'HATCHBACK', 'Automóvil compacto', true),
(4, 'PICKUP', 'Vehículo de carga', true),
(5, 'VAN', 'Vehículo familiar', true),
(6, 'DEPORTIVO', 'Automóvil de alto rendimiento', true);

-- Combustibles
INSERT INTO combustibles (id, nombre, descripcion, activa) VALUES 
(1, 'GASOLINA', 'Combustible tradicional', true),
(2, 'DIESEL', 'Combustible diésel', true),
(3, 'HIBRIDO', 'Motor híbrido', true),
(4, 'ELECTRICO', 'Vehículo eléctrico', true);

-- Condiciones de Auto
INSERT INTO condiciones_auto (id, nombre, descripcion, activa) VALUES 
(1, 'NUEVO', 'Vehículo nuevo (0 km)', true),
(2, 'USADO', 'Vehículo usado', true);

-- Transmisiones
INSERT INTO transmisiones (id, nombre, descripcion, activa) VALUES 
(1, 'MANUAL', 'Transmisión manual', true),
(2, 'AUTOMATICA', 'Transmisión automática', true);

-- Marcas
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

-- Insertar Autos (sin concesionario_id)
INSERT INTO autos (id, marca_id, modelo, anio, precio, color, kilometraje, stock, combustible_id, transmision_id, categoria_id, condicion_id, descripcion, disponible) VALUES
-- Autos NUEVOS
(1, 1, 'Corolla', 2023, 25500.00, 'Blanco', 0, 5, 1, 2, 1, 1, 'Auto nuevo full equipo, perfecto estado', true),
(2, 2, 'Civic', 2023, 23000.00, 'Gris', 0, 3, 1, 2, 1, 1, 'Deportivo y económico, bajo consumo', true),
(3, 3, 'Mustang', 2024, 45000.00, 'Rojo', 0, 2, 1, 2, 6, 1, 'Deportivo americano iconico, motor V8', true),
(5, 5, 'Serie 3', 2024, 52000.00, 'Gris', 0, 1, 1, 2, 1, 1, 'Sedán de lujo con excelente manejo', true),
(7, 7, 'A4', 2024, 48000.00, 'Blanco', 0, 2, 1, 2, 1, 1, 'Calidad premium y tracción integral', true),
(9, 9, 'Tucson', 2024, 32000.00, 'Verde', 0, 4, 3, 2, 2, 1, 'SUV familiar con tecnología híbrida', true),
(11, 11, 'CX-5', 2024, 34000.00, 'Rojo', 0, 3, 1, 2, 2, 1, 'Diseño premium y eficiente', true),
-- Autos USADOS
(4, 4, 'Golf', 2023, 28000.00, 'Azul', 1500, 6, 1, 1, 3, 2, 'Hatchback versátil y divertido de conducir', true),
(6, 6, 'Clase C', 2023, 55000.00, 'Plateado', 5000, 1, 1, 2, 1, 2, 'Elegancia y tecnología alemana', true),
(8, 8, 'Sentra', 2023, 22000.00, 'Gris', 8000, 4, 1, 1, 1, 2, 'Económico y confiable para el día a día', true),
(10, 10, 'Sportage', 2023, 31000.00, 'Blanco', 12000, 2, 1, 2, 2, 2, 'SUV espacioso y bien equipado', true),
(12, 12, 'Outback', 2023, 36000.00, 'Azul', 7000, 3, 1, 1, 2, 2, 'Todo terreno con tracción integral', true);

-- Insertar imágenes para Toyota Corolla (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(1, 'https://media.ed.edmunds-media.com/toyota/corolla/2023/oem/2023_toyota_corolla_sedan_xse_fq_oem_1_600.jpg'),
(1, 'https://insidethehood.com/wp-content/uploads/2023/10/2025-Toyota-Corolla-Sedan-Redesign.jpg'),
(1, 'https://cdn.autoproyecto.com/wp-content/uploads/2022/10/2023_Corolla_XSE_WindChillPearl_051.jpg'),
(1, 'https://content-images.carmax.com/qeontfmijmzv/2Vnq0rOY2miBpODXkrGegd/10a475028a46328f6c9f55a719dba042/02-Corolla.jpg?w=2100&fm=webp'),
(1, 'https://hips.hearstapps.com/hmg-prod/images/2021-toyota-corolla-se-apex-408-1601389652.jpg?crop=0.682xw:0.682xh;0.313xw,0.307xh&resize=640:*');

-- Insertar imágenes para Honda Civic (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(2, 'https://www.motorbiscuit.com/wp-content/uploads/2023/01/2023-Honda-Civic-Sedan-1.jpg'),
(2, 'https://tse2.mm.bing.net/th/id/OIP.BPJ3PjSK-AY6f0PY58qURAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3'),
(2, 'https://service.secureoffersites.com/images/GetEvoxImage?styleid=462200&angle=01&width=350&colorcode=GE&quality=85&useoverrides=true&type=jpeg'),
(2, 'https://cleanfleetreport.com/wp-content/uploads/2024/02/IMG_6961.jpg'),
(2, 'https://vehicle-images.dealerinspire.com/ce01-110006982/2HGFE2F58RH509872/d7e9b918eb6c878cf70066fe74eff292.jpg');

-- Insertar imágenes para Ford Mustang (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(3, 'https://cdn.motor1.com/images/mgl/40meJZ/s1/2024-mustang-gt-rapid-red.jpg'),
(3, 'https://rayscarinfo.com/wp-content/uploads/2023/04/2024-ford-mustang-rapid-red-metallic-tinted-clearcoat-color.jpg'),
(3, 'https://rayscarinfo.com/wp-content/uploads/2023/04/2023-ford-mustang-race-red-color.jpg'),
(3, 'https://www.luxurysportcarsdubai.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-22-at-23.32.22_59547bdb.jpg'),
(3, 'https://images.carexpert.com.au/resize/3000/-/app/uploads/2023/07/ford-mustang-dark-horse-race-20.jpeg');

-- Insertar imágenes para Volkswagen Golf (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(4, 'https://www.todosobreautos.com/content/images/2024/07/2023-Volkswagen-Golf-R-20th-Anniversary-Edition-31_11zon.webp'),
(4, 'https://media.ed.edmunds-media.com/volkswagen/golf-r/2023/oem/2023_volkswagen_golf-r_4dr-hatchback_base_fq_oem_2_815.jpg'),
(4, 'https://tse1.mm.bing.net/th/id/OIP.e2f9z9inHi9E4mS-b_NMdAHaD4?w=1200&h=628&rs=1&pid=ImgDetMain&o=7&rm=3'),
(4, 'https://images1.autocasion.com/actualidad/wp-content/uploads/2020/11/Volkswagen-Golf_R-2022-1280-01.jpg'),
(4, 'https://carnovo.com/wp-content/uploads/2020/11/volkswagen-golf-r-2021.jpg');

-- Insertar imágenes para BMW Serie 3 (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(5, 'https://soymotor.com/sites/default/files/imagenes/noticia/bmw_serie_3_2023_1.jpg'),
(5, 'https://a.storyblok.com/f/143588/1600x1067/b327718962/bmw_3_series_exterior8.jpg/m/fit-in/960x639/filters:quality(80)'),
(5, 'https://tse3.mm.bing.net/th/id/OIP.c0mYgd3Xlpx6X56ZGYMhHwHaE8?w=900&h=600&rs=1&pid=ImgDetMain&o=7&rm=3'),
(5, 'https://media.ed.edmunds-media.com/bmw/3-series/2023/oem/2023_bmw_3-series_sedan_330i-xdrive_fq_oem_1_1280.jpg'),
(5, 'https://img-ik.cars.co.za/images/2022/08Aug/BMW3SeriesLCISpecsPrice/3lci-studio.jpg?tr=w-620');

-- Insertar imágenes para Mercedes-Benz Clase C (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(6, 'https://autopresto.mx/wp-content/uploads/mercedes-benz-clase-c-2023-precio-motor-prestaciones-medidas-y-equipamiento.jpg'),
(6, 'https://autotest.com.ar/wp-content/uploads/2021/02/MERCEDES-BENZ-CLASE-C-2022.jpg'),
(6, 'https://s.auto.drom.ru/i24254/c/photos/fullsize/mercedes-benz/c-class/mercedes-benz_c-class_997457.jpg'),
(6, 'https://tse2.mm.bing.net/th/id/OIP.zJcGSIPT-COeti3HXDk-UgHaEK?rs=1&pid=ImgDetMain&o=7&rm=3'),
(6, 'https://i0.wp.com/www.photoscar.fr/wp-content/uploads/2021/02/Mercedes-Benz-Classe-C-2022-06.jpg?resize=1024%2C768&ssl=1');

-- Insertar imágenes para Audi A4 (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(7, 'https://media.drive.com.au/obj/tx_q:70,rs:auto:960:540:1/driveau/upload/vehicles/redbook/AUVAUDI2024AEAR/S000CXI7'),
(7, 'https://images.carexpert.com.au/resize/800/-/cms/v1/media/2024-audi-a4-primary-image.jpg'),
(7, 'https://tse4.mm.bing.net/th/id/OIP.80t8QApyNvTnPCsF0Z46owHaE4?rs=1&pid=ImgDetMain&o=7&rm=3'),
(7, 'https://carsguide-res.cloudinary.com/image/upload/f_auto%2Cfl_lossy%2Cq_auto%2Ct_default/v1/editorial/2021-Audi-A4-45-TFSI-quattro-Avant-1001x565-(1).jpg'),
(7, 'https://tse1.mm.bing.net/th/id/OIP.ZJW8EJQEqT0Raxu1283mKQHaEz?w=1024&h=665&rs=1&pid=ImgDetMain&o=7&rm=3');

-- Insertar imágenes para Nissan Sentra (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(8, 'https://tse2.mm.bing.net/th/id/OIP.iv5UjPnDM2MCckkGfiuD5AHaEK?rs=1&pid=ImgDetMain&o=7&rm=3'),
(8, 'https://invoice-pricing.com/cars/wp-content/uploads/gallery-2022-nissan-maxima-4775.jpg'),
(8, 'https://img2.carmax.com/assets/26438536/hero.jpg?width=400&height=300'),
(8, 'https://tse3.mm.bing.net/th/id/OIP.cHGimCWB2CNIeEqHVzeRBwHaDr?rs=1&pid=ImgDetMain&o=7&rm=3'),
(8, 'https://acroadtrip.blob.core.windows.net/publicaciones-imagenes/Small/nissan/sentra/mx/RT_PU_a28110990c0144f3ab704f416ea20f6d.jpg');

-- Insertar imágenes para Hyundai Tucson (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(9, 'https://hyundaijamaica.com/images/FP-SLIDER-2024-TUCSON.jpeg'),
(9, 'https://stimg.cardekho.com/images/carexteriorimages/630x420/Hyundai/Tucson-2022/7995/1657714724708/front-left-side-47.jpg?tr=w-456'),
(9, 'https://tse3.mm.bing.net/th/id/OIP.60taFSb-sH_ep_CZWko_NQHaEK?w=1024&h=576&rs=1&pid=ImgDetMain&o=7&rm=3'),
(9, 'https://automania.hr/wp-content/uploads/2024/06/Hyundai-Tucson-1.jpg'),
(9, 'https://tse3.mm.bing.net/th/id/OIP.Al6aYOq2D_DN04K6o1j9GAHaE8?w=1200&h=800&rs=1&pid=ImgDetMain&o=7&rm=3');

-- Insertar imágenes para Kia Sportage (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(10, 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/2023-kia-sportage-white-front-three-quarters-1623125622.jpg?crop=0.705xw:0.528xh;0.220xw,0.405xh&resize=1200:*'),
(10, 'https://tse2.mm.bing.net/th/id/OIP.lGcDVTv92eeI43UcluiH2wHaD4?w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3'),
(10, 'https://octane.rent/wp-content/uploads/2024/11/kia_sportage_white_06.webp'),
(10, 'https://nextgen-cella.cdn.dealersolutions.com.au/20250218/71fe2fe7d0752d9b5fd9ac45be5147f3.jpg'),
(10, 'https://tse2.mm.bing.net/th/id/OIP.jvMdrXD1TrvP5wLZVuL69gHaE8?rs=1&pid=ImgDetMain&o=7&rm=3');

-- Insertar imágenes para Mazda CX-5 (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(11, 'https://tse3.mm.bing.net/th/id/OIP.lIrxPLMjcTDFA3f9Qn6__QHaEz?rs=1&pid=ImgDetMain&o=7&rm=3'),
(11, 'https://rpmweb.ca/imager/medias/41020/ea2106322e484387199f2fda9b4c4651_ad02c10575d688bd3d9347fa060773a3.jpg'),
(11, 'https://media.ed.edmunds-media.com/mazda/cx-5/2018/td/2018_mazda_cx-5_actf34_td_105181_717.jpg'),
(11, 'https://prod.mazda.ca/globalassets/mazda-canada/vehicles/2024/cx-5/2024-cx-5-scene-45.jpg'),
(11, 'https://www.mazda.mx/siteassets/mazda-mx/mycos-2024/mazda-cx-5/experiencia/esencia/mazda-mexico-cx-5-experiencia-esencia-mobile-v1.jpeg');

-- Insertar imágenes para Subaru Outback (5 imágenes)
INSERT INTO auto_imagenes (auto_id, url_imagen) VALUES 
(12, 'https://tse1.mm.bing.net/th/id/OIP.DAdeabuawiNHJup1TSQ4CAHaE9?rs=1&pid=ImgDetMain&o=7&rm=3'),
(12, 'https://tse1.mm.bing.net/th/id/OIP.5Q_3g5Klmc4pKK4RrREOEgHaEK?rs=1&pid=ImgDetMain&o=7&rm=3'),
(12, 'https://media.ed.edmunds-media.com/subaru/outback/2022/oem/2022_subaru_outback_4dr-suv_limited_fq_oem_1_815.jpg'),
(12, 'https://tse1.mm.bing.net/th/id/OIP.Zzz5CQ4cHa96_AB4dpPQ_wHaFj?rs=1&pid=ImgDetMain&o=7&rm=3'),
(12, 'https://tse4.mm.bing.net/th/id/OIP.Ew5j5EH8TWcRQ6cEq0tlbgHaEK?w=1200&h=675&rs=1&pid=ImgDetMain&o=7&rm=3');
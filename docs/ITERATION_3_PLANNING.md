# Planificación Iteración 3 - Cotizaciones

## Objetivo

Implementar el módulo de cotizaciones del chatbot, permitiendo a los clientes:

- Cotizar computadoras de escritorio según su uso
- Cotizar repuestos de laptop por modelo
- Cotizar servicios técnicos
- Recibir cotizaciones formales con detalle de precios e IGV

## Historias de Usuario (XP)

### HU-3.1: Cotizar computadora de escritorio

**Como** cliente interesado en comprar una computadora,  
**Quiero** recibir opciones de computadoras según mi uso,  
**Para** conocer precios y características antes de comprar.

**Criterios de Aceptación:**

- [x] El bot pregunta si necesita equipo completo o solo partes
- [x] El bot pregunta el uso principal (ofimática, diseño, gaming, etc.)
- [x] Se muestran 2-3 opciones con nombre, especificaciones clave y precio
- [x] El bot ofrece enviar cotización formal por Messenger o correo
- [x] Si no hay productos disponibles para ese uso, se informa al usuario

**Estimación:** 5 puntos

---

### HU-3.2: Cotizar repuestos de laptop

**Como** cliente con una laptop que necesita reparación,  
**Quiero** conocer el precio de repuestos específicos para mi modelo,  
**Para** decidir si procedo con la reparación.

**Criterios de Aceptación:**

- [x] El bot solicita el modelo de laptop y tipo de repuesto
- [x] Se buscan repuestos compatibles en la base de datos
- [x] Se muestra precio del repuesto y opcionalmente costo de instalación
- [x] Si no hay repuesto disponible, se ofrece generar un requerimiento
- [x] Se ofrece agendar cita de servicio directamente

**Estimación:** 5 puntos

---

## Arquitectura Técnica

### Nuevos Componentes a Implementar

#### 1. Modelo

- `fulfillment/src/models/Service.js` - Esquema de servicios técnicos

#### 2. Scripts

- `fulfillment/src/scripts/seed-products.js` - Carga de catálogo inicial

#### 3. Services

- `fulfillment/src/services/quotes.service.js` - Lógica de cotización

#### 4. Handlers

- `fulfillment/src/handlers/quotes.handler.js` - Handlers de intents

#### 5. Nuevas Entidades en Dialogflow

- `@uso_computadora` (ofimática, diseño, programación, gaming, estudio)
- `@categoria_producto` (computadora, laptop, impresora, accesorio, componente)
- `@tipo_cotizacion` (producto, servicio)

#### 6. Nuevos Intents en Dialogflow (12 intents)

| Intent                          | Input Context                | Output Context                  | Webhook |
| ------------------------------- | ---------------------------- | ------------------------------- | ------- |
| cotizar_iniciar                 | -                            | cotizacion_tipo(5)              | No      |
| cotizar_producto_categoria      | cotizacion_tipo              | cotizacion_producto(8)          | No      |
| cotizar_servicio_tipo           | cotizacion_tipo              | cotizacion_servicio(8)          | Sí      |
| cotizar_computadora             | cotizacion_producto          | cotizar_computadora_en_curso(8) | No      |
| cotizar_computadora_uso         | cotizar_computadora_en_curso | cotizar_computadora_opciones(5) | Sí      |
| cotizar_computadora_seleccionar | cotizar_computadora_opciones | cotizacion_items(8)             | Sí      |
| cotizar_repuesto_laptop         | cotizacion_producto          | cotizar_repuesto_en_curso(8)    | Sí      |
| cotizar_repuesto_seleccionar    | cotizar_repuesto_en_curso    | cotizacion_items(8)             | Sí      |
| cotizar_agregar_mas             | cotizacion_items             | cotizacion_producto(8)          | Sí      |
| cotizar_datos_cliente           | cotizacion_items             | cotizacion_confirmar(3)         | Sí      |
| cotizar_confirmar_si            | cotizacion_confirmar         | -                               | Sí      |
| cotizar_confirmar_no            | cotizacion_confirmar         | cotizacion_items(8)             | No      |

---

## Configuración Necesaria

### Base de Datos

Se requiere cargar el catálogo de productos y servicios en MongoDB mediante el script de seed:

```bash
node fulfillment/src/scripts/seed-products.js
```

### Variables de Entorno

Las variables necesarias ya están configuradas:

```env
QUOTE_VALIDITY_DAYS=7
IGV_PERCENTAGE=18
```

---

## Flujo de Conversación

### Ejemplo: Cotizar Computadora de Escritorio

```
Usuario: Quiero una cotización
Bot: Con gusto le ayudo con una cotización. 💰
     ¿Qué desea cotizar?
     1️⃣ Productos (computadoras, laptops, impresoras, etc.)
     2️⃣ Servicios (mantenimiento, reparaciones, instalaciones)

Usuario: Productos
Bot: ¿Qué tipo de producto le interesa?
     1️⃣ Computadora de escritorio
     2️⃣ Repuestos de laptop
     3️⃣ Impresora
     4️⃣ Accesorios

Usuario: Computadora
Bot: ¡Excelente elección! 🖥️
     ¿Para qué uso principal será la computadora?
     1️⃣ Ofimática (oficina, documentos)
     2️⃣ Diseño gráfico
     3️⃣ Programación
     4️⃣ Gaming
     5️⃣ Estudio

Usuario: Para oficina
Bot: Estas son nuestras opciones para ofimática:

     1️⃣ PC Básica Ofimática
        Intel Core i3-12100 | 8GB RAM | 256GB SSD
        💰 S/ 1,450.00

     2️⃣ PC Ofimática Plus
        Intel Core i5-12400 | 16GB RAM | 512GB SSD
        💰 S/ 2,150.00

     ¿Cuál le interesa? Puede elegir una o varias.

Usuario: La segunda
Bot: Perfecto, he agregado "PC Ofimática Plus" a su cotización.
     ¿Desea agregar algo más o procedemos con sus datos?

Usuario: Así está bien
Bot: Para generar su cotización necesito algunos datos.
     ¿Cuál es su nombre completo?

Usuario: Juan Pérez
Bot: Gracias. ¿Su número de teléfono?

Usuario: 975123456
Bot: Aquí tiene el resumen de su cotización:

     📋 COTIZACIÓN - CBRICENHO E.I.R.L
     👤 Cliente: Juan Pérez (975123456)

     ┌──────────────────────────────────┐
     │ PC Ofimática Plus           x1   │
     │ S/ 2,150.00                      │
     ├──────────────────────────────────┤
     │ Subtotal:        S/ 2,150.00     │
     │ IGV (18%):       S/   387.00     │
     │ TOTAL:           S/ 2,537.00     │
     └──────────────────────────────────┘
     Validez: 7 días

     ¿Confirma la cotización? (Sí/No)

Usuario: Sí
Bot: ✅ ¡Cotización generada exitosamente!
     📋 Código: COT-20260216-001
     Le enviaremos los detalles completos por este medio.
     ¿Puedo ayudarle con algo más?
```

### Ejemplo: Cotizar Repuesto de Laptop

```
Usuario: Necesito una pantalla para mi laptop
Bot: Con gusto le ayudo. ¿Cuál es el modelo de su laptop?
     (Ejemplo: HP Pavilion 15, Dell Inspiron 14, Lenovo IdeaPad 3)

Usuario: HP Pavilion 15
Bot: ¿Qué repuesto necesita para su HP Pavilion 15?
     1️⃣ Pantalla / Display
     2️⃣ Teclado
     3️⃣ Batería
     4️⃣ Disco SSD
     5️⃣ Memoria RAM
     6️⃣ Otro

Usuario: Pantalla
Bot: Encontré estas opciones para HP Pavilion 15:

     1️⃣ Pantalla LCD 15.6" HD
        Compatible: HP Pavilion 15 series
        💰 Repuesto: S/ 280.00
        🔧 Con instalación: S/ 350.00

     ¿Le interesa? También puedo agendar una cita para la instalación.

Usuario: Sí, con instalación
Bot: He agregado la pantalla con instalación.
     ¿Desea agregar algo más o procedemos?
```

---

## Tareas Técnicas Detalladas

### Fase 1: Modelos y Datos (3 horas)

1. Crear modelo `Service.js` - 0.5h
2. Crear script `seed-products.js` con catálogo realista - 2h
3. Ejecutar seed y verificar datos - 0.5h

### Fase 2: Servicio de Cotizaciones (4 horas)

1. Crear `quotes.service.js` con métodos de consulta - 2h
2. Implementar cálculo de IGV y totales - 1h
3. Implementar generación y persistencia de cotización - 1h

### Fase 3: Utilidades (2 horas)

1. Agregar formateadores de cotización en `formatters.js` - 1.5h
2. Agregar validación de email en `validators.js` - 0.5h

### Fase 4: Handlers (5 horas)

1. Implementar `quotes.handler.js` con 12 handlers - 4h
2. Registrar intents en `dialogflow.js` e `index.js` - 0.5h
3. Verificar confirmación de cotización en el chat - 0.5h

### Fase 5: Intents en Dialogflow (4 horas)

1. Crear 3 entidades personalizadas - 1h
2. Crear 12 intents con training phrases - 2.5h
3. Configurar contextos y webhook - 0.5h

### Fase 6: Testing (3 horas)

1. Testing end-to-end del flujo completo - 2h
2. Recopilación de métricas - 1h

**Total estimado: ~21 horas de desarrollo**

---

## Criterios de Éxito

### Funcionales

- [x] Usuario puede cotizar computadoras por uso
- [x] Usuario puede cotizar repuestos de laptop por modelo
- [x] Usuario puede cotizar servicios técnicos
- [x] Precios se obtienen de la base de datos
- [x] Cálculo de IGV correcto (18%)
- [x] Cotización se guarda en MongoDB
- [x] Se muestra confirmación de cotización en el chat

### No Funcionales

- [x] Tiempo de respuesta < 2 segundos (incluye consulta BD)
- [x] Manejo de errores cuando no hay productos
- [x] Métricas recopiladas (tiempo de generación de cotización)

### Métricas para la Tesis

- Tiempo promedio de generación de cotización
- Tasa de éxito de cotización
- Productos más cotizados
- Tipos de uso más solicitados

---

## Riesgos y Mitigación

| Riesgo                            | Impacto | Mitigación                                           |
| --------------------------------- | ------- | ---------------------------------------------------- |
| Catálogo vacío o desactualizado   | Alto    | Script de seed con datos realistas                   |
| Modelo de laptop no encontrado    | Medio   | Ofrecer búsqueda genérica y generar requerimiento    |
| Flujo conversacional muy largo    | Medio   | Permitir ir directo a cotización sin pasos previos   |
| Cálculo de IGV incorrecto         | Alto    | Validación con pruebas unitarias                     |

---

## Dependencias

- Modelo `Product.js` ya implementado ✅
- Modelo `Quote.js` ya implementado ✅
- Modelo `Conversation.js` para métricas ✅
- Servicio de métricas funcionando ✅
- Canal Messenger (integración nativa de Dialogflow) ✅

---

**Iteración estimada:** 2-3 semanas con dedicación parcial

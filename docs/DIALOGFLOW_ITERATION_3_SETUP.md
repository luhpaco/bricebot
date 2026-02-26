# Guía de Configuración de Dialogflow - Iteración 3 (Cotizaciones)

Esta guía te ayudará a configurar todos los intents y entidades necesarios para el módulo de cotizaciones en Dialogflow Console. Cada intent está especificado de forma completa e independiente.

---

## Pre-requisitos

- ✅ Iteración 1 (FAQ) completada y funcionando
- ✅ Iteración 2 (Gestión de Citas) completada y funcionando
- ✅ Acceso a [Dialogflow Console](https://dialogflow.cloud.google.com)
- ✅ Webhook habilitado y URL actualizada
- ✅ Servidor corriendo con el código de la Iteración 3
- ✅ Base de datos seeded con productos y servicios (ver [Paso 4](#paso-4-seedear-la-base-de-datos))

---

## Convención de anotación usada en esta guía

La misma convención de la Iteración 2:

- El texto entre corchetes `[texto]` indica **la parte que debes seleccionar** para anotar
- Después de la flecha `→` se indica la **entidad que debes asignar**
- Las frases sin corchetes ni tablas no requieren anotación manual

Para una explicación detallada del proceso de anotación, consulta la [sección "Cómo anotar Training Phrases con parámetros" de la Iteración 2](DIALOGFLOW_ITERATION_2_SETUP.md#cómo-anotar-training-phrases-con-parámetros).

---

## Resumen de iteraciones anteriores (referencia)

### Iteración 1 — 8 intents

| # | Intent | Propósito |
|---|--------|-----------|
| 1 | `saludo` | Bienvenida al usuario |
| 2 | `despedida` | Despedida |
| 3 | `ayuda` | Menú de opciones |
| 4 | `faq_horarios` | Horarios de atención |
| 5 | `faq_ubicacion` | Dirección y mapa |
| 6 | `faq_contacto` | Teléfono, WhatsApp, email |
| 7 | `faq_redes_sociales` | Facebook, Instagram |
| 8 | `Default Fallback Intent` | Mensaje no entendido |

### Iteración 2 — 20 intents

10 intents de citas en local + 10 intents de citas a domicilio. La guía completa está en `docs/DIALOGFLOW_ITERATION_2_SETUP.md`.

### Entidades ya creadas

- **@tipo_equipo** (PC, laptop, impresora, camara, monitor, otro) — Iteración 1
- **@tipo_servicio** (mantenimiento, cambio_teclado, etc.) — Iteración 1
- **@rango_horario** (mañana, tarde) — Iteración 2

La entidad `@tipo_equipo` se reutiliza en esta iteración para el intent `cotizar_servicio_tipo`.

---

## Resumen de la Iteración 3 (15 intents)

> **Actualización:** Se añadieron 3 intents para completar los flujos faltantes identificados durante pruebas: `cotizar_servicio_equipo` (fix C1/A3), `cotizar_servicio_seleccionar` (fix C2) y `cotizar_producto_generico` (fix C3).

| # | Intent | Propósito | Input Context | Output Context |
|---|--------|-----------|---------------|----------------|
| 1 | `cotizar_iniciar` | Punto de entrada | Ninguno | `cotizacion_tipo` (5) |
| 2 | `cotizar_producto_categoria` | Elige productos | `cotizacion_tipo` | `cotizacion_producto` (8) |
| 3 | `cotizar_servicio_tipo` | Elige servicios | `cotizacion_tipo` | `cotizacion_servicio` (8) |
| 4 | `cotizar_servicio_equipo` | Tipo de equipo para servicio | `cotizacion_servicio` | `cotizacion_servicio` (8) |
| 5 | `cotizar_servicio_seleccionar` | Selecciona un servicio | `cotizacion_servicio` | `cotizacion_items` (8) |
| 6 | `cotizar_producto_generico` | Impresoras / Accesorios | `cotizacion_producto` | `cotizar_computadora_opciones` (5) |
| 7 | `cotizar_computadora` | Elige computadora | `cotizacion_producto` | `cotizar_computadora_en_curso` (8) |
| 8 | `cotizar_computadora_uso` | Uso de la PC | `cotizar_computadora_en_curso` | `cotizar_computadora_opciones` (5) |
| 9 | `cotizar_computadora_seleccionar` | Elige opción PC o genérico | `cotizar_computadora_opciones` | `cotizacion_items` (8) |
| 10 | `cotizar_repuesto_laptop` | Repuesto laptop | `cotizacion_producto` | `cotizar_repuesto_en_curso` (8) |
| 11 | `cotizar_repuesto_seleccionar` | Elige repuesto | `cotizar_repuesto_en_curso` | `cotizacion_items` (8) |
| 12 | `cotizar_agregar_mas` | Agregar items | `cotizacion_items` | `cotizacion_producto` (8) |
| 13 | `cotizar_datos_cliente` | Nombre y teléfono | `cotizacion_items` | `cotizacion_confirmar` (3) |
| 14 | `cotizar_confirmar_si` | Confirma cotización | `cotizacion_confirmar` | Ninguno |
| 15 | `cotizar_confirmar_no` | Modifica/cancela | `cotizacion_confirmar` | `cotizacion_items` (8) |

### Diferencias clave entre flujos de cotización

| Aspecto | Computadora | Repuesto Laptop | Servicio | Genérico (Impresora/Accesorio) |
|---------|-------------|-----------------|----------|-------------------------------|
| Dato inicial | Uso (ofimática, gaming...) | Modelo + tipo repuesto | Tipo equipo | Categoría elegida |
| Fuente de datos | `products` (category: computadora) | `products` (category: componente) | `services` | `products` (category: impresora/accesorio) |
| Opciones mostradas | 2-3 PCs con specs | Repuestos compatibles + instalación | Servicios disponibles | Productos del catálogo o mensaje de contacto |
| Pasos del usuario | 6-7 | 7-8 | 5-6 | 4-5 |

### Diagrama de flujo de contextos (actualizado)

```
                    cotizar_iniciar
                    (limpia todos los contextos)
                         |
                         v
              [cotizacion_tipo] (lifespan: 5)
              (se limpia al bifurcar — fix C1)
                    /              \
                   v                v
     cotizar_producto_       cotizar_servicio_
     categoria (2)           tipo (3)
           |                        |
           v                        v
  [cotizacion_producto]      [cotizacion_servicio]
     (lifespan: 8)              (lifespan: 8)
     /    |     \                   |
    v     v      v              equipo (4)
   PC(7) rep(10) gen(6)             |
    |      |      |             [cotizacion_servicio]
    v      v      v             (con serviceOptions)
  [compu] [rep]  [compu_opc]        |
  en_curso en_curso (5) |      seleccionar (5)
    |      |      |             |
  uso(8)  sel(11) |             v
    |              |        [cotizacion_items]
    v              v             |
  [compu_opc]      |             v
    |              |        datos_cliente(13)
  sel(9)           |             |
    |              v             v
    +-------->[cotizacion_items](lifespan:8)
                   |
                   v
             agregar_mas (12) o datos_cliente (13)
                                   |
                                   v
                          [cotizacion_confirmar](3)
                               /       \
                              v         v
                         si (14)     no (15)
```

---

## Paso 1: Crear Nuevas Entidades Personalizadas

### 1.1 Entidad: @uso_computadora

1. Ve a **Entities** en el menú lateral
2. Haz clic en **CREATE ENTITY**
3. Nombre: `uso_computadora`
4. Agrega los siguientes valores con sinónimos:

| Valor | Sinónimos |
|-------|-----------|
| ofimatica | ofimática, oficina, word, excel, trabajo básico, documentos, basico, básico, trabajo, administrativo |
| diseno | diseño, photoshop, illustrator, edición, gráfico, grafico, edicion, diseñador, render |
| programacion | programación, desarrollo, programar, código, codigo, software, desarrollador, developer |
| gaming | juegos, gamer, videojuegos, jugar, games, gaminng |
| estudio | estudiante, tareas, clases, universidad, colegio, escuela, estudiar |

5. Marca ✅ **Allow automated expansion**
6. Haz clic en **SAVE**

### 1.2 Entidad: @categoria_producto

1. Haz clic en **CREATE ENTITY**
2. Nombre: `categoria_producto`
3. Agrega los siguientes valores con sinónimos:

| Valor | Sinónimos |
|-------|-----------|
| computadora | computadora de escritorio, PC, desktop, equipo de escritorio, cpu, compu |
| repuesto_laptop | repuesto, repuestos, repuesto de laptop, parte de laptop, pieza, pantalla laptop, teclado laptop |
| impresora | impresora, printer, multifuncional, impresoras |
| accesorio | accesorio, accesorios, periférico, periferico, componente, componentes |

4. Marca ✅ **Allow automated expansion**
5. Haz clic en **SAVE**

### 1.3 Entidad: @tipo_cotizacion

1. Haz clic en **CREATE ENTITY**
2. Nombre: `tipo_cotizacion`
3. Agrega los siguientes valores con sinónimos:

| Valor | Sinónimos |
|-------|-----------|
| producto | producto, productos, equipo, equipos, artículo, articulo |
| servicio | servicio, servicios, reparación, reparacion, mantenimiento, instalación, instalacion |

4. Haz clic en **SAVE**

---

## Paso 2: Crear Intents de Cotización (Intents 1-12)

### Intent 1: `cotizar_iniciar`

**Propósito:** Punto de entrada para solicitar una cotización. Pregunta si el usuario desea cotizar un producto o un servicio.

**Configuración:**

- Training Phrases (15):

  ```
  Quiero una cotización
  ¿Cuánto cuesta?
  Precio de
  Cotizar
  Presupuesto
  ¿Cuánto sale?
  Necesito saber precios
  Quiero cotizar algo
  Dame una cotización
  Precios por favor
  ¿Me pueden cotizar?
  Quisiera un presupuesto
  ¿Cuánto me costaría?
  Quiero saber cuánto cuesta
  Necesito una cotización
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: Ninguno
  - Output contexts: `cotizacion_tipo` (lifespan: 5)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío, se maneja en webhook)

**Lo que hace el webhook:** Establece el contexto `cotizacion_tipo` con un `startTime` para medir métricas de duración, y responde mostrando dos opciones: 1) Productos (computadoras, repuestos, impresoras, etc.) y 2) Servicios (mantenimiento, reparaciones, instalaciones).

---

### Intent 2: `cotizar_producto_categoria`

**Propósito:** El usuario elige cotizar un producto. Muestra las categorías de productos disponibles.

**Configuración:**

- Training Phrases (12):

  | Escribe en Dialogflow | Selecciona y anota |
  |-----------------------|--------------------|
  | **Productos** | Selecciona `Productos` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | **Producto** | Selecciona `Producto` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | Quiero cotizar un **producto** | Selecciona `producto` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | Un **equipo** | Selecciona `equipo` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | Me interesa un **producto** | Selecciona `producto` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | Quiero ver **productos** | Selecciona `productos` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | 1 | Sin anotación (el webhook interpreta "1" como producto) |
  | Opción 1 | Sin anotación |
  | La primera | Sin anotación |
  | Computadora | Sin anotación |
  | Laptop | Sin anotación |
  | Impresora | Sin anotación |

  > Las frases "1", "Opción 1", "La primera" y las categorías sueltas no requieren anotación. Solo anota la palabra "producto/productos/equipo" cuando aparezca.

- **Action and parameters:**
  - Parameter: `tipo_cotizacion`
  - Entity: `@tipo_cotizacion`
  - Required: ❌ (no obligatorio)

- **Contexts:**
  - Input contexts: `cotizacion_tipo`
  - Output contexts: `cotizacion_producto` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Hereda el `startTime` del contexto anterior, establece el tipo de cotización como "producto" y muestra las categorías: 1) Computadora de escritorio, 2) Repuestos de laptop, 3) Impresora, 4) Accesorios y componentes.

---

### Intent 3: `cotizar_servicio_tipo`

**Propósito:** El usuario elige cotizar un servicio técnico. Pregunta para qué tipo de equipo y luego consulta la BD de servicios.

**Configuración:**

- Training Phrases (12):

  | Escribe en Dialogflow | Selecciona y anota |
  |-----------------------|--------------------|
  | **Servicios** | Selecciona `Servicios` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | **Servicio** | Selecciona `Servicio` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | Quiero cotizar un **servicio** | Selecciona `servicio` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | **Mantenimiento** | Selecciona `Mantenimiento` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | **Reparación** | Selecciona `Reparación` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | ¿Cuánto cuesta el **mantenimiento**? | Selecciona `mantenimiento` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | **Servicio técnico** | Selecciona `Servicio técnico` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | Necesito un **servicio** | Selecciona `servicio` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |
  | 2 | Sin anotación (el webhook interpreta "2" como servicio) |
  | Opción 2 | Sin anotación |
  | La segunda | Sin anotación |
  | **Instalación** | Selecciona `Instalación` → asignar a `@tipo_cotizacion` como `tipo_cotizacion` |

- **Action and parameters:**
  - Parameter 1: `tipo_cotizacion`
    - Entity: `@tipo_cotizacion`
    - Required: ❌ (no obligatorio)
  - Parameter 2: `tipo_equipo`
    - Entity: `@tipo_equipo`
    - Required: ❌ (no obligatorio, se pide en el webhook si no se proporciona)

- **Contexts:**
  - Input contexts: `cotizacion_tipo`
  - Output contexts: `cotizacion_servicio` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Si el usuario proporcionó un tipo de equipo, consulta la BD de servicios para ese equipo y muestra las opciones con precios. Si no proporcionó equipo, pregunta: "¿Para qué tipo de equipo necesita el servicio? 1) PC, 2) Laptop, 3) Impresora, 4) Cámara de seguridad".

---

---

### Intent 4: `cotizar_servicio_equipo` ⭐ NUEVO

**Propósito:** Recibe el tipo de equipo del usuario para la cotización de servicios. Si los servicios ya fueron mostrados (el usuario responde directamente con un número), actúa como seleccionador.

**Configuración:**

- Training Phrases (12):

  | Escribe en Dialogflow | Selecciona y anota |
  |-----------------------|--------------------|
  | **PC** | Selecciona `PC` → asignar a `@tipo_equipo` como `tipo_equipo` |
  | **Laptop** | Selecciona `Laptop` → asignar a `@tipo_equipo` como `tipo_equipo` |
  | **Impresora** | Selecciona `Impresora` → asignar a `@tipo_equipo` como `tipo_equipo` |
  | **Cámara de seguridad** | Selecciona `Cámara de seguridad` → asignar a `@tipo_equipo` como `tipo_equipo` |
  | Para una **laptop** | Selecciona `laptop` → asignar a `@tipo_equipo` como `tipo_equipo` |
  | Es una **PC** | Selecciona `PC` → asignar a `@tipo_equipo` como `tipo_equipo` |
  | 1 | Sin anotación |
  | 2 | Sin anotación |
  | 3 | Sin anotación |
  | 4 | Sin anotación |
  | La primera | Sin anotación |
  | La segunda | Sin anotación |

- **Action and parameters:**
  - Parameter: `tipo_equipo`
  - Entity: `@tipo_equipo`
  - Required: ❌ (no obligatorio; el webhook normaliza el texto libre)

- **Contexts:**
  - Input contexts: `cotizacion_servicio`
  - Output contexts: `cotizacion_servicio` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Verifica si ya hay opciones de servicio en el contexto. Si las hay, actúa como seleccionador (el usuario está eligiendo). Si no las hay, normaliza el tipo de equipo, consulta la BD y muestra los servicios disponibles.

---

### Intent 5: `cotizar_servicio_seleccionar` ⭐ NUEVO

**Propósito:** Permite al usuario seleccionar explícitamente un servicio de la lista mostrada usando frases descriptivas o de selección explícita.

**Configuración:**

- Training Phrases (12):

  ```
  La primera
  La segunda
  La tercera
  El primero
  El segundo
  Quiero ese
  Me interesa el primero
  Me interesa el segundo
  Esa opción
  Quiero la primera opción
  Quiero la segunda opción
  Quiero la tercera opción
  ```

- **Action and parameters:** Ninguno

- **Contexts:**
  - Input contexts: `cotizacion_servicio`
  - Output contexts: `cotizacion_items` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Parsea la selección del usuario, toma el servicio correspondiente de `serviceOptions` en el contexto, lo agrega a la lista de items con `unitPrice = basePrice`, y transiciona a `cotizacion_items` preguntando si desea agregar algo más.

> **Nota:** Los números simples ("1", "2") son manejados principalmente por `cotizar_servicio_equipo`. Este intent captura las frases descriptivas más explícitas para aumentar la cobertura.

---

### Intent 6: `cotizar_producto_generico` ⭐ NUEVO

**Propósito:** Maneja la selección de categorías de producto que no tienen un flujo dedicado: Impresora (opción 3) y Accesorios y componentes (opción 4). Consulta la BD y muestra productos disponibles, o redirige a contacto si el catálogo está vacío.

**Configuración:**

- Training Phrases (12):

  | Escribe en Dialogflow | Selecciona y anota |
  |-----------------------|--------------------|
  | **Impresora** | Selecciona `Impresora` → asignar a `@categoria_producto` como `categoria_producto` |
  | **Accesorios y componentes** | Selecciona `Accesorios y componentes` → asignar a `@categoria_producto` como `categoria_producto` |
  | **Accesorios** | Selecciona `Accesorios` → asignar a `@categoria_producto` como `categoria_producto` |
  | Necesito una **impresora** | Selecciona `impresora` → asignar a `@categoria_producto` como `categoria_producto` |
  | Quiero cotizar **accesorios** | Selecciona `accesorios` → asignar a `@categoria_producto` como `categoria_producto` |
  | 3 | Sin anotación (el webhook detecta que es opción 3 = impresora) |
  | 4 | Sin anotación (el webhook detecta que es opción 4 = accesorios) |
  | Opción 3 | Sin anotación |
  | Opción 4 | Sin anotación |
  | La tercera | Sin anotación |
  | La cuarta | Sin anotación |
  | **Componentes** | Selecciona `Componentes` → asignar a `@categoria_producto` como `categoria_producto` |

- **Action and parameters:**
  - Parameter: `categoria_producto`
  - Entity: `@categoria_producto`
  - Required: ❌ (no obligatorio; el webhook detecta la categoría del texto)

- **Contexts:**
  - Input contexts: `cotizacion_producto`
  - Output contexts: (dejar vacío — el webhook establece el contexto correcto según el resultado de la consulta a BD)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Detecta si el usuario quiere impresora (opción 3) o accesorios (opción 4). Consulta la BD con `Product.find({ category, isActive: true, stock: { $gt: 0 } })`. Si encuentra productos, los muestra y establece `cotizar_computadora_opciones` para usar el mismo paso de selección. Si no hay productos en catálogo, responde con un mensaje amigable con datos de contacto directo.

> **Nota sobre selección:** Cuando este intent muestra opciones de impresoras/accesorios, el usuario selecciona usando el intent `cotizar_computadora_seleccionar` (mismo que para PCs), ya que ambos leen de `cotizar_computadora_opciones`.

---

### Intent 7: `cotizar_computadora`

**Propósito:** El usuario elige cotizar una computadora de escritorio. Pregunta el caso de uso.

**Configuración:**

- Training Phrases (10):

  | Escribe en Dialogflow | Selecciona y anota |
  |-----------------------|--------------------|
  | **Computadora de escritorio** | Selecciona `Computadora de escritorio` → asignar a `@categoria_producto` como `categoria_producto` |
  | **Computadora** | Selecciona `Computadora` → asignar a `@categoria_producto` como `categoria_producto` |
  | **PC** | Selecciona `PC` → asignar a `@categoria_producto` como `categoria_producto` |
  | **Desktop** | Selecciona `Desktop` → asignar a `@categoria_producto` como `categoria_producto` |
  | Quiero cotizar una **PC** | Selecciona `PC` → asignar a `@categoria_producto` como `categoria_producto` |
  | Quiero una **computadora** | Selecciona `computadora` → asignar a `@categoria_producto` como `categoria_producto` |
  | **Equipo de escritorio** | Selecciona `Equipo de escritorio` → asignar a `@categoria_producto` como `categoria_producto` |
  | 1 | Sin anotación (el webhook interpreta "1" como computadora) |
  | Opción 1 | Sin anotación |
  | La primera | Sin anotación |

- **Action and parameters:**
  - Parameter: `categoria_producto`
  - Entity: `@categoria_producto`
  - Required: ❌ (no obligatorio)

- **Contexts:**
  - Input contexts: `cotizacion_producto`
  - Output contexts: `cotizar_computadora_en_curso` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Establece el contexto `cotizar_computadora_en_curso` y muestra las opciones de uso: 1) Ofimática, 2) Diseño gráfico, 3) Programación, 4) Gaming, 5) Estudio.

---

### Intent 8: `cotizar_computadora_uso`

**Propósito:** Capturar el caso de uso de la computadora. Consulta la BD y muestra opciones con precios.

**Configuración:**

- Training Phrases (15):

  | Escribe en Dialogflow | Selecciona y anota |
  |-----------------------|--------------------|
  | **Ofimática** | Selecciona `Ofimática` → asignar a `@uso_computadora` como `uso_computadora` |
  | Para **oficina** | Selecciona `oficina` → asignar a `@uso_computadora` como `uso_computadora` |
  | **Diseño** | Selecciona `Diseño` → asignar a `@uso_computadora` como `uso_computadora` |
  | Para **diseño gráfico** | Selecciona `diseño gráfico` → asignar a `@uso_computadora` como `uso_computadora` |
  | **Programación** | Selecciona `Programación` → asignar a `@uso_computadora` como `uso_computadora` |
  | Para **programar** | Selecciona `programar` → asignar a `@uso_computadora` como `uso_computadora` |
  | **Gaming** | Selecciona `Gaming` → asignar a `@uso_computadora` como `uso_computadora` |
  | Para **juegos** | Selecciona `juegos` → asignar a `@uso_computadora` como `uso_computadora` |
  | **Estudio** | Selecciona `Estudio` → asignar a `@uso_computadora` como `uso_computadora` |
  | Para **estudiar** | Selecciona `estudiar` → asignar a `@uso_computadora` como `uso_computadora` |
  | Para la **universidad** | Selecciona `universidad` → asignar a `@uso_computadora` como `uso_computadora` |
  | Para el **trabajo** | Selecciona `trabajo` → asignar a `@uso_computadora` como `uso_computadora` |
  | **Básica** | Selecciona `Básica` → asignar a `@uso_computadora` como `uso_computadora` |
  | 1 | Sin anotación |
  | 2 | Sin anotación |

  > Dialogflow puede auto-detectar valores de `@uso_computadora` si la entidad ya fue creada. Si no lo hace, selecciona manualmente la palabra resaltada.

- **Action and parameters:**
  - Parameter: `uso_computadora`
  - Entity: `@uso_computadora`
  - Required: ❌ (no obligatorio; el webhook tiene fallback para normalizar texto libre)

- **Contexts:**
  - Input contexts: `cotizar_computadora_en_curso`
  - Output contexts: `cotizar_computadora_opciones` (lifespan: 5)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Normaliza el caso de uso del usuario, consulta la colección `products` filtrando por `category: "computadora"` y `specifications.useCase` igual al caso de uso, y muestra 2-3 opciones con nombre, especificaciones (procesador, RAM, almacenamiento, GPU) y precio. Si no hay opciones, informa al usuario y vuelve a mostrar los casos de uso.

---

### Intent 9: `cotizar_computadora_seleccionar`

**Propósito:** El usuario selecciona una de las opciones de computadora mostradas.

**Configuración:**

- Training Phrases (12):

  ```
  1
  2
  3
  La primera
  La segunda
  La tercera
  Me interesa la primera
  Esa
  La opción 1
  La opción 2
  Quiero la primera opción
  Quiero la segunda opción
  ```

- **Action and parameters:**
  - Parameter: `number`
  - Entity: `@sys.number`
  - Required: ❌ (no obligatorio; el webhook parsea el query directamente)

- **Contexts:**
  - Input contexts: `cotizar_computadora_opciones`
  - Output contexts: `cotizacion_items` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Parsea el número de selección del usuario, obtiene el producto correspondiente de las opciones guardadas en el contexto, lo agrega a la lista de items de la cotización y pregunta: "¿Desea agregar algo más o procedemos con sus datos?".

---

### Intent 10: `cotizar_repuesto_laptop`

**Propósito:** El usuario quiere cotizar un repuesto de laptop. Captura el modelo de laptop y opcionalmente el tipo de repuesto.

**Configuración:**

- Training Phrases (12):

  | Escribe en Dialogflow | Selecciona y anota |
  |-----------------------|--------------------|
  | **Repuesto de laptop** | Selecciona `Repuesto de laptop` → asignar a `@categoria_producto` como `categoria_producto` |
  | **Repuestos** | Selecciona `Repuestos` → asignar a `@categoria_producto` como `categoria_producto` |
  | Pantalla para laptop | Sin anotación directa (el webhook extrae "pantalla" como tipo_repuesto) |
  | Teclado de laptop | Sin anotación directa |
  | Batería para laptop | Sin anotación directa |
  | Necesito un **repuesto** | Selecciona `repuesto` → asignar a `@categoria_producto` como `categoria_producto` |
  | Quiero cotizar un **repuesto** | Selecciona `repuesto` → asignar a `@categoria_producto` como `categoria_producto` |
  | 2 | Sin anotación (el webhook interpreta "2" como repuesto) |
  | Opción 2 | Sin anotación |
  | La segunda | Sin anotación |
  | **HP Pavilion 15** | Selecciona `HP Pavilion 15` → asignar a `@sys.any` como `modelo_equipo` |
  | **Dell Inspiron** | Selecciona `Dell Inspiron` → asignar a `@sys.any` como `modelo_equipo` |

  > Las frases con modelo de laptop ("HP Pavilion 15", "Dell Inspiron") se anotan con `@sys.any` como `modelo_equipo`. Selecciona todo el nombre del modelo. `@sys.any` requiere selección manual siempre.

- **Action and parameters:**
  - Parameter 1: `modelo_equipo`
    - Entity: `@sys.any`
    - Required: ❌ (no obligatorio en el intent; el webhook lo pide si no se proporciona)
  - Parameter 2: `tipo_repuesto`
    - Entity: `@sys.any`
    - Required: ❌ (no obligatorio; el webhook lo pide si no se proporciona)

- **Contexts:**
  - Input contexts: `cotizacion_producto`
  - Output contexts: `cotizar_repuesto_en_curso` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Si falta el modelo de laptop, pregunta "¿Cuál es el modelo de su laptop?". Si falta el tipo de repuesto, muestra las opciones: 1) Pantalla, 2) Teclado, 3) Batería, 4) Disco SSD, 5) Memoria RAM, 6) Cargador, 7) Otro. Si ambos datos están presentes, consulta la BD filtrando por `category: "componente"`, `specifications.type` y compatibilidad con el modelo, y muestra las opciones con precio de repuesto y precio con instalación.

**NOTA SOBRE CONTEXTOS:** Este intent debe tener **solamente `cotizacion_producto`** como input context. NO agregues `cotizar_repuesto_en_curso` como segundo input context, porque en Dialogflow ES los múltiples input contexts funcionan con **lógica AND** (todos deben estar activos simultáneamente), lo que impediría que el intent se active en la selección de categoría.

El flujo de continuación (cuando el usuario proporciona el tipo de repuesto después de dar el modelo) se maneja porque `cotizacion_producto` sigue activo con lifespan 8, suficiente para cubrir los pasos del flujo.

**NOTA SOBRE DESAMBIGUACIÓN:** Como `cotizar_computadora` y `cotizar_repuesto_laptop` comparten el mismo input context (`cotizacion_producto`), Dialogflow puede confundir la clasificación. Para evitar problemas, el webhook de `cotizar_computadora` detecta automáticamente si el parámetro `categoria_producto` es `repuesto_laptop` y redirige al flujo correcto de repuestos. Esto garantiza que incluso si Dialogflow elige el intent equivocado, el usuario llegará al flujo correcto.

---

### Intent 11: `cotizar_repuesto_seleccionar`

**Propósito:** El usuario selecciona un repuesto de las opciones mostradas. Puede indicar si quiere con o sin instalación.

**Configuración:**

- Training Phrases (14):

  ```
  1
  2
  3
  La primera
  La segunda
  Esa opción
  Me interesa
  Sí, con instalación
  Solo el repuesto
  Con instalación
  Sin instalación
  La primera con instalación
  La primera opción
  Quiero la segunda
  ```

- **Action and parameters:**
  - Parameter: `number`
  - Entity: `@sys.number`
  - Required: ❌ (no obligatorio)

- **Contexts:**
  - Input contexts: `cotizar_repuesto_en_curso`
  - Output contexts: `cotizacion_items` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Parsea la selección del usuario. Detecta si el usuario mencionó "con instalación" para agregar también el servicio de instalación como item adicional. Agrega los items a la cotización y pregunta si desea agregar algo más.

---

### Intent 12: `cotizar_agregar_mas`

**Propósito:** El usuario quiere agregar más productos a su cotización.

**Configuración:**

- Training Phrases (10):

  ```
  Sí, quiero agregar más
  Agregar otro producto
  Quiero ver más opciones
  Sí, agregar
  Otro producto
  Quiero añadir algo más
  Sí, agregar más
  Necesito otro artículo
  Agregar
  Sí más
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cotizacion_items`
  - Output contexts: `cotizacion_producto` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Preserva los items ya agregados en el contexto y vuelve a mostrar las categorías de productos: 1) Computadora de escritorio, 2) Repuestos de laptop, 3) Impresora, 4) Accesorios y componentes.

---

### Intent 13: `cotizar_datos_cliente`

**Propósito:** El usuario no desea agregar más productos. Se captura nombre y teléfono para generar la cotización.

**Configuración:**

- Training Phrases (10):

  | Escribe en Dialogflow | Selecciona y anota |
  |-----------------------|--------------------|
  | No, así está bien | Sin anotación |
  | Proceder | Sin anotación |
  | Eso es todo | Sin anotación |
  | Ya no más | Sin anotación |
  | Continuar | Sin anotación |
  | Quiero generar la cotización | Sin anotación |
  | No agregar más | Sin anotación |
  | Ya está bien así | Sin anotación |
  | Listo | Sin anotación |
  | No, continuar | Sin anotación |

  > Este intent no requiere anotación en las training phrases iniciales. Los parámetros nombre y teléfono se capturan mediante **slot filling** (Dialogflow los pide automáticamente usando los prompts configurados).

- **Action and parameters:**
  - Parameter 1: `nombre_cliente`
    - Entity: `@sys.person`
    - Required: ✅
    - Prompts: "Para generar su cotización necesito algunos datos. ¿Cuál es su nombre completo?"
  - Parameter 2: `telefono`
    - Entity: `@sys.phone-number`
    - Required: ✅
    - Prompts: "Gracias. ¿Su número de teléfono o WhatsApp?"

- **Contexts:**
  - Input contexts: `cotizacion_items`
  - Output contexts: `cotizacion_confirmar` (lifespan: 3)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**IMPORTANTE:** Este intent cambia el contexto de salida a `cotizacion_confirmar` porque es el último paso antes de la confirmación.

**Lo que hace el webhook:** Valida el teléfono (9 dígitos), calcula subtotal, IGV (18%) y total, y muestra un resumen de la cotización con todos los items, precios y datos del cliente, pidiendo confirmación (Sí/No).

---

### Intent 14: `cotizar_confirmar_si`

**Propósito:** El usuario confirma la cotización.

**Configuración:**

- Training Phrases (10):

  ```
  Sí
  Confirmo
  Correcto
  Está bien
  De acuerdo
  Ok
  Confirmar
  Generar
  Perfecto
  Adelante
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cotizacion_confirmar`
  - Output contexts: Ninguno (termina el flujo)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:**

1. Genera un número de cotización (COT-YYYYMMDD-XXX)
2. Calcula subtotal, IGV (18%) y total
3. Guarda la cotización en MongoDB con status "generada"
4. Envía cotización por WhatsApp (simulado)
5. Registra métricas de duración de creación (creationDurationMs)
6. Limpia los contextos `cotizacion_confirmar` y `cotizacion_items`
7. Muestra mensaje de confirmación con código, total y fecha de validez

---

### Intent 15: `cotizar_confirmar_no`

**Propósito:** El usuario cancela o quiere modificar algo antes de confirmar la cotización.

**Configuración:**

- Training Phrases (8):

  ```
  No
  Cancelar
  No quiero
  Cambiar
  Modificar
  No confirmo
  Mejor no
  Quiero cambiar algo
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cotizacion_confirmar`
  - Output contexts: `cotizacion_items` (lifespan: 8)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**IMPORTANTE:** Este intent vuelve a establecer `cotizacion_items` para que el usuario pueda retomar el flujo y modificar la cotización.

**Lo que hace el webhook:** Preserva todos los items ya seleccionados y ofrece opciones: 1) Agregar más productos, 2) Cambiar mis datos, 3) Cancelar la cotización.

---

## Paso 3: Verificación y Testing

### Checklist de Verificación

**Entidades (3):**

- [ ] `@uso_computadora` creada con 5 valores (ofimatica, diseno, programacion, gaming, estudio)
- [ ] `@categoria_producto` creada con 4 valores (computadora, repuesto_laptop, impresora, accesorio)
- [ ] `@tipo_cotizacion` creada con 2 valores (producto, servicio)

**Intents de cotización (15):**

- [ ] `cotizar_iniciar` con webhook habilitado y output context `cotizacion_tipo`
- [ ] `cotizar_producto_categoria` con input `cotizacion_tipo` y output `cotizacion_producto`
- [ ] `cotizar_servicio_tipo` con input `cotizacion_tipo` y output `cotizacion_servicio` y webhook habilitado
- [ ] `cotizar_servicio_equipo` ⭐ **NUEVO** con input `cotizacion_servicio` y output `cotizacion_servicio` (8) y webhook habilitado
- [ ] `cotizar_servicio_seleccionar` ⭐ **NUEVO** con input `cotizacion_servicio` y output `cotizacion_items` (8) y webhook habilitado
- [ ] `cotizar_producto_generico` ⭐ **NUEVO** con input `cotizacion_producto` y webhook habilitado
- [ ] `cotizar_computadora` con input `cotizacion_producto` y output `cotizar_computadora_en_curso`
- [ ] `cotizar_computadora_uso` con input `cotizar_computadora_en_curso` y output `cotizar_computadora_opciones` y webhook habilitado
- [ ] `cotizar_computadora_seleccionar` con input `cotizar_computadora_opciones` y output `cotizacion_items` y webhook habilitado
- [ ] `cotizar_repuesto_laptop` con input `cotizacion_producto` (solamente) y output `cotizar_repuesto_en_curso` y webhook habilitado
- [ ] `cotizar_repuesto_seleccionar` con input `cotizar_repuesto_en_curso` y output `cotizacion_items` y webhook habilitado
- [ ] `cotizar_agregar_mas` con input `cotizacion_items` y output `cotizacion_producto` y webhook habilitado
- [ ] `cotizar_datos_cliente` con input `cotizacion_items` y output `cotizacion_confirmar` y parámetros `nombre_cliente` y `telefono` requeridos y webhook habilitado
- [ ] `cotizar_confirmar_si` con input `cotizacion_confirmar` y sin output context y webhook habilitado
- [ ] `cotizar_confirmar_no` con input `cotizacion_confirmar` y output `cotizacion_items` y webhook habilitado

**Verificación general:**

- [ ] Los 15 intents tienen webhook habilitado
- [ ] Los parámetros requeridos tienen sus prompts configurados
- [ ] Los nombres de contexto coinciden exactamente con los especificados

---

### Pruebas en el Simulador

**Prueba A: Flujo completo — Cotizar computadora de escritorio**

```
Usuario: Quiero una cotización
Bot: [Pregunta producto o servicio]

Usuario: Productos
Bot: [Muestra categorías: Computadora, Repuestos, Impresora, Accesorios]

Usuario: Computadora
Bot: [Muestra casos de uso: Ofimática, Diseño, Programación, Gaming, Estudio]

Usuario: Para oficina
Bot: [Muestra 2 opciones con specs y precios]

Usuario: 2
Bot: [Confirma producto agregado, pregunta si agregar más]

Usuario: No, así está bien
Bot: [Pide nombre completo]

Usuario: Juan Pérez
Bot: [Pide teléfono]

Usuario: 975123456
Bot: [Muestra resumen: producto, subtotal, IGV, total, pide confirmación]

Usuario: Sí
Bot: [Muestra código COT-..., total, validez, y confirma envío por WhatsApp]
```

**Prueba B: Flujo completo — Cotizar repuesto de laptop**

> **Importante:** El flujo de repuestos requiere pasar primero por `cotizar_iniciar` y `cotizar_producto_categoria` para que el contexto `cotizacion_producto` esté activo. No se puede iniciar directamente con "Necesito una pantalla para mi laptop" porque el intent `cotizar_repuesto_laptop` necesita ese contexto.

```
Usuario: Quiero una cotización
Bot: [Pregunta producto o servicio]

Usuario: Productos
Bot: [Muestra categorías: Computadora, Repuestos, Impresora, Accesorios]

Usuario: Repuestos de laptop
Bot: [Pide modelo de laptop]

Usuario: HP Pavilion 15
Bot: [Muestra opciones de repuesto: pantalla, teclado, batería, etc.]

Usuario: Pantalla
Bot: [Muestra pantallas compatibles con precio de repuesto y con instalación]

Usuario: Sí, con instalación
Bot: [Agrega pantalla + servicio de instalación, pregunta si agregar más]

Usuario: No, continuar
Bot: [Pide nombre]

Usuario: María López
Bot: [Pide teléfono]

Usuario: 987654321
Bot: [Muestra resumen con 2 items, subtotal, IGV, total]

Usuario: Sí
Bot: [Confirma cotización]
```

**Prueba C: Cotizar servicio técnico**

> **Importante:** Al igual que los productos, el flujo de servicios requiere pasar primero por `cotizar_iniciar` para que el contexto `cotizacion_tipo` esté activo.

```
Usuario: Quiero una cotización
Bot: [Pregunta producto o servicio]

Usuario: Servicios
Bot: [Pregunta tipo de equipo: PC, Laptop, Impresora, Cámara]

Usuario: Laptop
Bot: [Muestra servicios para laptop con precios: Mantenimiento, Formateo, etc.]
```

**Prueba D: Agregar múltiples items**

```
Usuario: Quiero una cotización
Bot: [Pregunta producto o servicio]

Usuario: Productos
Bot: [Muestra categorías]

Usuario: Computadora
Bot: [Muestra casos de uso]

Usuario: Gaming
Bot: [Muestra opciones gaming]

Usuario: 1
Bot: [Agrega PC Gamer Entry, pregunta si agregar más]

Usuario: Sí, agregar más
Bot: [Vuelve a mostrar categorías]

Usuario: Repuestos de laptop
Bot: [Pide modelo]

... (continúa agregando items)
```

**Prueba E: Cancelar antes de confirmar**

```
... (hasta llegar al resumen)

Usuario: No
Bot: [Ofrece opciones: Agregar más, Cambiar datos, Cancelar]
```

### Verificar en Logs del Servidor

Cuando pruebes, verifica en la terminal del servidor:

- `[Webhook] Intent: cotizar_...` para cada paso
- `[QuotesService] Found X computers for use case: Y` cuando consulta BD
- `[QuotesService] Quote created: COT-XXXXXXXX-XXX` cuando se confirma
- `[WhatsAppService] SIMULATED WhatsApp Quote` con la cotización completa
- Sin errores en rojo

---

## Paso 4: Seedear la Base de Datos

Antes de probar los flujos de cotización, es necesario cargar el catálogo de productos y servicios en MongoDB:

```bash
cd bricebot
node fulfillment/src/scripts/seed-products.js
```

Deberías ver:

```
[Seed] Connected to MongoDB
[Seed] Clearing existing products...
[Seed] Clearing existing services...
[Seed] Inserting computers...
[Seed] Inserted 10 computers
[Seed] Inserting laptop parts...
[Seed] Inserted 13 laptop parts
[Seed] Inserting services...
[Seed] Inserted 9 services

[Seed] Summary:
  Computers: 10
  Laptop Parts: 13
  Services: 9
  Total Products: 23

[Seed] Done. Database seeded successfully.
```

Para verificar en MongoDB:

```bash
mongosh cbricenho
```

```javascript
db.products.countDocuments()                                    // 23
db.products.find({category: "computadora"}).count()             // 10
db.products.find({category: "componente"}).count()              // 13
db.services.countDocuments()                                    // 9
db.products.find({"specifications.useCase": "gaming"}).count()  // 2
```

---

## Catálogo de Productos Incluidos

### Computadoras de Escritorio (10)

| Uso | Nombre | Specs clave | Precio |
|-----|--------|-------------|--------|
| Ofimática | PC Básica Ofimática | i3-12100, 8GB, 256GB SSD | S/ 1,450 |
| Ofimática | PC Ofimática Plus | i5-12400, 16GB, 512GB SSD | S/ 2,150 |
| Diseño | PC Diseño Gráfico | i5-13400F, 16GB, 512GB NVMe, GTX 1650 | S/ 3,200 |
| Diseño | PC Diseño Profesional | i7-13700F, 32GB DDR5, 1TB NVMe, RTX 3060 | S/ 5,500 |
| Gaming | PC Gamer Entry | i5-12400F, 16GB, 512GB NVMe, GTX 1660S | S/ 3,000 |
| Gaming | PC Gamer Pro | i7-13700F, 32GB DDR5, 1TB NVMe, RTX 4060 | S/ 5,800 |
| Programación | PC Desarrollo | i5-13400, 16GB, 512GB NVMe | S/ 2,500 |
| Programación | PC Desarrollo Avanzado | i7-13700, 32GB DDR5, 1TB NVMe | S/ 4,200 |
| Estudio | PC Estudio Básica | i3-12100, 8GB, 256GB SSD | S/ 1,350 |
| Estudio | PC Estudio Completa | i5-12400, 16GB, 512GB SSD | S/ 1,950 |

### Repuestos de Laptop (13)

| Tipo | Nombre | Precio |
|------|--------|--------|
| Pantalla | LCD 14" HD | S/ 220 |
| Pantalla | LCD 15.6" HD | S/ 280 |
| Pantalla | IPS 15.6" FHD | S/ 380 |
| Teclado | Universal ES | S/ 120 |
| Teclado | HP Pavilion 15 | S/ 150 |
| Batería | Universal 4 celdas | S/ 180 |
| Batería | Alta Capacidad 6 celdas | S/ 250 |
| Disco | SSD 240GB SATA | S/ 120 |
| Disco | SSD 480GB SATA | S/ 180 |
| Disco | SSD 500GB NVMe | S/ 200 |
| Memoria | RAM 8GB DDR4 | S/ 110 |
| Memoria | RAM 16GB DDR4 | S/ 200 |
| Cargador | Universal 65W | S/ 80 |

### Servicios Técnicos (9)

| Servicio | Equipos | Precio Base | Duración |
|----------|---------|-------------|----------|
| Mantenimiento Preventivo | PC, Laptop | S/ 80 | 1-2 horas |
| Mantenimiento Correctivo | PC, Laptop | S/ 120 | 2-4 horas |
| Cambio de Pantalla | Laptop | S/ 70 | 1-2 horas |
| Cambio de Teclado | Laptop | S/ 50 | 30min-1h |
| Repotenciación (RAM/SSD) | PC, Laptop | S/ 50 | 30min-1h |
| Formateo + Windows | PC, Laptop | S/ 80 | 2-3 horas |
| Software Especializado | PC, Laptop | S/ 40 | 1-2 horas |
| Cámaras de Seguridad (1-4) | Cámara | S/ 350 | 4-6 horas |
| Mantenimiento Impresora | Impresora | S/ 60 | 1-2 horas |

---

## Troubleshooting

### El bot no muestra productos

1. Verifica que ejecutaste el seed: `node fulfillment/src/scripts/seed-products.js`
2. Verifica en MongoDB que hay datos: `db.products.find().count()`
3. Revisa los logs del servidor para ver el mensaje `[QuotesService] Found X computers for use case: Y`
4. Si muestra "Found 0 computers", verifica que el campo `specifications.useCase` coincide

### El contexto se pierde durante la cotización

1. Verifica los lifespans de cada contexto en Dialogflow Console
2. El flujo de cotización puede requerir hasta 8 pasos; los lifespans de 8 cubren esto
3. Asegúrate de que los nombres de contexto coincidan **exactamente** (sin espacios, sin mayúsculas)

### El bot responde un intent incorrecto

- Verifica que las training phrases no se solapen entre intents de cotización y citas
- Los intents con input context solo se activan cuando ese contexto está presente
- Si "Sí" activa `cita_local_confirmar_si` en vez de `cotizar_confirmar_si`, verifica que el contexto `cotizacion_confirmar` esté activo (no `cita_local_confirmar`)

### El bot confunde "Impresora" en el flujo de servicios con la categoría de productos

Este fue el bug original de la iteración. Está corregido en el código:

- `handleQuoteProductCategory` ahora limpia `cotizacion_tipo` (lifespan: 0) inmediatamente
- `handleQuoteServiceType` hace lo mismo
- Una vez elegido el tipo, el contexto `cotizacion_tipo` ya no está activo, por lo que `cotizar_producto_categoria` no puede activarse

Si el problema persiste, verifica en Dialogflow Console que `cotizar_servicio_equipo` esté creado con input context `cotizacion_servicio`.

### El flujo de servicios no avanza después de mostrar opciones

Si el bot muestra los servicios pero no responde al número de selección:

1. Verifica que `cotizar_servicio_seleccionar` existe en Dialogflow con input context `cotizacion_servicio`
2. Verifica que `cotizar_servicio_equipo` también existe (para el caso donde el bot pide el tipo de equipo)
3. Ambos intents deben tener webhook habilitado

### El bot no muestra opciones para Impresora o Accesorios

1. El catálogo puede estar vacío para esas categorías (el seed no las incluye por defecto)
2. El bot mostrará un mensaje de contacto directo con teléfono y WhatsApp — esto es comportamiento esperado
3. Para agregar productos al catálogo: añadir entries al `seed-products.js` con `category: 'impresora'` o `category: 'accesorio'` y re-ejecutar el seed

### Error al generar cotización

1. Verifica la conexión a MongoDB en los logs
2. Revisa que el modelo `Quote.js` esté correctamente importado
3. Verifica que `items` no esté vacío en el contexto `cotizacion_confirmar`

### El cálculo de IGV parece incorrecto

- El IGV se calcula como 18% del subtotal: `igv = subtotal * 0.18`
- Total = subtotal + igv
- Ejemplo: Producto S/ 2,150 → IGV S/ 387.00 → Total S/ 2,537.00

---

## Archivos de código relacionados

| Archivo | Propósito |
|---------|-----------|
| `fulfillment/src/handlers/quotes.handler.js` | 15 handlers para todos los intents de cotización |
| `fulfillment/src/services/quotes.service.js` | Lógica de negocio: consulta BD, normalización de equipos, cálculo de precios |
| `fulfillment/src/models/Product.js` | Modelo de productos (computadoras, repuestos, impresoras, accesorios) |
| `fulfillment/src/models/Service.js` | Modelo de servicios técnicos |
| `fulfillment/src/models/Quote.js` | Modelo de cotizaciones con generación de número |
| `fulfillment/src/utils/formatters.js` | Formato de opciones, resumen, confirmación, WhatsApp |
| `fulfillment/src/utils/validators.js` | Validación de teléfono, email, selección numérica y descriptiva |
| `fulfillment/src/config/constants.js` | Mensajes, IGV (18%), validez (7 días) |
| `fulfillment/src/index.js` | Webhook principal con mapeo de los 15 intents |
| `fulfillment/src/scripts/seed-products.js` | Script de carga de catálogo |

---

## Próximos Pasos

Una vez completada esta configuración:

1. ✅ Probar flujo de cotización de computadora completo
2. ✅ Probar flujo de cotización de repuesto de laptop completo
3. ✅ Probar flujo de cotización de servicio técnico
4. ✅ Probar agregar múltiples items a una cotización
5. ✅ Verificar que las cotizaciones se guardan en MongoDB
6. ✅ Recopilar métricas de tiempo de generación de cotización
7. Documentar resultados para la tesis

---

**Fecha de creación:** Febrero 16, 2026  
**Iteración:** 3 - Cotizaciones  
**Estado:** Listo para configurar

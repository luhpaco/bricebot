# Guía de Configuración de Dialogflow - Iteración 2 (Gestión de Citas)

Esta guía te ayudará a configurar todos los intents y entidades necesarios para el módulo de gestión de citas en Dialogflow Console. Cada intent está especificado de forma completa e independiente.

---

## Pre-requisitos

- ✅ Iteración 1 (FAQ) completada y funcionando
- ✅ Acceso a [Dialogflow Console](https://dialogflow.cloud.google.com)
- ✅ Webhook habilitado y URL actualizada
- ✅ Servidor corriendo con el código de la Iteración 2
- ✅ Google Calendar API habilitada y configurada (ver [Paso 5](#paso-5-configurar-google-calendar-api) — necesario antes de probar los flujos de citas)

---

## Cómo anotar Training Phrases con parámetros

En Dialogflow, cuando un intent tiene parámetros, debes **anotar** partes de las frases de entrenamiento para vincularlas con la entidad correspondiente. Esto le enseña a Dialogflow qué parte del texto del usuario debe extraer como dato.

### Proceso general

1. **Escribe la frase** en el campo de Training Phrases usando un valor de ejemplo real (no el nombre de la entidad).
2. **Selecciona** con el mouse la parte del texto que corresponde al parámetro.
3. **Asigna la entidad** del menú desplegable que aparece.
4. Dialogflow creará automáticamente el parámetro en la tabla de abajo, o lo vinculará si ya existe.

### Ejemplo visual

Si quieres anotar "Es una **laptop**" con la entidad `@tipo_equipo`:

```
Paso 1: Escribe "Es una laptop" en Training Phrases
Paso 2: Selecciona con el mouse la palabra "laptop"
Paso 3: En el menú desplegable, elige @tipo_equipo
Paso 4: Verifica que el parámetro "tipo_equipo" aparezca en la tabla de parámetros
```

### Auto-anotación

Dialogflow detecta automáticamente algunos valores de entidades del sistema (`@sys.date`, `@sys.time`, `@sys.phone-number`, `@sys.person`) y los anota sin que tengas que seleccionar manualmente. Si no los detecta, selecciona el texto manualmente y asígnalo.

### Convención usada en esta guía

En las Training Phrases de cada intent, se usa esta notación:

- El texto entre corchetes `[texto]` indica **la parte que debes seleccionar** para anotar
- Después de la flecha `→` se indica la **entidad que debes asignar**
- Las frases sin corchetes no requieren anotación (se selecciona toda la frase o Dialogflow la auto-detecta)

---

## Resumen de Iteración 1 (referencia)

Los siguientes 8 intents ya deben estar creados y funcionando antes de continuar:

| #   | Intent                    | Propósito                 |
| --- | ------------------------- | ------------------------- |
| 1   | `saludo`                  | Bienvenida al usuario     |
| 2   | `despedida`               | Despedida                 |
| 3   | `ayuda`                   | Menú de opciones          |
| 4   | `faq_horarios`            | Horarios de atención      |
| 5   | `faq_ubicacion`           | Dirección y mapa          |
| 6   | `faq_contacto`            | Teléfono, WhatsApp, email |
| 7   | `faq_redes_sociales`      | Facebook, Instagram       |
| 8   | `Default Fallback Intent` | Mensaje no entendido      |

Las entidades ya creadas en Iteración 1 son:

- **@tipo_equipo** (PC, laptop, impresora, camara, monitor, otro)
- **@tipo_servicio** (mantenimiento, cambio_teclado, cambio_pantalla, repotenciacion, instalacion_software, instalacion_camaras)

Ambas entidades se reutilizan en esta iteración. La guía completa de Iteración 1 está en `docs/DIALOGFLOW_INTENTS_SETUP.md`.

---

## Resumen de la Iteración 2 (20 intents)

| #   | Intent                         | Propósito            | Input Context              | Output Context                 |
| --- | ------------------------------ | -------------------- | -------------------------- | ------------------------------ |
| 1   | `cita_iniciar`                 | Punto de entrada     | Ninguno                    | `cita_seleccion_tipo` (5)      |
| 2   | `cita_local_iniciar`           | Elige local          | `cita_seleccion_tipo`      | `cita_local_en_curso` (10)     |
| 3   | `cita_local_equipo`            | Tipo de equipo       | `cita_local_en_curso`      | `cita_local_en_curso` (10)     |
| 4   | `cita_local_problema`          | Descripción problema | `cita_local_en_curso`      | `cita_local_en_curso` (10)     |
| 5   | `cita_local_nombre`            | Nombre cliente       | `cita_local_en_curso`      | `cita_local_en_curso` (10)     |
| 6   | `cita_local_telefono`          | Teléfono             | `cita_local_en_curso`      | `cita_local_en_curso` (10)     |
| 7   | `cita_local_fecha`             | Fecha de cita        | `cita_local_en_curso`      | `cita_local_en_curso` (10)     |
| 8   | `cita_local_hora`              | Hora exacta          | `cita_local_en_curso`      | `cita_local_confirmar` (3)     |
| 9   | `cita_local_confirmar_si`      | Confirma cita        | `cita_local_confirmar`     | Ninguno                        |
| 10  | `cita_local_confirmar_no`      | Cancela/modifica     | `cita_local_confirmar`     | `cita_local_en_curso` (10)     |
| 11  | `cita_domicilio_iniciar`       | Elige domicilio      | `cita_seleccion_tipo`      | `cita_domicilio_en_curso` (12) |
| 12  | `cita_domicilio_equipo`        | Tipo de equipo       | `cita_domicilio_en_curso`  | `cita_domicilio_en_curso` (12) |
| 13  | `cita_domicilio_problema`      | Descripción problema | `cita_domicilio_en_curso`  | `cita_domicilio_en_curso` (12) |
| 14  | `cita_domicilio_nombre`        | Nombre cliente       | `cita_domicilio_en_curso`  | `cita_domicilio_en_curso` (12) |
| 15  | `cita_domicilio_telefono`      | Teléfono             | `cita_domicilio_en_curso`  | `cita_domicilio_en_curso` (12) |
| 16  | `cita_domicilio_direccion`     | Dirección            | `cita_domicilio_en_curso`  | `cita_domicilio_en_curso` (12) |
| 17  | `cita_domicilio_fecha`         | Fecha de cita        | `cita_domicilio_en_curso`  | `cita_domicilio_en_curso` (12) |
| 18  | `cita_domicilio_rango_horario` | Rango horario        | `cita_domicilio_en_curso`  | `cita_domicilio_confirmar` (3) |
| 19  | `cita_domicilio_confirmar_si`  | Confirma cita        | `cita_domicilio_confirmar` | Ninguno                        |
| 20  | `cita_domicilio_confirmar_no`  | Cancela/modifica     | `cita_domicilio_confirmar` | `cita_domicilio_en_curso` (12) |

### Diferencias clave entre flujo LOCAL y DOMICILIO

| Aspecto                         | Local                     | Domicilio                                      |
| ------------------------------- | ------------------------- | ---------------------------------------------- |
| Lifespan del contexto principal | 10                        | 12 (más pasos)                                 |
| Después del teléfono            | Va directo a fecha        | Pide dirección primero                         |
| Selección de hora               | Hora exacta (`@sys.time`) | Rango horario (`@rango_horario`: mañana/tarde) |
| Validación extra                | Ninguna                   | Validación de cobertura (Provincia de Paita)   |
| Pasos totales del usuario       | 8                         | 9 (agrega dirección)                           |
| Opciones al cancelar            | Fecha, Hora, Cancelar     | Fecha, Horario, Dirección, Cancelar            |

### Diagrama de flujo de contextos

```
                    cita_iniciar
                         |
                         v
              [cita_seleccion_tipo] (lifespan: 5)
                    /              \
                   v                v
     cita_local_iniciar    cita_domicilio_iniciar
           |                        |
           v                        v
  [cita_local_en_curso]    [cita_domicilio_en_curso]
     (lifespan: 10)           (lifespan: 12)
           |                        |
           v                        v
     equipo (3)               equipo (12)
           |                        |
           v                        v
     problema (4)             problema (13)
           |                        |
           v                        v
     nombre (5)               nombre (14)
           |                        |
           v                        v
     telefono (6)             telefono (15)
           |                        |
           v                        v
     fecha (7)                direccion (16)
           |                        |
           v                        v
     hora (8)                 fecha (17)
           |                        |
           v                        v
  [cita_local_confirmar]    rango_horario (18)
     (lifespan: 3)                  |
        /       \                   v
       v         v         [cita_domicilio_confirmar]
  si (9)     no (10)          (lifespan: 3)
                                 /       \
                                v         v
                           si (19)     no (20)
```

---

## Paso 1: Crear Nueva Entidad Personalizada

### @rango_horario

1. Ve a **Entities** en el menú lateral
2. Haz clic en **CREATE ENTITY**
3. Nombre: `rango_horario`
4. Agrega los siguientes valores con sinónimos:

| Valor  | Sinónimos                                                         |
| ------ | ----------------------------------------------------------------- |
| mañana | mañana, manana, por la mañana, en la mañana, 8 a 12, temprano, am |
| tarde  | tarde, por la tarde, en la tarde, 2 a 6, después de almuerzo, pm  |

5. Haz clic en **SAVE**

---

## Paso 2: Crear Intents de Cita en Local (Intents 1-10)

### Intent 1: `cita_iniciar`

**Propósito:** Punto de entrada para agendar cualquier tipo de cita. Pregunta si el servicio será en local o a domicilio.

**Configuración:**

- Training Phrases (15):

  ```
  Quiero agendar una cita
  Necesito servicio técnico
  Agendar cita
  Programar una cita
  Reservar cita
  Mi equipo está fallando
  Tengo un problema con mi computadora
  Necesito reparar mi laptop
  Quiero que revisen mi equipo
  Agendar servicio
  Necesito una cita
  Puedo agendar
  Cómo agendo una cita
  Quiero hacer una cita
  Me gustaría agendar
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: Ninguno
  - Output contexts: `cita_seleccion_tipo` (lifespan: 5)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío, se maneja en webhook)

**Lo que hace el webhook:** Establece el contexto `cita_seleccion_tipo` con un `startTime` para medir métricas de duración, y responde preguntando al usuario si prefiere visitar el local o servicio a domicilio.

---

### Intent 2: `cita_local_iniciar`

**Propósito:** El usuario elige atenderse en el local. Inicia el flujo de cita presencial.

**Configuración:**

- Training Phrases (10):

  ```
  Visitar local
  Voy a ir al local
  Prefiero ir yo
  En el local
  Presencial
  1
  Opción 1
  La primera
  Local
  Llevar mi equipo
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cita_seleccion_tipo`
  - Output contexts: `cita_local_en_curso` (lifespan: 10)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Hereda el `startTime` del contexto anterior, establece el tipo de cita como "local" y muestra las opciones de tipo de equipo (PC, laptop, impresora, cámara, otro).

---

### Intent 3: `cita_local_equipo`

**Propósito:** Capturar el tipo de equipo que el cliente necesita reparar.

**Configuración:**

- Training Phrases (5):

  | Escribe en Dialogflow   | Selecciona y anota                                                     |
  | ----------------------- | ---------------------------------------------------------------------- |
  | Es una **laptop**       | Selecciona `laptop` → asignar a `@tipo_equipo` como `tipo_equipo`      |
  | **computadora**         | Selecciona `computadora` → asignar a `@tipo_equipo` como `tipo_equipo` |
  | Tengo una **impresora** | Selecciona `impresora` → asignar a `@tipo_equipo` como `tipo_equipo`   |
  | Mi **laptop**           | Selecciona `laptop` → asignar a `@tipo_equipo` como `tipo_equipo`      |
  | Una **PC**              | Selecciona `PC` → asignar a `@tipo_equipo` como `tipo_equipo`          |

  > Usa valores reales distintos de la entidad `@tipo_equipo` (laptop, computadora, impresora, PC, cámara, etc.) en cada frase. Dialogflow puede auto-detectar la anotación si la entidad ya existe.

- **Action and parameters:**
  - Parameter: `tipo_equipo`
  - Entity: `@tipo_equipo`
  - Required: ✅
  - Prompts: "¿Qué tipo de equipo es? (PC, laptop, impresora, cámara, otro)"

- **Contexts:**
  - Input contexts: `cita_local_en_curso`
  - Output contexts: `cita_local_en_curso` (lifespan: 10)
- **Fulfillment:** ✅ Enable webhook call for this intent

**Lo que hace el webhook:** Guarda el tipo de equipo en el contexto y pregunta al usuario cuál es el problema o servicio que necesita.

---

### Intent 4: `cita_local_problema`

**Propósito:** Capturar la descripción del problema o servicio requerido.

**Configuración:**

- Training Phrases (8):

  | Escribe en Dialogflow  | Selecciona y anota                                                              |
  | ---------------------- | ------------------------------------------------------------------------------- |
  | No enciende            | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | Está lenta             | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | Necesita mantenimiento | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | Se apaga sola          | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | Tiene virus            | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | No imprime             | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | La pantalla está rota  | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | El teclado no funciona | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |

  > Como se usa `@sys.any`, debes seleccionar **todo el texto** de cada frase y asignarlo manualmente. `@sys.any` no se auto-detecta; siempre requiere selección manual.

- **Action and parameters:**
  - Parameter: `descripcion_problema`
  - Entity: `@sys.any`
  - Required: ✅
  - Prompts: "¿Podría describir el problema o servicio que necesita?"

- **Contexts:**
  - Input contexts: `cita_local_en_curso`
  - Output contexts: `cita_local_en_curso` (lifespan: 10)
- **Fulfillment:** ✅ Enable webhook call for this intent

**Lo que hace el webhook:** Guarda la descripción del problema en el contexto y pregunta el nombre completo del cliente.

---

### Intent 5: `cita_local_nombre`

**Propósito:** Capturar el nombre completo del cliente.

**Configuración:**

- Training Phrases (4):

  | Escribe en Dialogflow       | Selecciona y anota                                                         |
  | --------------------------- | -------------------------------------------------------------------------- |
  | Me llamo **Juan Pérez**     | Selecciona `Juan Pérez` → asignar a `@sys.person` como `nombre_cliente`    |
  | Soy **María López**         | Selecciona `María López` → asignar a `@sys.person` como `nombre_cliente`   |
  | **Carlos García**           | Selecciona `Carlos García` → asignar a `@sys.person` como `nombre_cliente` |
  | Mi nombre es **Ana Torres** | Selecciona `Ana Torres` → asignar a `@sys.person` como `nombre_cliente`    |

  > Usa nombres de ejemplo diferentes en cada frase. Dialogflow suele auto-detectar `@sys.person`, pero si no lo hace, selecciona el nombre manualmente y asigna la entidad.

- **Action and parameters:**
  - Parameter: `nombre_cliente`
  - Entity: `@sys.person`
  - Required: ✅
  - Prompts: "¿Cuál es su nombre completo?"

- **Contexts:**
  - Input contexts: `cita_local_en_curso`
  - Output contexts: `cita_local_en_curso` (lifespan: 10)
- **Fulfillment:** ✅ Enable webhook call for this intent

**Lo que hace el webhook:** Guarda el nombre del cliente en el contexto y pregunta su número de teléfono o WhatsApp.

---

### Intent 6: `cita_local_telefono`

**Propósito:** Capturar el teléfono del cliente.

**Configuración:**

- Training Phrases (4):

  | Escribe en Dialogflow            | Selecciona y anota                                                     |
  | -------------------------------- | ---------------------------------------------------------------------- |
  | Mi número es **975123456**       | Selecciona `975123456` → asignar a `@sys.phone-number` como `telefono` |
  | **987654321**                    | Selecciona `987654321` → asignar a `@sys.phone-number` como `telefono` |
  | Es el **912345678**              | Selecciona `912345678` → asignar a `@sys.phone-number` como `telefono` |
  | Pueden llamarme al **965432178** | Selecciona `965432178` → asignar a `@sys.phone-number` como `telefono` |

  > Dialogflow suele auto-detectar números de teléfono como `@sys.phone-number`. Si no lo hace, selecciona el número manualmente.

- **Action and parameters:**
  - Parameter: `telefono`
  - Entity: `@sys.phone-number`
  - Required: ✅
  - Prompts: "¿Cuál es su número de teléfono o WhatsApp?"

- **Contexts:**
  - Input contexts: `cita_local_en_curso`
  - Output contexts: `cita_local_en_curso` (lifespan: 10)
- **Fulfillment:** ✅ Enable webhook call for this intent

**Lo que hace el webhook:** Valida el teléfono (9 dígitos), lo normaliza, lo guarda en el contexto y muestra las fechas disponibles de los próximos 7 días.

---

### Intent 7: `cita_local_fecha`

**Propósito:** Capturar la fecha deseada para la cita.

**Configuración:**

- Training Phrases (7):

  | Escribe en Dialogflow | Selecciona y anota                                              |
  | --------------------- | --------------------------------------------------------------- |
  | El **15 de febrero**  | Selecciona `15 de febrero` → asignar a `@sys.date` como `fecha` |
  | Para el **lunes**     | Selecciona `lunes` → asignar a `@sys.date` como `fecha`         |
  | **20 de febrero**     | Selecciona `20 de febrero` → asignar a `@sys.date` como `fecha` |
  | Mañana                | Dialogflow auto-detecta `@sys.date` en toda la frase            |
  | Pasado mañana         | Dialogflow auto-detecta `@sys.date` en toda la frase            |
  | El lunes              | Dialogflow auto-detecta `@sys.date` en toda la frase            |
  | Esta semana           | Dialogflow auto-detecta `@sys.date` en toda la frase            |

  > Las expresiones temporales relativas (mañana, pasado mañana, el lunes, esta semana) son auto-detectadas por `@sys.date`. Para fechas explícitas, selecciona solo la parte de la fecha.

- **Action and parameters:**
  - Parameter: `fecha`
  - Entity: `@sys.date`
  - Required: ✅
  - Prompts: "¿Qué fecha prefiere? (Disponible hasta 7 días)"

- **Contexts:**
  - Input contexts: `cita_local_en_curso`
  - Output contexts: `cita_local_en_curso` (lifespan: 10)
- **Fulfillment:** ✅ Enable webhook call for this intent

**Lo que hace el webhook:** Valida que la fecha esté dentro de los próximos 7 días y sea día hábil, consulta los horarios disponibles vía Google Calendar API y los muestra al usuario.

---

### Intent 8: `cita_local_hora`

**Propósito:** Capturar la hora específica de la cita.

**Configuración:**

- Training Phrases (7):

  | Escribe en Dialogflow     | Selecciona y anota                                               |
  | ------------------------- | ---------------------------------------------------------------- |
  | A las **10 de la mañana** | Selecciona `10 de la mañana` → asignar a `@sys.time` como `hora` |
  | **3 de la tarde**         | Selecciona `3 de la tarde` → asignar a `@sys.time` como `hora`   |
  | A las **10**              | Selecciona `10` → asignar a `@sys.time` como `hora`              |
  | En la mañana              | Dialogflow auto-detecta `@sys.time` en toda la frase             |
  | Por la tarde              | Dialogflow auto-detecta `@sys.time` en toda la frase             |
  | **3 pm**                  | Selecciona `3 pm` → asignar a `@sys.time` como `hora`            |
  | **15:00**                 | Selecciona `15:00` → asignar a `@sys.time` como `hora`           |

  > Los formatos de hora (10, 3 pm, 15:00) son auto-detectados por `@sys.time` en la mayoría de casos. Si no se detectan, selecciona manualmente la parte de la hora.

- **Action and parameters:**
  - Parameter: `hora`
  - Entity: `@sys.time`
  - Required: ✅
  - Prompts: "¿A qué hora le conviene?"

- **Contexts:**
  - Input contexts: `cita_local_en_curso`
  - Output contexts: `cita_local_confirmar` (lifespan: 3)
- **Fulfillment:** ✅ Enable webhook call for this intent

**IMPORTANTE:** Este intent cambia el contexto de salida a `cita_local_confirmar` (no `cita_local_en_curso`), porque es el último paso antes de la confirmación.

**Lo que hace el webhook:** Valida la hora dentro del horario de atención, verifica disponibilidad del slot (máximo 3 citas simultáneas), y muestra un resumen completo de la cita pidiendo confirmación (Sí/No).

---

### Intent 9: `cita_local_confirmar_si`

**Propósito:** El usuario confirma la cita en local.

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
  Vale
  Perfecto
  Adelante
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cita_local_confirmar`
  - Output contexts: Ninguno (termina el flujo)
- **Fulfillment:** ✅ Enable webhook call for this intent

**Lo que hace el webhook:**

1. Genera un número de referencia (CITA-YYYYMMDD-XXX)
2. Crea un evento en Google Calendar
3. Guarda la cita en MongoDB con status "confirmada"
4. Envía confirmación por WhatsApp (simulado)
5. Registra métricas de duración de creación
6. Limpia los contextos `cita_local_confirmar` y `cita_local_en_curso`
7. Muestra mensaje de confirmación con el código de referencia

---

### Intent 10: `cita_local_confirmar_no`

**Propósito:** El usuario cancela o quiere modificar algo antes de confirmar.

**Configuración:**

- Training Phrases (7):

  ```
  No
  Cancelar
  No quiero
  Cambiar
  Modificar
  No confirmo
  Mejor no
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cita_local_confirmar`
  - Output contexts: `cita_local_en_curso` (lifespan: 10)
- **Fulfillment:** ✅ Enable webhook call for this intent

**IMPORTANTE:** Este intent vuelve a establecer `cita_local_en_curso` para que el usuario pueda retomar el flujo y modificar datos.

**Lo que hace el webhook:** Preserva todos los datos ya recolectados y ofrece opciones: 1) Cambiar fecha, 2) Cambiar hora, 3) Cancelar completamente.

---

## Paso 3: Crear Intents de Cita a Domicilio (Intents 11-20)

### Intent 11: `cita_domicilio_iniciar`

**Propósito:** El usuario elige servicio a domicilio. Inicia el flujo de cita con recogida de equipo.

**Configuración:**

- Training Phrases (10):

  ```
  A domicilio
  Que vayan a mi casa
  Servicio a domicilio
  Prefiero domicilio
  Que recojan mi equipo
  2
  Opción 2
  La segunda
  Domicilio
  En mi casa
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cita_seleccion_tipo`
  - Output contexts: `cita_domicilio_en_curso` (lifespan: 12)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Hereda el `startTime` del contexto anterior, establece el tipo de cita como "domicilio" y muestra las opciones de tipo de equipo (PC, laptop, impresora, cámara, otro).

---

### Intent 12: `cita_domicilio_equipo`

**Propósito:** Capturar el tipo de equipo que el cliente necesita reparar (flujo domicilio).

**Configuración:**

- Training Phrases (5):

  | Escribe en Dialogflow   | Selecciona y anota                                                     |
  | ----------------------- | ---------------------------------------------------------------------- |
  | Es una **computadora**  | Selecciona `computadora` → asignar a `@tipo_equipo` como `tipo_equipo` |
  | **laptop**              | Selecciona `laptop` → asignar a `@tipo_equipo` como `tipo_equipo`      |
  | Tengo una **impresora** | Selecciona `impresora` → asignar a `@tipo_equipo` como `tipo_equipo`   |
  | Mi **PC**               | Selecciona `PC` → asignar a `@tipo_equipo` como `tipo_equipo`          |
  | Una **cámara**          | Selecciona `cámara` → asignar a `@tipo_equipo` como `tipo_equipo`      |

  > Usa valores reales distintos de la entidad `@tipo_equipo` en cada frase. Dialogflow puede auto-detectar la anotación si la entidad ya existe.

- **Action and parameters:**
  - Parameter: `tipo_equipo`
  - Entity: `@tipo_equipo`
  - Required: ✅
  - Prompts: "¿Qué tipo de equipo es? (PC, laptop, impresora, cámara, otro)"

- **Contexts:**
  - Input contexts: `cita_domicilio_en_curso`
  - Output contexts: `cita_domicilio_en_curso` (lifespan: 12)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Guarda el tipo de equipo en el contexto y pregunta al usuario cuál es el problema o servicio que necesita.

---

### Intent 13: `cita_domicilio_problema`

**Propósito:** Capturar la descripción del problema o servicio requerido (flujo domicilio).

**Configuración:**

- Training Phrases (8):

  | Escribe en Dialogflow  | Selecciona y anota                                                              |
  | ---------------------- | ------------------------------------------------------------------------------- |
  | No enciende            | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | Está lenta             | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | Necesita mantenimiento | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | Se apaga sola          | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | Tiene virus            | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | No imprime             | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | La pantalla está rota  | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |
  | El teclado no funciona | Selecciona **toda la frase** → asignar a `@sys.any` como `descripcion_problema` |

  > Como se usa `@sys.any`, debes seleccionar **todo el texto** de cada frase y asignarlo manualmente. `@sys.any` no se auto-detecta; siempre requiere selección manual.

- **Action and parameters:**
  - Parameter: `descripcion_problema`
  - Entity: `@sys.any`
  - Required: ✅
  - Prompts: "¿Podría describir el problema o servicio que necesita?"

- **Contexts:**
  - Input contexts: `cita_domicilio_en_curso`
  - Output contexts: `cita_domicilio_en_curso` (lifespan: 12)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Guarda la descripción del problema en el contexto y pregunta el nombre completo del cliente.

---

### Intent 14: `cita_domicilio_nombre`

**Propósito:** Capturar el nombre completo del cliente (flujo domicilio).

**Configuración:**

- Training Phrases (4):

  | Escribe en Dialogflow          | Selecciona y anota                                                         |
  | ------------------------------ | -------------------------------------------------------------------------- |
  | Me llamo **Pedro Ruiz**        | Selecciona `Pedro Ruiz` → asignar a `@sys.person` como `nombre_cliente`    |
  | Soy **Laura Sánchez**          | Selecciona `Laura Sánchez` → asignar a `@sys.person` como `nombre_cliente` |
  | **Roberto Díaz**               | Selecciona `Roberto Díaz` → asignar a `@sys.person` como `nombre_cliente`  |
  | Mi nombre es **Sofía Mendoza** | Selecciona `Sofía Mendoza` → asignar a `@sys.person` como `nombre_cliente` |

  > Usa nombres de ejemplo diferentes en cada frase y diferentes a los del Intent 5 (flujo local). Dialogflow suele auto-detectar `@sys.person`, pero si no lo hace, selecciona el nombre manualmente.

- **Action and parameters:**
  - Parameter: `nombre_cliente`
  - Entity: `@sys.person`
  - Required: ✅
  - Prompts: "¿Cuál es su nombre completo?"

- **Contexts:**
  - Input contexts: `cita_domicilio_en_curso`
  - Output contexts: `cita_domicilio_en_curso` (lifespan: 12)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Guarda el nombre del cliente en el contexto y pregunta su número de teléfono o WhatsApp.

---

### Intent 15: `cita_domicilio_telefono`

**Propósito:** Capturar el teléfono del cliente (flujo domicilio).

**Configuración:**

- Training Phrases (4):

  | Escribe en Dialogflow            | Selecciona y anota                                                     |
  | -------------------------------- | ---------------------------------------------------------------------- |
  | Mi número es **951234567**       | Selecciona `951234567` → asignar a `@sys.phone-number` como `telefono` |
  | **976543210**                    | Selecciona `976543210` → asignar a `@sys.phone-number` como `telefono` |
  | Es el **943216789**              | Selecciona `943216789` → asignar a `@sys.phone-number` como `telefono` |
  | Pueden llamarme al **918765432** | Selecciona `918765432` → asignar a `@sys.phone-number` como `telefono` |

  > Dialogflow suele auto-detectar números de teléfono como `@sys.phone-number`. Si no lo hace, selecciona el número manualmente. Usa números diferentes a los del Intent 6 (flujo local).

- **Action and parameters:**
  - Parameter: `telefono`
  - Entity: `@sys.phone-number`
  - Required: ✅
  - Prompts: "¿Cuál es su número de teléfono o WhatsApp?"

- **Contexts:**
  - Input contexts: `cita_domicilio_en_curso`
  - Output contexts: `cita_domicilio_en_curso` (lifespan: 12)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Valida el teléfono (9 dígitos), lo normaliza, lo guarda en el contexto y pregunta la dirección completa para el servicio a domicilio.

**DIFERENCIA con local:** En el flujo local, después del teléfono se muestran las fechas disponibles. En domicilio, se pide primero la dirección.

---

### Intent 16: `cita_domicilio_direccion`

**Propósito:** Capturar la dirección del cliente para el servicio a domicilio. Este intent es exclusivo del flujo domicilio.

**Configuración:**

- Training Phrases (3):

  | Escribe en Dialogflow                                      | Selecciona y anota                                                                          |
  | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
  | **Calle Los Pinos 123, Paita**                             | Selecciona **toda la frase** → asignar a `@sys.any` como `direccion`                        |
  | Vivo en **Av. Marco Jara Mz D Lt 10, Paita**               | Selecciona `Av. Marco Jara Mz D Lt 10, Paita` → asignar a `@sys.any` como `direccion`       |
  | Mi dirección es **Jr. Bolognesi 456, Pueblo Nuevo, Paita** | Selecciona `Jr. Bolognesi 456, Pueblo Nuevo, Paita` → asignar a `@sys.any` como `direccion` |

  > Como se usa `@sys.any`, debes seleccionar manualmente la parte que corresponde a la dirección. En la primera frase se selecciona todo; en las demás, solo la parte después de "Vivo en" o "Mi dirección es". `@sys.any` nunca se auto-detecta.

- **Action and parameters:**
  - Parameter 1: `direccion`
    - Entity: `@sys.any`
    - Required: ✅
    - Prompts: "¿Cuál es su dirección completa?"
  - Parameter 2: `referencia`
    - Entity: `@sys.any`
    - Required: ❌ (opcional, no necesita anotación en training phrases)

- **Contexts:**
  - Input contexts: `cita_domicilio_en_curso`
  - Output contexts: `cita_domicilio_en_curso` (lifespan: 12)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:** Valida que la dirección tenga al menos 10 caracteres, verifica que esté dentro de la zona de cobertura (Provincia de Paita: paita, marco jara, san francisco, pueblo nuevo, villa marina, colán, la huaca), y luego muestra las fechas disponibles de los próximos 7 días.

---

### Intent 17: `cita_domicilio_fecha`

**Propósito:** Capturar la fecha deseada para la cita a domicilio.

**Configuración:**

- Training Phrases (7):

  | Escribe en Dialogflow | Selecciona y anota                                              |
  | --------------------- | --------------------------------------------------------------- |
  | El **18 de febrero**  | Selecciona `18 de febrero` → asignar a `@sys.date` como `fecha` |
  | Para el **viernes**   | Selecciona `viernes` → asignar a `@sys.date` como `fecha`       |
  | **14 de febrero**     | Selecciona `14 de febrero` → asignar a `@sys.date` como `fecha` |
  | Mañana                | Dialogflow auto-detecta `@sys.date` en toda la frase            |
  | Pasado mañana         | Dialogflow auto-detecta `@sys.date` en toda la frase            |
  | El lunes              | Dialogflow auto-detecta `@sys.date` en toda la frase            |
  | Esta semana           | Dialogflow auto-detecta `@sys.date` en toda la frase            |

  > Las expresiones temporales relativas son auto-detectadas por `@sys.date`. Para fechas explícitas, selecciona solo la parte de la fecha. Usa fechas de ejemplo diferentes a las del Intent 7 (flujo local).

- **Action and parameters:**
  - Parameter: `fecha`
  - Entity: `@sys.date`
  - Required: ✅
  - Prompts: "¿Qué fecha prefiere? (Disponible hasta 7 días)"

- **Contexts:**
  - Input contexts: `cita_domicilio_en_curso`
  - Output contexts: `cita_domicilio_en_curso` (lifespan: 12)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**DIFERENCIA con local:** Después de seleccionar la fecha, en local se muestran horarios exactos disponibles. En domicilio se muestran dos rangos horarios (mañana/tarde).

**Lo que hace el webhook:** Valida que la fecha esté dentro de los próximos 7 días y sea día hábil, la guarda en el contexto y muestra las opciones de rango horario: 1) Mañana (8:00 AM - 12:00 PM), 2) Tarde (2:00 PM - 6:00 PM).

---

### Intent 18: `cita_domicilio_rango_horario`

**Propósito:** Capturar el rango horario preferido (mañana o tarde). Este intent es exclusivo del flujo domicilio y reemplaza al intent de hora exacta del flujo local.

**Configuración:**

- Training Phrases (6):

  | Escribe en Dialogflow | Selecciona y anota                                                    |
  | --------------------- | --------------------------------------------------------------------- |
  | **mañana**            | Selecciona `mañana` → asignar a `@rango_horario` como `rango_horario` |
  | En la **mañana**      | Selecciona `mañana` → asignar a `@rango_horario` como `rango_horario` |
  | Por la **tarde**      | Selecciona `tarde` → asignar a `@rango_horario` como `rango_horario`  |
  | Prefiero la **tarde** | Selecciona `tarde` → asignar a `@rango_horario` como `rango_horario`  |
  | 1                     | Sin anotación (el webhook interpreta "1" como mañana)                 |
  | 2                     | Sin anotación (el webhook interpreta "2" como tarde)                  |

  > Solo selecciona la palabra "mañana" o "tarde", no "En la" ni "Por la". Dialogflow puede auto-detectar valores de `@rango_horario` si la entidad ya fue creada. Las frases "1" y "2" no requieren anotación.

- **Action and parameters:**
  - Parameter: `rango_horario`
  - Entity: `@rango_horario`
  - Required: ✅
  - Prompts: "¿Qué rango horario prefiere? Mañana (8:00-12:00) o Tarde (14:00-18:00)"

- **Contexts:**
  - Input contexts: `cita_domicilio_en_curso`
  - Output contexts: `cita_domicilio_confirmar` (lifespan: 3)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**IMPORTANTE:** Este intent cambia el contexto de salida a `cita_domicilio_confirmar` (no `cita_domicilio_en_curso`), porque es el último paso antes de la confirmación.

**Lo que hace el webhook:** Convierte el rango a una hora representativa (mañana = 10:00, tarde = 15:00) para Google Calendar, guarda el rango en el contexto y muestra un resumen completo de la cita pidiendo confirmación (Sí/No).

---

### Intent 19: `cita_domicilio_confirmar_si`

**Propósito:** El usuario confirma la cita a domicilio.

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
  Vale
  Perfecto
  Adelante
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cita_domicilio_confirmar`
  - Output contexts: Ninguno (termina el flujo)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**Lo que hace el webhook:**

1. Genera un número de referencia (CITA-YYYYMMDD-XXX)
2. Crea un evento en Google Calendar
3. Guarda la cita en MongoDB con status "confirmada" e incluye dirección y referencia
4. Envía confirmación por WhatsApp (simulado)
5. Registra métricas de duración de creación
6. Limpia los contextos `cita_domicilio_confirmar` y `cita_domicilio_en_curso`
7. Muestra mensaje de confirmación con el código de referencia

---

### Intent 20: `cita_domicilio_confirmar_no`

**Propósito:** El usuario cancela o quiere modificar algo antes de confirmar la cita a domicilio.

**Configuración:**

- Training Phrases (7):

  ```
  No
  Cancelar
  No quiero
  Cambiar
  Modificar
  No confirmo
  Mejor no
  ```

- **Action and parameters:** Ninguno
- **Contexts:**
  - Input contexts: `cita_domicilio_confirmar`
  - Output contexts: `cita_domicilio_en_curso` (lifespan: 12)
- **Fulfillment:** ✅ Enable webhook call for this intent
- **Responses:** (dejar vacío)

**IMPORTANTE:** Este intent vuelve a establecer `cita_domicilio_en_curso` para que el usuario pueda retomar el flujo y modificar datos.

**Lo que hace el webhook:** Preserva todos los datos ya recolectados y ofrece opciones: 1) Cambiar fecha, 2) Cambiar horario, 3) Cambiar dirección, 4) Cancelar completamente.

---

## Paso 4: Verificación y Testing

### Checklist de Verificación

**Entidad:**

- [ ] `@rango_horario` creada con 2 valores (mañana, tarde)

**Intents de cita en local (10):**

- [ ] `cita_iniciar` con webhook habilitado y output context `cita_seleccion_tipo`
- [ ] `cita_local_iniciar` con input `cita_seleccion_tipo` y output `cita_local_en_curso`
- [ ] `cita_local_equipo` con input/output `cita_local_en_curso` y parámetro `tipo_equipo` requerido
- [ ] `cita_local_problema` con input/output `cita_local_en_curso` y parámetro `descripcion_problema` requerido
- [ ] `cita_local_nombre` con input/output `cita_local_en_curso` y parámetro `nombre_cliente` requerido
- [ ] `cita_local_telefono` con input/output `cita_local_en_curso` y parámetro `telefono` requerido
- [ ] `cita_local_fecha` con input/output `cita_local_en_curso` y parámetro `fecha` requerido
- [ ] `cita_local_hora` con input `cita_local_en_curso` y output `cita_local_confirmar` y parámetro `hora` requerido
- [ ] `cita_local_confirmar_si` con input `cita_local_confirmar` y sin output context
- [ ] `cita_local_confirmar_no` con input `cita_local_confirmar` y output `cita_local_en_curso`

**Intents de cita a domicilio (10):**

- [ ] `cita_domicilio_iniciar` con input `cita_seleccion_tipo` y output `cita_domicilio_en_curso`
- [ ] `cita_domicilio_equipo` con input/output `cita_domicilio_en_curso` y parámetro `tipo_equipo` requerido
- [ ] `cita_domicilio_problema` con input/output `cita_domicilio_en_curso` y parámetro `descripcion_problema` requerido
- [ ] `cita_domicilio_nombre` con input/output `cita_domicilio_en_curso` y parámetro `nombre_cliente` requerido
- [ ] `cita_domicilio_telefono` con input/output `cita_domicilio_en_curso` y parámetro `telefono` requerido
- [ ] `cita_domicilio_direccion` con input/output `cita_domicilio_en_curso` y parámetro `direccion` requerido
- [ ] `cita_domicilio_fecha` con input/output `cita_domicilio_en_curso` y parámetro `fecha` requerido
- [ ] `cita_domicilio_rango_horario` con input `cita_domicilio_en_curso` y output `cita_domicilio_confirmar` y parámetro `rango_horario` requerido
- [ ] `cita_domicilio_confirmar_si` con input `cita_domicilio_confirmar` y sin output context
- [ ] `cita_domicilio_confirmar_no` con input `cita_domicilio_confirmar` y output `cita_domicilio_en_curso`

**Verificación general:**

- [ ] Los 20 intents tienen webhook habilitado
- [ ] Todos los parámetros requeridos tienen sus prompts configurados
- [ ] Los nombres de contexto coinciden exactamente con los especificados

---

### Pruebas en el Simulador

**Prueba A: Flujo completo de cita en local**

```
Usuario: Quiero agendar una cita
Bot: [Pregunta local o domicilio]

Usuario: En el local
Bot: [Pregunta tipo de equipo]

Usuario: Laptop
Bot: [Pregunta problema]

Usuario: No enciende
Bot: [Pregunta nombre]

Usuario: Juan Pérez
Bot: [Pregunta teléfono]

Usuario: 975123456
Bot: [Muestra fechas disponibles]

Usuario: Mañana
Bot: [Muestra horarios disponibles]

Usuario: 10 de la mañana
Bot: [Muestra resumen y pide confirmación]

Usuario: Sí
Bot: [Confirma cita con código de referencia]
```

**Prueba B: Flujo completo de cita a domicilio**

```
Usuario: Quiero agendar una cita
Bot: [Pregunta local o domicilio]

Usuario: A domicilio
Bot: [Pregunta tipo de equipo]

Usuario: PC
Bot: [Pregunta problema]

Usuario: Está lenta
Bot: [Pregunta nombre]

Usuario: María López
Bot: [Pregunta teléfono]

Usuario: 987654321
Bot: [Pregunta dirección]

Usuario: Calle Los Pinos 123, Paita
Bot: [Muestra fechas disponibles]

Usuario: Pasado mañana
Bot: [Muestra opciones: Mañana o Tarde]

Usuario: En la mañana
Bot: [Muestra resumen y pide confirmación]

Usuario: Sí
Bot: [Confirma cita con código de referencia]
```

**Prueba C: Cancelar antes de confirmar**

```
Usuario: Quiero agendar una cita
Bot: [Pregunta local o domicilio]

Usuario: En el local
Bot: [Pregunta tipo de equipo]

... (completar hasta el resumen) ...

Usuario: No
Bot: [Ofrece opciones: Cambiar fecha, Cambiar hora, Cancelar]
```

### Verificar en Logs del Servidor

Cuando pruebes, verifica en la terminal del servidor:

- `[Webhook] Intent: cita_...` para cada paso
- `[CalendarService] Event created` cuando se confirme
- `[WhatsAppService] SIMULATED WhatsApp Message` con la confirmación
- Sin errores en rojo

---

## Paso 5: Configurar Google Calendar API

El módulo de citas utiliza Google Calendar API para verificar disponibilidad, crear eventos y gestionar citas. Sin esta configuración, los intents `cita_local_fecha`, `cita_local_hora`, `cita_local_confirmar_si`, `cita_domicilio_fecha`, `cita_domicilio_rango_horario` y `cita_domicilio_confirmar_si` fallarán al intentar acceder al calendario.

### 5.1: Habilitar Google Calendar API en Google Cloud Console

1. Ingresa a [Google Cloud Console](https://console.cloud.google.com/)
2. Asegúrate de tener seleccionado tu proyecto (el mismo de Dialogflow: `bricebot-486701`)
   - En la barra superior, verifica que aparezca el nombre del proyecto
   - Si no, haz clic en el selector de proyectos y elige `bricebot-486701`
3. Ve a **APIs & Services** > **Library** (o navega directamente a [API Library](https://console.cloud.google.com/apis/library))
4. En el buscador, escribe **Google Calendar API**
5. Haz clic en **Google Calendar API** en los resultados
6. Haz clic en el botón **ENABLE** (Habilitar)
7. Espera a que se complete la habilitación (aparecerá la página de la API con estado "Enabled")

> **Verificación:** En **APIs & Services** > **Enabled APIs**, debe aparecer "Google Calendar API" en la lista.

### 5.2: Verificar la Service Account

Tu proyecto ya tiene una Service Account creada para Dialogflow (archivo `service-account.json` en la raíz del proyecto). Esta misma cuenta se usa para Google Calendar.

1. Abre el archivo `service-account.json` en la raíz del proyecto
2. Busca el campo `"client_email"` — tendrá un formato como:
   ```
   "client_email": "tu-cuenta@bricebot-486701.iam.gserviceaccount.com"
   ```
3. **Copia ese email completo**, lo necesitarás en el siguiente paso

> **Importante:** Si el archivo `service-account.json` no tiene un `client_email`, o si el archivo no existe, debes crear una Service Account:
>
> 1. Ve a **IAM & Admin** > **Service Accounts** en Google Cloud Console
> 2. Haz clic en **CREATE SERVICE ACCOUNT**
> 3. Nombre: `bricebot-calendar` (o similar)
> 4. Haz clic en **CREATE AND CONTINUE**
> 5. En "Grant this service account access to project", no es necesario agregar roles adicionales para Calendar, haz clic en **CONTINUE**
> 6. Haz clic en **DONE**
> 7. En la lista de Service Accounts, haz clic en la cuenta recién creada
> 8. Ve a la pestaña **KEYS** > **ADD KEY** > **Create new key** > **JSON** > **CREATE**
> 9. Se descargará un archivo JSON — renómbralo a `service-account.json` y colócalo en la raíz del proyecto (`bricebot/service-account.json`)

### 5.3: Compartir el calendario con la Service Account

Hay dos opciones. La **Opción A** es la más sencilla para desarrollo y pruebas.

#### Opción A: Compartir tu calendario personal (recomendado para desarrollo)

1. Abre [Google Calendar](https://calendar.google.com/) en el navegador con la cuenta de Google del dueño del negocio (o tu cuenta personal de desarrollo)
2. En el panel izquierdo, busca el calendario que quieres usar (por defecto es tu calendario principal)
3. Haz clic en los **tres puntos (⋮)** junto al nombre del calendario
4. Selecciona **Settings and sharing** (Configuración y uso compartido)
5. Baja hasta la sección **Share with specific people or groups** (Compartir con determinadas personas o grupos)
6. Haz clic en **+ Add people and groups** (Añadir personas y grupos)
7. En el campo de email, pega el `client_email` de la Service Account (el que copiaste en el paso 5.2)
8. En permisos, selecciona **Make changes to events** (Hacer cambios en los eventos)
9. Haz clic en **Send** (Enviar)

> **Nota:** Es posible que Google muestre una advertencia indicando que no se puede enviar la invitación por correo a la Service Account. Esto es normal, el acceso se otorga de todas formas.

10. **Actualiza `GOOGLE_CALENDAR_ID` en tu archivo `.env`:**

    > **IMPORTANTE:** NO uses `primary`. Cuando se autentica con una Service Account, `primary` se refiere al calendario interno de la Service Account (invisible desde Google Calendar). Debes usar el ID real del calendario compartido.
    - **Si compartiste tu calendario personal**, el Calendar ID es tu dirección de email:
      ```
      GOOGLE_CALENDAR_ID=tu-email@gmail.com
      ```
    - **Si compartiste un calendario secundario/personalizado**, obtén el ID así:
      - En la configuración del calendario, baja hasta **Integrate calendar** (Integrar el calendario)
      - Copia el **Calendar ID** (tendrá un formato como `abc123@group.calendar.google.com`)
      - Actualiza tu `.env`:
        ```
        GOOGLE_CALENDAR_ID=abc123@group.calendar.google.com
        ```

#### Opción B: Crear un calendario dedicado desde la API (alternativa)

Si la Opción A no funciona (por restricciones de dominio), puedes crear un calendario propiedad de la Service Account usando un script:

1. Crea el archivo `scripts/setup-calendar.js` (temporal, solo se ejecuta una vez):

```javascript
const { google } = require('googleapis');
require('dotenv').config();

async function setupCalendar() {
	const auth = new google.auth.GoogleAuth({
		keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
		scopes: ['https://www.googleapis.com/auth/calendar'],
	});

	const authClient = await auth.getClient();
	const calendar = google.calendar({ version: 'v3', auth: authClient });

	// Create a dedicated calendar
	const newCalendar = await calendar.calendars.insert({
		requestBody: {
			summary: 'CBRICENHO - Citas de Servicio Técnico',
			description: 'Calendario de citas generadas por el chatbot de CBRICENHO',
			timeZone: 'America/Lima',
		},
	});

	const calendarId = newCalendar.data.id;
	console.log('Calendar created successfully!');
	console.log('Calendar ID:', calendarId);
	console.log('');
	console.log('Update your .env file:');
	console.log(`GOOGLE_CALENDAR_ID=${calendarId}`);

	// Share calendar with the business owner
	const ownerEmail = process.argv[2];
	if (ownerEmail) {
		await calendar.acl.insert({
			calendarId: calendarId,
			requestBody: {
				role: 'owner',
				scope: { type: 'user', value: ownerEmail },
			},
		});
		console.log(`Calendar shared with: ${ownerEmail}`);
	} else {
		console.log('');
		console.log('To share this calendar with the business owner, run:');
		console.log('node scripts/setup-calendar.js owner@email.com');
	}
}

setupCalendar().catch(console.error);
```

2. Ejecuta el script:
   ```bash
   node scripts/setup-calendar.js brice180@gmail.com
   ```
3. Copia el Calendar ID que se muestra en consola
4. Actualiza tu `.env`:
   ```
   GOOGLE_CALENDAR_ID=<el-id-que-te-dio-el-script>
   ```

### 5.4: Verificar la configuración

1. Asegúrate de que tu archivo `.env` tenga estos valores correctamente configurados:

   ```
   # Google Calendar
   GOOGLE_CALENDAR_ID=primary
   GOOGLE_CALENDAR_TIMEZONE=America/Lima
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
   ```

2. Reinicia el servidor:

   ```bash
   npm run dev
   ```

3. Verifica en los logs que no haya errores de inicialización:

   ```
   [CalendarService] Google Calendar API initialized
   ```

4. Prueba el flujo completo en el simulador de Dialogflow hasta confirmar una cita. Verifica:
   - En logs del servidor: `[CalendarService] Event created: <eventId>`
   - En Google Calendar: debe aparecer el evento con el título "Cita - [Nombre] ([Equipo])"

### 5.5: Troubleshooting de Google Calendar

| Error                                                                         | Causa                                                                                             | Solución                                                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Error: Could not load the default credentials`                               | El archivo `service-account.json` no se encuentra                                                 | Verifica que `GOOGLE_APPLICATION_CREDENTIALS` apunte al archivo correcto y que el archivo exista                              |
| `Error: The caller does not have permission`                                  | La Service Account no tiene acceso al calendario                                                  | Repite el paso 5.3 (compartir el calendario con la Service Account)                                                           |
| `Error: Google Calendar API has not been enabled`                             | La API no está habilitada                                                                         | Repite el paso 5.1 (habilitar la API en Google Cloud Console)                                                                 |
| `Error: Not Found` con `GOOGLE_CALENDAR_ID`                                   | El Calendar ID es incorrecto                                                                      | Verifica que el ID del calendario sea correcto en `.env`                                                                      |
| `Error: Request had insufficient authentication scopes`                       | El scope es incorrecto                                                                            | Verifica que el código use el scope `https://www.googleapis.com/auth/calendar` (ya está configurado en `calendar.service.js`) |
| El evento se crea exitosamente en los logs pero no aparece en Google Calendar | `GOOGLE_CALENDAR_ID=primary` con Service Account crea eventos en el calendario invisible de la SA | Cambia `GOOGLE_CALENDAR_ID` de `primary` a tu email (`tu-email@gmail.com`) o al ID del calendario compartido                  |
| El evento se crea pero no aparece en Google Calendar (usando Opción B)        | El calendario no está compartido bidireccionalmente                                               | Verifica que compartiste el calendario con tu cuenta personal                                                                 |

---

## Troubleshooting

### El bot no responde en el flujo de citas

1. Verifica que el webhook esté habilitado en cada intent
2. Verifica que el servidor esté corriendo
3. Verifica que la URL de ngrok esté actualizada en Dialogflow
4. Revisa los logs del servidor para ver errores

### "Context no encontrado" en los logs

- Verifica que los nombres de contexto coincidan exactamente (distingue mayúsculas/minúsculas)
- Verifica el lifespan (debe ser > 0)
- El contexto de salida del intent anterior debe coincidir con el de entrada del siguiente

### El bot responde un intent incorrecto

- Verifica que las training phrases no se solapen entre intents
- Los intents con input context solo se activan cuando ese contexto está presente
- Si un intent se activa fuera de orden, verifica que el contexto correcto esté vigente

### Google Calendar API error

Si los errores ocurren en los pasos de fecha, hora o confirmación de cita, revisa la [sección de Troubleshooting de Google Calendar en el Paso 5](#55-troubleshooting-de-google-calendar) para una tabla completa de errores y soluciones.

---

## Archivos de código relacionados

| Archivo                                            | Propósito                                                 |
| -------------------------------------------------- | --------------------------------------------------------- |
| `fulfillment/src/handlers/appointments.handler.js` | 20 handlers para todos los intents de citas               |
| `fulfillment/src/index.js` (líneas 74-94)          | Mapeo de intents a handlers                               |
| `fulfillment/src/utils/validators.js`              | Validación de teléfono, fecha, hora, dirección, cobertura |
| `fulfillment/src/utils/formatters.js`              | Formato de resúmenes, slots, confirmaciones               |
| `fulfillment/src/utils/dateHelpers.js`             | Parsing de fechas y horas de Dialogflow                   |
| `fulfillment/src/services/calendar.service.js`     | Integración con Google Calendar API                       |
| `fulfillment/src/services/availability.service.js` | Consulta de fechas y horarios disponibles                 |
| `fulfillment/src/services/whatsapp.service.js`     | Envío de confirmaciones (simulado)                        |
| `fulfillment/src/config/constants.js`              | Mensajes, horarios de negocio, configuración              |

---

## Paso 6: Configurar Contextos de Paso (Step Contexts) - Flujo Domicilio

El flujo de citas a domicilio requiere **contextos de paso** para que Dialogflow sepa exactamente qué dato espera en cada momento. Sin estos contextos, intents como `cita_domicilio_problema` (que usa `@sys.any`) pueden capturar texto que en realidad es una dirección, porque ambos comparten el mismo contexto general `cita_domicilio_en_curso`.

### ¿Qué son los contextos de paso?

Son contextos efímeros (lifespan 2) que el código del webhook establece al finalizar cada paso. Cada intent se configura para requerir **dos** input contexts:

- `cita_domicilio_en_curso` (el contexto general que ya tienen)
- `cita_domicilio_paso_*` (el contexto de paso específico)

Esto garantiza que solo el intent correcto pueda activarse en cada momento del flujo.

### 6.1: Agregar Input Contexts en Dialogflow Console

Para cada intent de la tabla, **agregar el contexto de paso como input context adicional**:

| Intent                         | Input Context a agregar         |
| ------------------------------ | ------------------------------- |
| `cita_domicilio_equipo`        | `cita_domicilio_paso_equipo`    |
| `cita_domicilio_problema`      | `cita_domicilio_paso_problema`  |
| `cita_domicilio_nombre`        | `cita_domicilio_paso_nombre`    |
| `cita_domicilio_telefono`      | `cita_domicilio_paso_telefono`  |
| `cita_domicilio_direccion`     | `cita_domicilio_paso_direccion` |
| `cita_domicilio_fecha`         | `cita_domicilio_paso_fecha`     |
| `cita_domicilio_rango_horario` | `cita_domicilio_paso_horario`   |

**Pasos para cada intent:**

1. Abre [Dialogflow Console](https://dialogflow.cloud.google.com/)
2. En el panel izquierdo, haz clic en **Intents**
3. Abre el intent (ej: `cita_domicilio_equipo`)
4. En la sección **Contexts** (parte superior del intent):
   - En **Input contexts**, haz clic en **Add input context**
   - Escribe el nombre del contexto de paso correspondiente (ej: `cita_domicilio_paso_equipo`)
   - **NO elimines** `cita_domicilio_en_curso` como input context — ambos deben estar presentes
5. Haz clic en **SAVE** para guardar el intent
6. Repite para cada intent de la tabla

> **Importante:** Los intents `cita_domicilio_confirmar_si` y `cita_domicilio_confirmar_no` NO necesitan cambios porque ya usan `cita_domicilio_confirmar` como input context exclusivo.

### 6.2: Verificar la configuración

Después de configurar todos los intents, verifica que cada uno tenga **dos** input contexts:

```
cita_domicilio_equipo:
  Input contexts: cita_domicilio_en_curso, cita_domicilio_paso_equipo

cita_domicilio_problema:
  Input contexts: cita_domicilio_en_curso, cita_domicilio_paso_problema

cita_domicilio_nombre:
  Input contexts: cita_domicilio_en_curso, cita_domicilio_paso_nombre

cita_domicilio_telefono:
  Input contexts: cita_domicilio_en_curso, cita_domicilio_paso_telefono

cita_domicilio_direccion:
  Input contexts: cita_domicilio_en_curso, cita_domicilio_paso_direccion

cita_domicilio_fecha:
  Input contexts: cita_domicilio_en_curso, cita_domicilio_paso_fecha

cita_domicilio_rango_horario:
  Input contexts: cita_domicilio_en_curso, cita_domicilio_paso_horario
```

### 6.3: Probar el flujo completo

Prueba el flujo de cita a domicilio completo en el simulador de Dialogflow:

1. Inicia con "Quiero agendar una cita"
2. Selecciona "A domicilio"
3. Selecciona tipo de equipo (ej: "Laptop")
4. Describe el problema (ej: "No enciende")
5. Da tu nombre
6. Da tu teléfono
7. **Paso clave:** Da una dirección como "AAHH Marco Jara Mz D Lote 24, a una cuadra de la panadería Alondra"
8. Verifica que el intent activado sea `cita_domicilio_direccion` (NO `cita_domicilio_problema`)
9. Continúa con fecha y horario hasta confirmar

Si el paso 8 activa el intent correcto, los contextos de paso están funcionando correctamente.

---

## Próximos Pasos

Una vez completada esta configuración:

1. ✅ Probar flujo de cita en local completo
2. ✅ Probar flujo de cita a domicilio completo
3. ✅ Verificar que las citas se crean en Google Calendar
4. ✅ Verificar que se guardan en MongoDB
5. ✅ Recopilar métricas de tiempo de creación de cita
6. Preparar para Iteración 3 (Cotizaciones)

---

**Fecha de creación:** Febrero 8, 2026  
**Última actualización:** Febrero 15, 2026  
**Iteración:** 2 - Gestión de Citas  
**Estado:** Listo para configurar

# Planificación Iteración 2 - Gestión de Citas

## Objetivo

Implementar el módulo de agendamiento de citas de servicio técnico, permitiendo a los clientes:

- Agendar citas para llevar equipos al local
- Solicitar servicio a domicilio
- Recibir confirmaciones automáticas

## Historias de Usuario (XP)

### HU-2.1: Programar cita en local

**Como** cliente que necesita servicio técnico,  
**Quiero** poder agendar una cita para llevar mi equipo al local de CBRICENHO,  
**Para** recibir atención en una fecha y hora conveniente.

**Criterios de Aceptación:**

- [x] El bot solicita: tipo de equipo, descripción del problema, nombre, teléfono, fecha y hora
- [x] Solo se permiten fechas dentro de los próximos 7 días calendario
- [x] Solo se muestran horarios dentro del horario de atención del local
- [x] El bot muestra un resumen de la cita antes de confirmar
- [x] Al confirmar, se crea un evento en Google Calendar
- [x] Se envía mensaje de confirmación al WhatsApp del cliente (simulado)
- [x] Si no hay disponibilidad, el bot ofrece horarios alternativos

**Estimación:** 8 puntos

---

### HU-2.2: Programar cita a domicilio

**Como** cliente que no puede trasladarse al local,  
**Quiero** poder agendar una cita para que un técnico recoja mi equipo en mi domicilio,  
**Para** recibir servicio sin salir de casa.

**Criterios de Aceptación:**

- [x] El bot solicita además: dirección completa y referencia de ubicación
- [x] Se ofrece rango horario (mañana/tarde) en lugar de hora exacta
- [x] Si la dirección está fuera de cobertura, se informa y ofrece alternativa
- [x] Se registra la cita en MongoDB con todos los datos
- [x] Se crea evento en Google Calendar

**Estimación:** 8 puntos

---

## Arquitectura Técnica

### Nuevos Componentes a Implementar

#### 1. Handlers

- `fulfillment/src/handlers/appointments.handler.js`

#### 2. Services

- `fulfillment/src/services/calendar.service.js` - Integración con Google Calendar API
- `fulfillment/src/services/availability.service.js` - Gestión de disponibilidad de horarios
- `fulfillment/src/services/whatsapp.service.js` - Envío de confirmaciones (placeholder)

#### 3. Utils

- `fulfillment/src/utils/validators.js` - Validación de fechas, teléfonos, direcciones
- `fulfillment/src/utils/dateHelpers.js` - Manipulación de fechas y horarios
- `fulfillment/src/utils/formatters.js` - Formateo de mensajes

#### 4. Nuevas Entidades en Dialogflow

- `@rango_horario` (mañana, tarde)
- Ya existen: `@tipo_equipo`, `@tipo_servicio`

#### 5. Nuevos Intents en Dialogflow

**Flujo de cita en local:**

1. `cita_iniciar` - Usuario solicita cita
2. `cita_seleccion_tipo` - Elegir local o domicilio
3. `cita_local_iniciar` - Iniciar flujo de local
4. `cita_local_equipo` - Tipo de equipo
5. `cita_local_problema` - Descripción del problema
6. `cita_local_nombre` - Nombre del cliente
7. `cita_local_telefono` - Teléfono del cliente
8. `cita_local_fecha` - Fecha preferida
9. `cita_local_hora` - Hora preferida
10. `cita_local_confirmar_si` - Confirmar cita
11. `cita_local_confirmar_no` - Cancelar/modificar

**Flujo de cita a domicilio:**

- Similar al local, pero incluye:
  - `cita_domicilio_direccion`
  - `cita_domicilio_referencia`
  - `cita_domicilio_rango_horario`

---

## Configuración Necesaria

### Google Calendar API

1. Habilitar Google Calendar API en Google Cloud Console
2. Agregar el alcance (scope) necesario a la Service Account:
   - `https://www.googleapis.com/auth/calendar`
3. Compartir el calendario con la Service Account email
4. Obtener el Calendar ID (generalmente es el email del calendario)

### Variables de Entorno Adicionales

```env
# Google Calendar
GOOGLE_CALENDAR_ID=primary  # o el ID específico del calendario
GOOGLE_CALENDAR_TIMEZONE=America/Lima

# Business Rules
MAX_SIMULTANEOUS_APPOINTMENTS=3
APPOINTMENT_SLOT_DURATION_MINUTES=60
COVERAGE_AREA_PAITA=true

# WhatsApp Business API (para Iteración 2+)
# WHATSAPP_API_URL=
# WHATSAPP_API_TOKEN=
```

---

## Flujo de Conversación

### Ejemplo: Cita en Local

```
Usuario: Quiero agendar una cita
Bot: ¡Por supuesto! ¿Cómo prefiere recibir el servicio?
     1️⃣ Visitar nuestro local
     2️⃣ Servicio a domicilio

Usuario: En el local
Bot: Perfecto. ¿Qué tipo de equipo necesita servicio?

Usuario: Mi laptop
Bot: Entendido. ¿Cuál es el problema o servicio que necesita?

Usuario: No enciende
Bot: Entendido: "No enciende"
     ¿Cuál es su nombre completo?

Usuario: Juan Pérez
Bot: Gracias, Juan Pérez. ¿Cuál es su número de teléfono?

Usuario: 975123456
Bot: Perfecto. ¿Qué fecha prefiere?
     Fechas disponibles:
     • Mañana (04/02/2026)
     • Miércoles (05/02/2026)
     • Jueves (06/02/2026)

Usuario: Mañana
Bot: ¿A qué hora le conviene?
     Horarios disponibles para mañana:
     • 10:00 AM
     • 11:00 AM
     • 2:00 PM
     • 4:00 PM

Usuario: 10 de la mañana
Bot: Perfecto. Por favor confirme su cita:

     📋 Resumen de Cita
     📱 Cliente: Juan Pérez (975123456)
     💻 Equipo: Laptop
     🔧 Problema: No enciende
     📅 Fecha: Mañana 04/02/2026
     🕐 Hora: 10:00 AM
     📍 Local: AA.HH. Marco Jara...

     ¿Confirma la cita? (Sí/No)

Usuario: Sí
Bot: ✅ ¡Listo! Su cita ha sido agendada exitosamente.

     📋 Código de cita: CITA-20260204-001

     Recibirá una confirmación por WhatsApp.
     Nos vemos mañana a las 10:00 AM.

     ¿Hay algo más en lo que pueda ayudarle?
```

---

## Tareas Técnicas Detalladas

### Fase 1: Configuración de Google Calendar (4 horas)

1. Habilitar Google Calendar API
2. Crear `calendar.service.js` con métodos:
   - `createEvent()`
   - `checkAvailability()`
   - `listAvailableSlots()`
   - `updateEvent()`
   - `deleteEvent()`
3. Probar integración con tests

### Fase 2: Lógica de Disponibilidad (3 horas)

1. Crear `availability.service.js`
2. Implementar:
   - Validación de días laborables
   - Validación de horarios de atención
   - Verificación de slots disponibles
   - Límite de citas simultáneas
3. Unit tests

### Fase 3: Handlers de Citas (6 horas)

1. Crear `appointments.handler.js`
2. Implementar cada handler del flujo
3. Manejar contextos de Dialogflow
4. Validaciones en cada paso

### Fase 4: Utilidades (2 horas)

1. Crear `validators.js`
   - Validar teléfonos
   - Validar fechas
   - Validar direcciones (para domicilio)
2. Crear `dateHelpers.js`
   - Parsear fechas en español
   - Formatear fechas
   - Calcular slots disponibles
3. Crear `formatters.js`
   - Formatear mensajes de resumen
   - Formatear listas de opciones

### Fase 5: Intents en Dialogflow (4 horas)

1. Crear todas las entidades necesarias
2. Crear todos los intents con training phrases
3. Configurar contextos correctamente
4. Habilitar webhook en todos

### Fase 6: Testing (3 horas)

1. Unit tests de services
2. Integration tests con Google Calendar
3. Tests de flujos completos
4. Recopilación de métricas

**Total estimado: ~22 horas de desarrollo**

---

## Criterios de Éxito

### Funcionales

- [x] Usuario puede agendar cita en local end-to-end
- [x] Usuario puede agendar cita a domicilio end-to-end
- [x] Eventos se crean en Google Calendar correctamente
- [x] Solo se muestran horarios disponibles
- [x] Validaciones funcionan correctamente

### No Funcionales

- [x] Tiempo de respuesta < 1 segundo
- [x] Manejo de errores robusto
- [x] Logs detallados para debugging
- [x] Métricas recopiladas (tiempo de creación de cita)

### Métricas para la Tesis

- Tiempo promedio de creación de cita
- Tasa de éxito de agendamiento
- Horarios más solicitados
- Tipos de equipo más comunes

---

## Riesgos y Mitigación

| Riesgo                          | Impacto | Mitigación                                                |
| ------------------------------- | ------- | --------------------------------------------------------- |
| Google Calendar API falla       | Alto    | Implementar fallback: guardar en BD y sincronizar después |
| Validación de fechas compleja   | Medio   | Usar librería date-fns o moment-timezone                  |
| Flujo conversacional muy largo  | Medio   | Permitir cancelar en cualquier momento                    |
| Cobertura de domicilio limitada | Bajo    | Validar y ofrecer alternativa (local)                     |

---

## Dependencias

- Google Calendar API habilitada
- Modelo `Appointment` ya implementado ✅
- Modelo `Conversation` para métricas ✅
- Handler de FAQ funcionando ✅

---

## Próximos Pasos

1. Revisar y aprobar esta planificación
2. Configurar Google Calendar API
3. Comenzar desarrollo en orden de tareas
4. Realizar testing continuo
5. Recopilar métricas durante desarrollo

---

**Iteración estimada:** 2-3 semanas con dedicación parcial

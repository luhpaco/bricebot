# Estado del Proyecto CBRICENHO Chatbot

**Última actualización:** Febrero 24, 2026  
**Versión:** 1.0.0  
**Estado:** 3 iteraciones completadas

---

## Resumen Ejecutivo

Las 3 iteraciones han sido completadas exitosamente. El chatbot cuenta con **44 intents** funcionando: responde consultas frecuentes (FAQ), agenda citas en local y a domicilio con integración a Google Calendar, genera cotizaciones de productos y servicios consultando la base de datos, y deriva al usuario a un asesor humano con registro de métricas de escalamiento.

---

## Iteraciones - Metodología XP

### ✅ Iteración 1: FAQ (Consultas Frecuentes)

**Estado:** 🟢 Completada  
**Duración estimada:** 2 semanas  
**Duración real:** 2 semanas

**Historias de Usuario Implementadas:**

| HU ID  | Título                            | Estado | Puntos |
| ------ | --------------------------------- | ------ | ------ |
| HU-1.1 | Consultar horarios de atención    | ✅     | 2      |
| HU-1.2 | Consultar ubicación               | ✅     | 2      |
| HU-1.3 | Consultar información de contacto | ✅     | 2      |
| HU-1.4 | Consultar redes sociales          | ✅     | 1      |

**Puntos completados:** 7/7

**Componentes Implementados:**

- ✅ Estructura del proyecto
- ✅ Configuración de MongoDB
- ✅ Webhook de Dialogflow con Express
- ✅ Handlers de FAQ
- ✅ Modelos de base de datos
- ✅ Sistema de métricas para tesis
- ✅ Documentación completa

---

### ✅ Iteración 2: Gestión de Citas

**Estado:** 🟢 Completada  
**Inicio:** Febrero 8, 2026  
**Duración estimada:** 3 semanas  
**Duración real:** ~1 semana

**Historias de Usuario Implementadas:**

| HU ID  | Título                     | Estado | Puntos |
| ------ | -------------------------- | ------ | ------ |
| HU-2.1 | Programar cita en local    | ✅     | 8      |
| HU-2.2 | Programar cita a domicilio | ✅     | 8      |

**Puntos completados:** 16/16

**Componentes Implementados:**

- ✅ Integración con Google Calendar API
- ✅ Handlers de gestión de citas (local y domicilio)
- ✅ Servicio de disponibilidad de horarios
- ✅ Validadores de fechas, teléfonos y direcciones
- ✅ Validación de cobertura geográfica (Paita)
- ✅ 20 intents en Dialogflow
- ✅ Servicio de WhatsApp (simulado)
- ✅ Formateo de mensajes y fechas en español

---

### ✅ Iteración 3: Cotizaciones

**Estado:** 🟢 Completada  
**Inicio:** Febrero 16, 2026  
**Duración estimada:** 3 semanas  
**Duración real:** ~1 semana

**Historias de Usuario Implementadas:**

| HU ID  | Título                            | Estado | Puntos |
| ------ | --------------------------------- | ------ | ------ |
| HU-3.1 | Cotizar computadora de escritorio | ✅     | 5      |
| HU-3.2 | Cotizar repuestos de laptop       | ✅     | 5      |

**Puntos completados:** 10/10

**Componentes Implementados:**

- ✅ Catálogo de productos en BD (seed data - 10 computadoras, 13 repuestos, 9 servicios)
- ✅ Modelo de servicios técnicos (Service.js)
- ✅ Servicio de cotizaciones (quotes.service.js)
- ✅ Handlers de cotizaciones (quotes.handler.js - 15 intents)
- ✅ Cálculo de IGV y totales (configurable via IGV_PERCENTAGE)
- ✅ Envío simulado de cotización por WhatsApp
- ✅ 15 intents de cotización en Dialogflow

---

## Stack Tecnológico Implementado

### Backend

- ✅ Node.js v18+
- ✅ Express 4.18
- ✅ dialogflow-fulfillment 0.6.1

### Base de Datos

- ✅ MongoDB (local)
- ✅ Mongoose 8.0

### NLP

- ✅ Google Dialogflow ES

### APIs Externas

- ✅ Google Calendar API
- ⏸️ WhatsApp Business API (simulado)

### Herramientas de Desarrollo

- ✅ ngrok (exposición local)
- ✅ nodemon (desarrollo)
- ⚠️ Jest (configurado, tests unitarios pendientes)
- ⚠️ ESLint (instalado, sin archivo `.eslintrc`)

---

## Arquitectura Actual

```
Usuario (WhatsApp)
    ↓
Dialogflow ES (NLU)
    ↓
Webhook (Express)
    ↓
┌─────────────────────────────────┐
│          Handlers               │
│  FAQ ✅ | Citas ✅ | Cotiz ✅  │
└─────────────────────────────────┘
    ↓                ↓
MongoDB          Google Calendar
(Métricas,       (Eventos de
 Citas,           citas)
 Productos,
 Cotizaciones)
```

---

## Métricas Recopiladas

### Para la Tesis

El sistema actualmente registra:

1. **Conversaciones:**

   - Sesión ID
   - Mensajes (usuario y bot)
   - Intents detectados
   - Confianza del intent
   - Duración total de conversación
   - Número de mensajes

2. **Tiempo de Respuesta:**

   - Por cada intent procesado
   - Tiempo total de procesamiento del webhook

3. **Resolución:**
   - Conversaciones resueltas vs no resueltas
   - Escalaciones a humano (fallback)

4. **Citas (Iteración 2):**
   - Tiempo de creación de cita (creationDurationMs)
   - Tasa de éxito de agendamiento
   - Tipos de equipo más comunes

### Métricas Objetivo (Post-Test)

- ✅ Tiempo promedio de respuesta por consulta
- ✅ Tiempo promedio de creación de cita
- ✅ Tiempo promedio de generación de cotización (Iteración 3)
- ✅ Índice de satisfacción del cliente (escala Likert 1-5)

---

## Archivos y Estructura

### Implementados ✅

```
bricebot/
├── package.json                        ✅
├── .env                                ✅
├── .gitignore                          ✅
├── README.md                           ✅
├── fulfillment/
│   └── src/
│       ├── index.js                    ✅ Webhook principal
│       ├── handlers/
│       │   ├── faq.handler.js          ✅ Iteración 1
│       │   ├── appointments.handler.js ✅ Iteración 2
│       │   └── quotes.handler.js       ✅ Iteración 3
│       ├── services/
│       │   ├── metrics.service.js      ✅
│       │   ├── calendar.service.js     ✅ Iteración 2
│       │   ├── availability.service.js ✅ Iteración 2
│       │   ├── whatsapp.service.js     ✅ Iteración 2
│       │   └── quotes.service.js       ✅ Iteración 3
│       ├── models/
│       │   ├── Conversation.js         ✅
│       │   ├── Appointment.js          ✅
│       │   ├── Quote.js                ✅
│       │   ├── Product.js              ✅
│       │   └── Service.js              ✅ Iteración 3
│       ├── utils/
│       │   ├── validators.js           ✅
│       │   ├── formatters.js           ✅
│       │   └── dateHelpers.js          ✅
│       ├── config/
│       │   ├── constants.js            ✅
│       │   ├── database.js             ✅
│       │   └── dialogflow.js           ✅
│       └── scripts/
│           └── seed-products.js        ✅ Iteración 3
├── docs/
│   ├── SETUP_CREDENTIALS.md            ✅
│   ├── SETUP_NGROK_DIALOGFLOW.md       ✅
│   ├── DIALOGFLOW_INTENTS_SETUP.md     ✅
│   ├── DIALOGFLOW_ITERATION_2_SETUP.md ✅
│   ├── DIALOGFLOW_ITERATION_3_SETUP.md ✅ Iteración 3
│   ├── TESTING_GUIDE.md                ✅
│   ├── QUICK_START.md                  ✅
│   ├── ITERATION_2_PLANNING.md         ✅
│   ├── ITERATION_3_PLANNING.md         ✅ Iteración 3
│   └── PROJECT_STATUS.md              ✅ (este archivo)
└── .cursor/
    └── rules/                          ✅ (reglas del proyecto)
```

---

## Intents Implementados en Dialogflow

### ✅ Implementados (Iteración 1) - 8 intents

1. `saludo` - Mensaje de bienvenida
2. `despedida` - Mensaje de despedida
3. `ayuda` - Opciones disponibles
4. `faq_horarios` - Horarios de atención
5. `faq_ubicacion` - Ubicación del local
6. `faq_contacto` - Información de contacto
7. `faq_redes_sociales` - Redes sociales
8. `Default Fallback Intent` - Manejo de no entendimiento

### ✅ Implementados (Iteración 2) - 20 intents

**Citas en Local (10 intents):**

1. `cita_iniciar` - Iniciar flujo de citas
2. `cita_local_iniciar` - Seleccionar servicio en local
3. `cita_local_equipo` - Tipo de equipo
4. `cita_local_problema` - Descripción del problema
5. `cita_local_nombre` - Nombre del cliente
6. `cita_local_telefono` - Teléfono del cliente
7. `cita_local_fecha` - Selección de fecha
8. `cita_local_hora` - Selección de hora
9. `cita_local_confirmar_si` - Confirmar cita
10. `cita_local_confirmar_no` - Modificar/cancelar

**Citas a Domicilio (10 intents):**

11. `cita_domicilio_iniciar` - Seleccionar servicio a domicilio
12. `cita_domicilio_equipo` - Tipo de equipo
13. `cita_domicilio_problema` - Descripción del problema
14. `cita_domicilio_nombre` - Nombre del cliente
15. `cita_domicilio_telefono` - Teléfono del cliente
16. `cita_domicilio_direccion` - Dirección y referencia
17. `cita_domicilio_fecha` - Selección de fecha
18. `cita_domicilio_rango_horario` - Rango (mañana/tarde)
19. `cita_domicilio_confirmar_si` - Confirmar cita
20. `cita_domicilio_confirmar_no` - Modificar/cancelar

### ✅ Implementados (Iteración 3) - 15 intents

1. `cotizar_iniciar` - Inicia flujo de cotización
2. `cotizar_producto_categoria` - Categoría de producto
3. `cotizar_servicio_tipo` - Tipo de servicio técnico
4. `cotizar_servicio_equipo` - Equipo para el servicio
5. `cotizar_servicio_seleccionar` - Selección de servicio
6. `cotizar_producto_generico` - Cotizar producto genérico
7. `cotizar_computadora` - Cotizar computadora
8. `cotizar_computadora_uso` - Uso principal de la computadora
9. `cotizar_computadora_seleccionar` - Selección de opción
10. `cotizar_repuesto_laptop` - Cotizar repuesto de laptop
11. `cotizar_repuesto_seleccionar` - Selección de repuesto
12. `cotizar_agregar_mas` - Agregar más items
13. `cotizar_datos_cliente` - Datos del cliente
14. `cotizar_confirmar_si` - Confirmar cotización
15. `cotizar_confirmar_no` - Modificar cotización

### ✅ Intent de Escalamiento

- `derivar_agente_humano` - Derivar a asesor humano con registro de métricas

**Total: 44 intents**

---

## Entidades Implementadas

### ✅ Creadas (Iteración 1)

- `@tipo_equipo` (PC, laptop, impresora, cámara, monitor, otro)
- `@tipo_servicio` (mantenimiento, reparación, instalación, etc.)

### ✅ Creadas (Iteración 2)

- `@rango_horario` (mañana, tarde)

### ✅ Creadas (Iteración 3)

- `@uso_computadora` (ofimática, diseño, programación, gaming, estudio)

---

## Acciones por Iteración

### Iteración 1 - Completada ✅

1. [x] Obtener `service-account.json` de Google Cloud
2. [x] Actualizar valores reales en `.env`
3. [x] Crear los 8 intents en Dialogflow Console
4. [x] Probar el flujo completo con el simulador
5. [x] Realizar pruebas de validación
6. [x] Recopilar métricas iniciales
7. [x] Documentar resultados para la tesis

### Iteración 2 - Completada ✅

1. [x] Revisar planificación de Iteración 2
2. [x] Configurar Google Calendar API
3. [x] Implementar servicios (calendar, availability, whatsapp)
4. [x] Crear utilidades (validators, dateHelpers, formatters)
5. [x] Implementar handlers de citas completos
6. [x] Crear 20 intents de citas en Dialogflow
7. [x] Testing end-to-end

### Iteración 3 - Completada ✅

1. [x] Crear modelo Service.js
2. [x] Crear script seed de productos y servicios
3. [x] Implementar quotes.service.js
4. [x] Actualizar formatters.js y validators.js
5. [x] Implementar quotes.handler.js (15 intents)
6. [x] Registrar intents en index.js
7. [x] Crear 15 intents de cotización en Dialogflow Console
8. [x] Crear entidad @uso_computadora
9. [x] Testing end-to-end
10. [x] Documentar resultados para la tesis

---

## Riesgos Actuales

| Riesgo                                  | Probabilidad | Impacto | Mitigación                                      |
| --------------------------------------- | ------------ | ------- | ----------------------------------------------- |
| MongoDB no disponible localmente        | Media        | Alto    | Migrar a MongoDB Atlas                          |
| ngrok URL cambia frecuentemente         | Alta         | Bajo    | Documentar proceso de actualización             |
| Dialogflow training insuficiente        | Media        | Medio   | Agregar más training phrases                    |
| Catálogo de productos desactualizado    | Media        | Medio   | Script de seed parametrizable                   |
| Consultas BD lentas con catálogo grande | Baja         | Medio   | Índices en Product y Service                    |

---

## Equipo y Roles

**Desarrollador:** Luis Humberto Paz Córdova  
**Asesora:** Dra. Carmen Lucila Infante Saavedra  
**Cliente In-Situ:** Cristian Briceño (CBRICENHO E.I.R.L)

---

## Enlaces Útiles

- [README Principal](../README.md)
- [Guía de Inicio Rápido](QUICK_START.md)
- [Guía de Testing](TESTING_GUIDE.md)
- [Planificación Iteración 2](ITERATION_2_PLANNING.md)
- [Planificación Iteración 3](ITERATION_3_PLANNING.md)
- [Dialogflow Console](https://dialogflow.cloud.google.com)
- [Google Cloud Console](https://console.cloud.google.com)

---

## Notas de Desarrollo

### Decisiones Técnicas Tomadas

1. **MongoDB Local vs Atlas:** Elegido local para desarrollo, migrar a Atlas para producción
2. **Dialogflow ES vs CX:** Elegido ES por simplicidad y cumple requisitos
3. **WhatsApp API:** Simulado para desarrollo, integración real posterior
4. **Google Calendar:** Integración directa con API v3 via service account
5. **Cotizaciones:** Consulta a BD de productos en lugar de precios hardcodeados

### Deuda Técnica

1. ⚠️ Implementar tests unitarios e integración
2. ⚠️ Configurar ESLint con reglas del proyecto
3. ⚠️ Agregar logs estructurados (Winston)
4. ⚠️ Implementar rate limiting

---

**Estado general del proyecto:** 🟢 3 iteraciones completadas

**Próximo hito:** Evaluación final con cliente (PRE-TEST vs POST-TEST)

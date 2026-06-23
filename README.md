# CBRICENHO Chatbot

Agente conversacional para la atención al cliente de CBRICENHO E.I.R.L, desarrollado con Dialogflow ES y Node.js como parte del proyecto de tesis.

## Descripción

Este chatbot automatiza el proceso de atención al cliente, permitiendo:

- Responder consultas frecuentes (FAQ) ✅
- Agendar citas de servicio técnico ✅
- Generar cotizaciones de productos y servicios, con paginación de opciones («ver más») ✅
- Derivar al usuario a un asesor humano ✅

## Tecnologías

- **NLP Platform**: Google Dialogflow ES
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **External APIs**: Google Calendar API
- **Channel**: Facebook Messenger

## Requisitos Previos

- Node.js >= 18.0.0
- MongoDB (instalado localmente o acceso a MongoDB Atlas)
- Cuenta de Google Cloud con Dialogflow ES configurado
- ngrok (para desarrollo local)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd bricebot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env` y completar los valores:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DIALOGFLOW_PROJECT_ID=tu-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
MONGODB_URI=mongodb://localhost:27017/cbricenho
# ... otros valores
```

### 4. Obtener credenciales de Google Cloud

Seguir las instrucciones detalladas en: [`docs/SETUP_CREDENTIALS.md`](docs/SETUP_CREDENTIALS.md)

1. Ir a Google Cloud Console
2. Crear una Service Account con rol "Dialogflow API Client"
3. Descargar el archivo JSON de credenciales
4. Renombrar a `service-account.json` y colocar en la raíz del proyecto

### 5. Iniciar MongoDB

Si usas MongoDB local:

```bash
mongod
```

Si usas MongoDB Atlas, asegúrate de tener la URL de conexión correcta en `.env`.

### 6. Iniciar el servidor

**Modo desarrollo (con auto-reload):**

```bash
npm run dev
```

**Modo producción:**

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## Desarrollo Local con ngrok

Para conectar Dialogflow con tu servidor local:

### 1. Instalar ngrok

Descargar desde: https://ngrok.com/download

### 2. Exponer el servidor local

```bash
ngrok http 3000
```

Esto generará una URL pública como: `https://abc123.ngrok.io`

### 3. Configurar en Dialogflow

1. Ir a [Dialogflow Console](https://dialogflow.cloud.google.com)
2. Seleccionar tu agente
3. Ir a **Fulfillment** en el menú lateral
4. Habilitar **Webhook**
5. Pegar la URL de ngrok + `/webhook`: `https://abc123.ngrok.io/webhook`
6. Guardar

## Estructura del Proyecto

```
bricebot/
├── fulfillment/
│   ├── src/
│   │   ├── index.js              # Entry point del webhook (intentMap + override)
│   │   ├── handlers/             # Manejadores de intents
│   │   │   ├── faq.handler.js    # FAQ + escalamiento (Iteración 1)
│   │   │   ├── appointments.handler.js # Citas (Iteración 2)
│   │   │   └── quotes.handler.js # Cotizaciones (Iteración 3)
│   │   ├── services/             # Lógica de negocio
│   │   │   ├── metrics.service.js
│   │   │   ├── calendar.service.js # Google Calendar API
│   │   │   ├── availability.service.js
│   │   │   └── quotes.service.js # Cotizaciones (Iteración 3)
│   │   ├── models/               # Modelos de MongoDB
│   │   │   ├── Conversation.js
│   │   │   ├── Appointment.js
│   │   │   ├── Quote.js
│   │   │   ├── Product.js
│   │   │   └── Service.js
│   │   ├── utils/                # Funciones auxiliares
│   │   │   ├── validators.js
│   │   │   ├── dateHelpers.js
│   │   │   └── formatters.js
│   │   ├── config/               # Configuración
│   │   │   ├── constants.js
│   │   │   ├── database.js
│   │   │   └── dialogflow.js
│   │   └── scripts/             # Scripts de carga de datos
│   │       └── seed-products.js  # Seed de productos y servicios
│   └── tests/                    # Tests unitarios (Jest)
├── dialogflow/                   # Intents (JSON) + entidades personalizadas
├── seed/                         # Datasets CSV (seed-products.csv, seed-services.csv)
├── docs/                         # Documentación
│   └── conversation-flows/       # Diagramas de flujos conversacionales
├── .github/
│   └── workflows/                # CI (GitHub Actions: lint, format, tests)
├── .eslintrc.json                # Configuración de ESLint
├── .prettierrc                   # Configuración de Prettier
└── .cursor/rules/                # Reglas del proyecto
```

## Endpoints

### Health Check

```bash
GET http://localhost:3000/health
```

Respuesta:

```json
{
	"status": "ok",
	"timestamp": "2026-02-03T...",
	"database": "connected"
}
```

### Webhook de Dialogflow

```bash
POST http://localhost:3000/webhook
```

Este endpoint recibe las peticiones de Dialogflow y procesa los intents.

## Intents Implementados

### Iteración 1 - FAQ (8 intents) + Transversales (2) ✅

**FAQ (8 intents en Dialogflow):**

- `saludo` - Mensaje de bienvenida
- `despedida` - Mensaje de despedida
- `ayuda` - Muestra opciones disponibles
- `faq_horarios` - Horarios de atención
- `faq_ubicacion` - Ubicación del local
- `faq_contacto` - Información de contacto
- `faq_redes_sociales` - Redes sociales de la empresa
- `Default Fallback Intent` - Cuando no se entiende el mensaje (escalación progresiva en 3 niveles)

### Iteración 2 - Gestión de Citas (20 intents) ✅

**Citas en Local:**
- `cita_iniciar` - Iniciar agendamiento
- `cita_local_iniciar` - Seleccionar servicio en local
- `cita_local_equipo` - Tipo de equipo
- `cita_local_problema` - Descripción del problema
- `cita_local_nombre` - Datos del cliente (nombre)
- `cita_local_telefono` - Datos del cliente (teléfono)
- `cita_local_fecha` - Selección de fecha
- `cita_local_hora` - Selección de hora
- `cita_local_confirmar_si` - Confirmar cita
- `cita_local_confirmar_no` - Modificar/cancelar

**Citas a Domicilio:**
- `cita_domicilio_iniciar` - Seleccionar servicio a domicilio
- `cita_domicilio_equipo` - Tipo de equipo
- `cita_domicilio_problema` - Descripción del problema
- `cita_domicilio_nombre` - Datos del cliente
- `cita_domicilio_telefono` - Teléfono
- `cita_domicilio_direccion` - Dirección y referencia
- `cita_domicilio_fecha` - Selección de fecha
- `cita_domicilio_rango_horario` - Rango (mañana/tarde)
- `cita_domicilio_confirmar_si` - Confirmar
- `cita_domicilio_confirmar_no` - Modificar/cancelar

### Iteración 3 - Cotizaciones (16 intents) ✅

- `cotizar_iniciar` - Iniciar flujo de cotización
- `cotizar_producto_categoria` - Categoría de producto
- `cotizar_servicio_tipo` - Tipo de servicio técnico
- `cotizar_servicio_equipo` - Equipo para el servicio
- `cotizar_servicio_seleccionar` - Selección de servicio
- `cotizar_producto_generico` - Cotizar producto genérico
- `cotizar_computadora` - Cotizar computadora
- `cotizar_computadora_uso` - Uso principal de la computadora
- `cotizar_computadora_seleccionar` - Selección de opción
- `cotizar_repuesto_laptop` - Cotizar repuesto de laptop
- `cotizar_repuesto_seleccionar` - Selección de repuesto
- `cotizar_ver_mas` - Mostrar más opciones (paginación de productos/servicios)
- `cotizar_agregar_mas` - Agregar más items
- `cotizar_datos_cliente` - Datos del cliente
- `cotizar_confirmar_si` - Confirmar cotización
- `cotizar_confirmar_no` - Modificar cotización

### Intents Transversales (manejados por faq.handler.js)

- `derivar_agente_humano` - Derivar al usuario a un asesor humano (con registro en métricas)
- `cancelar_proceso` - Cancelar flujo activo y volver al menú (activación dual: Dialogflow NLU + override del webhook)

**Total: 46 intents con webhook + `Default Welcome Intent` (nativo) = 47 en Dialogflow**

## Configurar Intents en Dialogflow

### 1. Crear Entidades Personalizadas

En Dialogflow Console > **Entities**:

- `@tipo_equipo`: PC, laptop, impresora, cámara, monitor, otro (Iteración 2)
- `@tipo_servicio`: mantenimiento, cambio_teclado, cambio_pantalla, etc. (Iteración 2)
- `@rango_horario`: mañana, tarde (Iteración 2)
- `@uso_computadora`: ofimática, diseño, programación, gaming, estudio (Iteración 3)
- `@categoria_producto`: computadora, repuesto_laptop, impresora, accesorio (Iteración 3)
- `@tipo_cotizacion`: producto, servicio (Iteración 3)

### 2. Crear Intents

**Para Iteración 1 (FAQ):**

Ver guía detallada en: [`docs/DIALOGFLOW_INTENTS_SETUP.md`](docs/DIALOGFLOW_INTENTS_SETUP.md)

**Para Iteración 2 (Citas):**

Ver guía detallada en: [`docs/DIALOGFLOW_ITERATION_2_SETUP.md`](docs/DIALOGFLOW_ITERATION_2_SETUP.md)

**Para Iteración 3 (Cotizaciones):**

Ver guía detallada en: [`docs/DIALOGFLOW_ITERATION_3_SETUP.md`](docs/DIALOGFLOW_ITERATION_3_SETUP.md)

Cada intent debe tener:
- Al menos 10 training phrases
- Webhook habilitado
- Contextos configurados correctamente
- Parámetros requeridos definidos

## Testing

### Automatizado (Jest)

El proyecto cuenta con una suite de pruebas unitarias en `fulfillment/tests/`, ejecutadas con **Jest** y aislando MongoDB mediante `mongodb-memory-server` (sin depender de una base real).

```bash
npm run test:unit   # Tests unitarios con reporte de cobertura
```

La configuración de Jest en `package.json` define **umbrales de cobertura** por archivo (handlers, services y utils), de modo que la suite falla si la cobertura cae por debajo de lo exigido. Ejecutar los tests antes de cada commit es parte del flujo del proyecto.

### Manual

Usar el simulador de Dialogflow Console:

1. Ir a **Test Agent** (panel derecho)
2. Escribir mensajes de prueba
3. Verificar las respuestas

### Logs

Los logs del servidor mostrarán:

- Sesiones e intents detectados
- Métricas registradas
- Errores y warnings

### Health Check

```bash
curl http://localhost:3000/health
```

## Integración Continua (CI)

El repositorio incluye un pipeline de **GitHub Actions** (`.github/workflows/ci.yml`) que se ejecuta en cada `push` y `pull_request` sobre Node.js 18. El flujo valida, en orden:

1. **Lint** — `npm run lint` (ESLint)
2. **Formato** — `npm run format:check` (Prettier)
3. **Tests** — suite Jest con cobertura

De esta forma ningún cambio se integra sin pasar las verificaciones de calidad de código y las pruebas.

## Base de Datos

### Colecciones de MongoDB

- `conversations` - Registro de conversaciones y métricas de tesis
- `appointments` - Citas agendadas (Iteración 2)
- `quotes` - Cotizaciones generadas (Iteración 3)
- `products` - Catálogo de productos
- `services` - Catálogo de servicios técnicos

### Métricas para la Tesis

El sistema registra automáticamente:

- Tiempo de respuesta por consulta
- Número de mensajes por conversación
- Tasa de resolución
- Satisfacción del cliente (cuando se implemente)

## Scripts Disponibles

```bash
npm start            # Inicia el servidor en modo producción
npm run dev          # Inicia con nodemon (auto-reload)
npm test             # Ejecuta toda la suite Jest con cobertura
npm run test:unit    # Ejecuta solo los tests unitarios (fulfillment/tests) con cobertura
npm run lint         # Verifica el código con ESLint
npm run format       # Formatea el código con Prettier (escribe cambios)
npm run format:check # Verifica el formato sin modificar archivos
node fulfillment/src/scripts/seed-products.js  # Carga catálogo inicial de productos y servicios
```

## Metodología XP

Este proyecto sigue la metodología Extreme Programming (XP) con 3 iteraciones:

| Iteración | Módulo                     | Estado        |
| --------- | -------------------------- | ------------- |
| 1         | FAQ (Consultas Frecuentes) | ✅ Completada |
| 2         | Gestión de Citas           | ✅ Completada |
| 3         | Cotizaciones               | ✅ Completada |

Ver historias de usuario en: [`.cursor/rules/user-histories-template.mdc`](.cursor/rules/user-histories-template.mdc)

## Solución de Problemas

### MongoDB no conecta

```bash
# Verificar que MongoDB esté corriendo
mongosh

# Si no está instalado, instalar MongoDB:
# Windows: https://www.mongodb.com/try/download/community
```

### Dialogflow no llama al webhook

1. Verificar que ngrok esté corriendo
2. Verificar que la URL en Dialogflow sea correcta
3. Revisar los logs del servidor
4. Verificar que el intent tenga "Enable webhook call" activado

### Error de credenciales

1. Verificar que `service-account.json` exista
2. Verificar que `DIALOGFLOW_PROJECT_ID` sea correcto
3. Verificar que la Service Account tenga permisos de Dialogflow

## Autor

**Luis Humberto Paz Córdova**  
Bach. Ingeniería Informática  
Universidad Nacional de Piura

**Asesora:** Dra. Carmen Lucila Infante Saavedra

## Licencia

MIT

---

**Empresa:** CBRICENHO E.I.R.L  
**RUC:** 20606300825  
**Ubicación:** Paita, Piura, Perú

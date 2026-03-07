# Guía de Inicio Rápido - CBRICENHO Chatbot

Esta guía te permite poner en marcha el chatbot en minutos.

## Requisitos Previos

- ✅ Node.js >= 18.0.0 instalado
- ✅ MongoDB instalado y corriendo
- ✅ Agente de Dialogflow ES creado
- ✅ ngrok descargado

## Pasos Rápidos

### 1. Obtener Credenciales de Google Cloud

Sigue las instrucciones en: [`SETUP_CREDENTIALS.md`](SETUP_CREDENTIALS.md)

1. Ve a Google Cloud Console
2. Crea una Service Account con rol "Dialogflow API Client"
3. Descarga el JSON de credenciales
4. Renombra a `service-account.json` y colócalo en la raíz del proyecto

### 2. Configurar Variables de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita `.env` y actualiza:

```env
DIALOGFLOW_PROJECT_ID=tu-project-id-real  # ⚠️ Reemplaza esto
COMPANY_PHONE=+51999999999               # Agrega tu teléfono
COMPANY_WHATSAPP=+51999999999            # WhatsApp de contacto de la empresa
COMPANY_EMAIL=contacto@cbricenho.com     # Agrega tu email
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Iniciar MongoDB

```bash
# Si usas MongoDB local:
mongod

# Si usas MongoDB Atlas, asegúrate de tener la URL correcta en .env
```

### 5. Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:

```
[Database] Connected to MongoDB
[Server] CBRICENHO Chatbot running on port 3000
```

### 6. Exponer con ngrok

En otra terminal:

```bash
ngrok http 3000
```

Copia la URL de Forwarding: `https://abc123.ngrok-free.app`

### 7. Configurar Dialogflow

1. Ve a [Dialogflow Console](https://dialogflow.cloud.google.com)
2. Selecciona tu agente
3. Ve a **Fulfillment**
4. Habilita **Webhook**
5. URL: `https://abc123.ngrok-free.app/webhook`
6. **SAVE**

### 8. Cargar Catálogo de Productos

Antes de usar el módulo de cotizaciones, ejecuta el seed de datos:

```bash
node fulfillment/src/scripts/seed-products.js
```

### 9. Crear Intents en Dialogflow

**Iteración 1 (FAQ):** [`DIALOGFLOW_INTENTS_SETUP.md`](DIALOGFLOW_INTENTS_SETUP.md)

Crea los intents básicos con webhook habilitado:
- `saludo`, `despedida`, `ayuda`
- `faq_horarios`, `faq_ubicacion`, `faq_contacto`, `faq_redes_sociales`
- `derivar_agente_humano`

**Iteración 2 (Citas):** [`DIALOGFLOW_ITERATION_2_SETUP.md`](DIALOGFLOW_ITERATION_2_SETUP.md)

20 intents de agendamiento (`cita_*`) con contextos multi-turn.

**Iteración 3 (Cotizaciones):** [`DIALOGFLOW_ITERATION_3_SETUP.md`](DIALOGFLOW_ITERATION_3_SETUP.md)

15 intents de cotización (`cotizar_*`) con consultas a MongoDB.

### 10. Probar

En Dialogflow Console > Test Agent:

```
Usuario: Hola
Bot: ¡Hola! 👋 Soy el asistente virtual de CBRICENHO...
```

## Verificación Rápida

```bash
# Health check
curl http://localhost:3000/health

# Respuesta esperada:
# {"status":"ok","timestamp":"...","database":"connected"}
```

## Solución Rápida de Problemas

| Problema                      | Solución                                                  |
| ----------------------------- | --------------------------------------------------------- |
| "MongoDB connection error"    | Inicia MongoDB: `mongod`                                  |
| "Webhook error" en Dialogflow | Verifica que ngrok y servidor estén corriendo             |
| Bot responde texto estático   | Habilita webhook en el intent                             |
| ngrok "command not found"     | Ejecuta con ruta completa: `C:\ngrok\ngrok.exe http 3000` |

## Documentación Completa

- 📖 [README completo](../README.md)
- 🔐 [Configurar credenciales](SETUP_CREDENTIALS.md)
- 🔧 [Configurar ngrok y Dialogflow](SETUP_NGROK_DIALOGFLOW.md)
- 💬 [Crear intents Iteración 1](DIALOGFLOW_INTENTS_SETUP.md)
- 📅 [Crear intents Iteración 2](DIALOGFLOW_ITERATION_2_SETUP.md)
- 💰 [Crear intents Iteración 3](DIALOGFLOW_ITERATION_3_SETUP.md)
- ✅ [Guía de testing](TESTING_GUIDE.md)

## Estado del Proyecto

Las 3 iteraciones están completadas:

1. ✅ Iteración 1 (FAQ) - 8 intents FAQ + 2 transversales (`derivar_agente_humano`, `cancelar_proceso`)
2. ✅ Iteración 2 (Gestión de Citas) - 20 intents con Google Calendar
3. ✅ Iteración 3 (Cotizaciones) - 15 intents con consulta a MongoDB

**Total: 45 intents con webhook + Default Welcome Intent (nativo) = 46 en Dialogflow**

---

¿Necesitas ayuda? Revisa los logs del servidor y verifica cada paso.

# Guía de Validación y Testing - Iteración 1 (FAQ)

Esta guía te ayudará a validar que toda la integración funcione correctamente de principio a fin.

## Pre-requisitos

Antes de comenzar las pruebas, asegúrate de tener:

- [ ] MongoDB instalado y corriendo
- [ ] Archivo `service-account.json` en la raíz del proyecto
- [ ] Archivo `.env` configurado con valores correctos
- [ ] Dependencias instaladas (`npm install`)
- [ ] Intents y entidades creados en Dialogflow Console
- [ ] Webhook configurado en Dialogflow

---

## Fase 1: Verificación de Infraestructura

### 1.1 Verificar MongoDB

```bash
mongosh
```

Si MongoDB está corriendo, deberías ver el prompt de MongoDB:

```
Current Mongosh Log ID:	...
Connecting to:		mongodb://127.0.0.1:27017
Using MongoDB:		7.0.x
test>
```

Escribe `exit` para salir.

**✅ MongoDB está funcionando**

---

### 1.2 Verificar Variables de Entorno

Abre el archivo `.env` y verifica:

```env
DIALOGFLOW_PROJECT_ID=tu-project-id-real  # NO debe ser "your-project-id-here"
MONGODB_URI=mongodb://localhost:27017/cbricenho
PORT=3000
```

**✅ Variables de entorno configuradas**

---

### 1.3 Verificar Credenciales de Google Cloud

Verifica que existe:

```
f:\folder-luispazcode\lupaco-grado-unp\tesis\bricebot\service-account.json
```

Abre el archivo y verifica que tenga esta estructura:

```json
{
  "type": "service_account",
  "project_id": "tu-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  ...
}
```

**✅ Credenciales presentes y válidas**

---

## Fase 2: Iniciar el Sistema

### 2.1 Iniciar el Servidor

Abre una terminal en la raíz del proyecto:

```bash
npm run dev
```

Deberías ver:

```
[Database] Connected to MongoDB: mongodb://localhost:27017/cbricenho
[Server] CBRICENHO Chatbot running on port 3000
[Server] Environment: development
[Server] Webhook URL: http://localhost:3000/webhook
[Server] Health check: http://localhost:3000/health
```

**✅ Servidor iniciado correctamente**

**IMPORTANTE:** Deja esta terminal abierta.

---

### 2.2 Verificar Health Check

Abre otra terminal o navegador:

```bash
curl http://localhost:3000/health
```

O visita en el navegador: http://localhost:3000/health

Respuesta esperada:

```json
{
	"status": "ok",
	"timestamp": "2026-02-03T...",
	"database": "connected"
}
```

**✅ Health check funciona**

---

### 2.3 Iniciar ngrok

En otra terminal (mantén la del servidor abierta):

```bash
ngrok http 3000
```

Deberías ver:

```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copia la URL de Forwarding** (la que empieza con `https://`)

**✅ ngrok exponiendo el servidor**

---

### 2.4 Verificar ngrok Externamente

Desde un navegador o curl:

```bash
curl https://abc123.ngrok-free.app/health
```

Reemplaza `abc123.ngrok-free.app` con tu URL real.

Respuesta esperada:

```json
{
	"status": "ok",
	"timestamp": "2026-02-03T...",
	"database": "connected"
}
```

**✅ ngrok accesible desde internet**

---

## Fase 3: Configuración de Dialogflow

### 3.1 Verificar Webhook en Dialogflow

1. Ve a [Dialogflow Console](https://dialogflow.cloud.google.com)
2. Selecciona tu agente
3. Ve a **Fulfillment**
4. Verifica que:
   - ✅ Webhook está habilitado
   - ✅ URL es: `https://tu-ngrok-url.ngrok-free.app/webhook`
   - ✅ No hay mensajes de error

**✅ Webhook configurado en Dialogflow**

---

### 3.2 Verificar Intents con Webhook

Verifica que estos intents tengan webhook habilitado:

1. `saludo` - ✅ Enable webhook call
2. `despedida` - ✅ Enable webhook call
3. `ayuda` - ✅ Enable webhook call
4. `faq_horarios` - ✅ Enable webhook call
5. `faq_ubicacion` - ✅ Enable webhook call
6. `faq_contacto` - ✅ Enable webhook call
7. `faq_redes_sociales` - ✅ Enable webhook call
8. `Default Fallback Intent` - ✅ Enable webhook call

**✅ Todos los intents con webhook habilitado**

---

## Fase 4: Testing de Intents

Ahora vamos a probar cada intent en el simulador de Dialogflow.

### 4.1 Test: Saludo

**En Dialogflow Console > Test Agent:**

```
Usuario: Hola
```

**Respuesta esperada:**

```
¡Hola! 👋 Soy el asistente virtual de CBRICENHO. ¿En qué puedo ayudarle hoy?

Puedo ayudarle con:
• Información de horarios y ubicación
• Agendar citas de servicio técnico
• Cotizaciones de productos
```

**Verifica en los logs del servidor:**

```
[Webhook] Session: projects/.../sessions/...
[Webhook] Intent: saludo
[Webhook] Query: Hola
[Metrics] Message recorded for session: ...
[Webhook] Response sent in XXms
```

**✅ Intent `saludo` funciona correctamente**

---

### 4.2 Test: Horarios

```
Usuario: ¿A qué hora atienden?
```

**Respuesta esperada:**

```
📅 Nuestros horarios de atención son:

🔹 Lunes a Viernes: 9:00 AM - 6:00 PM
🔹 Sábados: 9:00 AM - 1:00 PM
🔹 Domingos y feriados: Cerrado

¿Hay algo más en lo que pueda ayudarle?
```

**✅ Intent `faq_horarios` funciona correctamente**

---

### 4.3 Test: Ubicación

```
Usuario: ¿Dónde están ubicados?
```

**Respuesta esperada:**

```
📍 Nos encontramos en:

AA. HH. Marco Jara Schennone Mz D Lote 36, Paita
Paita, Piura, Perú

📌 Referencia: Frente al parque central del AA.HH. Marco Jara

¿Desea agendar una visita o tiene otra consulta?
```

**✅ Intent `faq_ubicacion` funciona correctamente**

---

### 4.4 Test: Contacto

```
Usuario: ¿Cuál es su teléfono?
```

**Respuesta esperada:**

```
📞 Puede contactarnos por:

🔹 Teléfono: [Valor configurado en .env]
🔹 WhatsApp: [Valor configurado en .env]
🔹 Correo: [Valor configurado en .env]

¿En qué más puedo ayudarle?
```

**Nota:** Si ves "Próximamente", actualiza los valores en `.env`

**✅ Intent `faq_contacto` funciona correctamente**

---

### 4.5 Test: Redes Sociales

```
Usuario: ¿Tienen Facebook?
```

**Respuesta esperada:**

```
📱 ¡Síguenos en nuestras redes sociales!

🔵 Facebook: facebook.com/cbricenho
📸 Instagram: @cbricenho

¿Hay algo más en lo que pueda ayudarle?
```

**✅ Intent `faq_redes_sociales` funciona correctamente**

---

### 4.6 Test: Ayuda

```
Usuario: ¿Qué puedes hacer?
```

**Respuesta esperada:**

```
¡Con gusto le explico! 😊

Puedo ayudarle con:

1️⃣ Información - Horarios, ubicación, contacto, redes sociales
2️⃣ Citas - Agendar servicio técnico (en local o a domicilio)
3️⃣ Cotizaciones - Precios de productos y servicios
4️⃣ Hablar con asesor - Si prefiere atención humana

Simplemente escriba lo que necesita o elija una opción.
```

**✅ Intent `ayuda` funciona correctamente**

---

### 4.7 Test: Fallback

```
Usuario: asdfghjkl
```

**Respuesta esperada:**

```
Disculpe, no entendí su mensaje. ¿Podría reformularlo o elegir una opción?

Puedo ayudarle con:
• Información general
• Agendar una cita
• Solicitar una cotización
```

**✅ Intent `Default Fallback Intent` funciona correctamente**

---

### 4.8 Test: Despedida

```
Usuario: Gracias, adiós
```

**Respuesta esperada:**

```
¡Gracias por contactarnos! Que tenga un excelente día. 😊
```

**✅ Intent `despedida` funciona correctamente**

---

## Fase 5: Verificar Base de Datos

### 5.1 Conectar a MongoDB

```bash
mongosh
```

### 5.2 Verificar la Base de Datos

```javascript
use cbricenho
```

### 5.3 Ver Conversaciones Registradas

```javascript
db.conversations.find().pretty();
```

Deberías ver documentos como:

```json
{
  "_id": ObjectId("..."),
  "sessionId": "projects/.../sessions/...",
  "userId": "unknown",
  "channel": "messenger",
  "messages": [
    {
      "role": "user",
      "content": "Hola",
      "intent": "saludo",
      "timestamp": ISODate("2026-02-03T...")
    },
    {
      "role": "bot",
      "content": "¡Hola! 👋 Soy el asistente...",
      "timestamp": ISODate("2026-02-03T...")
    }
  ],
  "totalMessages": 2,
  "startedAt": ISODate("2026-02-03T..."),
  ...
}
```

**✅ Las conversaciones se están registrando correctamente**

---

## Fase 6: Flujo de Conversación Completo

Realiza una conversación completa para simular un usuario real:

```
Usuario: Hola
Bot: [Mensaje de bienvenida]

Usuario: ¿Cuál es su horario?
Bot: [Horarios]

Usuario: ¿Dónde están ubicados?
Bot: [Ubicación]

Usuario: ¿Cómo los contacto?
Bot: [Contacto]

Usuario: Gracias
Bot: [Despedida]
```

**Verifica:**

1. ✅ Todos los intents se activaron correctamente
2. ✅ Las respuestas fueron coherentes
3. ✅ Los tiempos de respuesta fueron aceptables (< 1 segundo)
4. ✅ Los logs del servidor muestran todas las interacciones
5. ✅ MongoDB registró toda la conversación

**✅ Flujo completo funciona correctamente**

---

## Fase 7: Métricas para la Tesis

### 7.1 Verificar Tiempos de Respuesta

En los logs del servidor, busca:

```
[Webhook] Response sent in XXms
```

**Métrica esperada:** Tiempo promedio < 500ms

### 7.2 Consultar Estadísticas

Puedes crear un script simple para obtener estadísticas:

```javascript
// En mongosh
use cbricenho

// Total de conversaciones
db.conversations.count()

// Promedio de mensajes por conversación
db.conversations.aggregate([
  { $group: { _id: null, avgMessages: { $avg: "$totalMessages" } } }
])

// Conversaciones resueltas
db.conversations.count({ resolved: true })
```

**✅ Las métricas se están recopilando correctamente**

---

## Checklist Final de Validación

### Infraestructura

- [ ] MongoDB corriendo y conectado
- [ ] Servidor Node.js iniciado sin errores
- [ ] ngrok exponiendo el servidor
- [ ] Health check responde correctamente

### Dialogflow

- [ ] Webhook configurado con URL correcta
- [ ] Todas las entidades creadas
- [ ] Todos los intents creados con webhook habilitado
- [ ] Simulador conectado al webhook

### Funcionalidad

- [ ] Intent `saludo` funciona
- [ ] Intent `despedida` funciona
- [ ] Intent `ayuda` funciona
- [ ] Intent `faq_horarios` funciona
- [ ] Intent `faq_ubicacion` funciona
- [ ] Intent `faq_contacto` funciona
- [ ] Intent `faq_redes_sociales` funciona
- [ ] Intent `Default Fallback Intent` funciona

### Base de Datos

- [ ] Conversaciones se registran en MongoDB
- [ ] Mensajes incluyen role, content, intent, timestamp
- [ ] Métricas se calculan correctamente

### Performance

- [ ] Tiempo de respuesta < 500ms
- [ ] Sin errores en logs del servidor
- [ ] Sin timeouts en Dialogflow

---

## Solución de Problemas Comunes

### El bot no responde

**Checklist:**

1. ¿El servidor está corriendo? → Revisar terminal
2. ¿ngrok está activo? → Revisar otra terminal
3. ¿La URL de ngrok está actualizada en Dialogflow? → Verificar Fulfillment
4. ¿El intent tiene webhook habilitado? → Verificar intent

### MongoDB no guarda las conversaciones

**Posibles causas:**

1. MongoDB no está corriendo
2. Error en la conexión (revisar logs)
3. Error en el modelo (revisar código)

### Tiempos de respuesta lentos (> 1 segundo)

**Posibles causas:**

1. MongoDB lento (verificar recursos del sistema)
2. Conexión a Internet lenta (afecta ngrok)
3. Código ineficiente (revisar handlers)

### ngrok se desconecta

**Solución:**

1. Reiniciar ngrok
2. Copiar la nueva URL
3. Actualizar en Dialogflow > Fulfillment
4. Guardar

---

## Pruebas Iteración 2 - Gestión de Citas

Ver guía detallada en: [`DIALOGFLOW_ITERATION_2_SETUP.md`](DIALOGFLOW_ITERATION_2_SETUP.md)

### Flujos a Validar

| Flujo | Pasos | Resultado Esperado |
| ----- | ----- | ------------------ |
| Cita en local | cita_iniciar → equipo → problema → nombre → teléfono → fecha → hora → confirmar_si | Evento creado en Google Calendar |
| Cita a domicilio | cita_iniciar → domicilio → equipo → problema → nombre → teléfono → dirección → fecha → rango → confirmar_si | Evento creado en Google Calendar |
| Cancelar en medio del flujo | cualquier paso → confirmar_no | Pregunta qué modificar |
| Fecha inválida (>7 días) | cita_local_fecha con fecha lejana | Mensaje de error con alternativas |
| Horario no disponible | cita_local_hora con hora llena | Mensaje de alternativas |

---

## Pruebas Iteración 3 - Cotizaciones

Ver guía detallada en: [`DIALOGFLOW_ITERATION_3_SETUP.md`](DIALOGFLOW_ITERATION_3_SETUP.md)

### Pre-requisito

```bash
node fulfillment/src/scripts/seed-products.js
```

### Flujos a Validar

| Flujo | Pasos | Resultado Esperado |
| ----- | ----- | ------------------ |
| Cotizar computadora | cotizar_iniciar → computadora → uso → seleccionar → agregar_mas (no) → datos → confirmar_si | Cotización guardada en MongoDB |
| Cotizar repuesto laptop | cotizar_iniciar → repuesto → modelo → parte → seleccionar → datos → confirmar_si | Cotización guardada en MongoDB |
| Cotizar servicio técnico | cotizar_iniciar → servicio → tipo → equipo → seleccionar → datos → confirmar_si | Cotización guardada en MongoDB |
| Cancelar cotización | cotizar_confirmar_no | Cotización cancelada |
| Sin productos disponibles | categoría sin stock | Mensaje informativo |

---

## Prueba de Escalamiento (derivar_agente_humano)

| Mensaje del usuario | Resultado Esperado |
| ------------------- | ------------------ |
| "Quiero hablar con un humano" | Respuesta con datos de contacto + `escalatedToHuman = true` en BD |
| "agente" (dentro de un flujo activo) | Contextos limpios + mensaje diferenciado + `escalatedToHuman = true` |
| 3 fallbacks consecutivos | Escalamiento automático + `escalatedToHuman = true` |

---

## Estado de Testing

✅ **Las 3 iteraciones han sido probadas y validadas**

---

## Reportar Problemas

Si encuentras problemas que no puedes resolver:

1. **Revisar logs del servidor** en detalle
2. **Revisar logs de ngrok** en http://localhost:4040
3. **Verificar la configuración** paso a paso
4. **Documentar el error** con capturas de pantalla

---

¡Felicidades! Si completaste todos los pasos, tu chatbot está funcionando correctamente. 🎉

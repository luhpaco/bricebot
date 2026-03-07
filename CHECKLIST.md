# Checklist de Configuración - CBRICENHO Chatbot

Usa este checklist para verificar que todo está configurado correctamente antes de iniciar el chatbot.

## Pre-Requisitos del Sistema

- [x] Node.js >= 18.0.0 instalado

  ```bash
  node --version  # Debe mostrar v18.x.x o superior
  ```

- [x] MongoDB instalado y funcionando

  ```bash
  mongosh  # Debe conectarse sin errores
  ```

- [x] npm instalado

  ```bash
  npm --version
  ```

- [x] ngrok descargado
  - Ubicación: Instalado y configurado

---

## Configuración del Proyecto

### 1. Estructura de Archivos

- [x] Carpeta `fulfillment/src/` existe
- [x] Carpeta `fulfillment/src/handlers/` existe
- [x] Carpeta `fulfillment/src/services/` existe
- [x] Carpeta `fulfillment/src/models/` existe
- [x] Carpeta `fulfillment/src/config/` existe
- [x] Carpeta `docs/` existe

### 2. Archivos Críticos

- [x] `package.json` existe
- [x] `node_modules/` existe (después de `npm install`)
- [x] `.env` existe y está configurado
- [x] `.gitignore` existe
- [x] `README.md` existe

### 3. Credenciales de Google Cloud

- [x] Agente de Dialogflow ES creado

  - Nombre del agente: CBRICENHO
  - Project ID: Configurado

- [x] Service Account creada

  - Email: Configurado
  - Rol: Dialogflow API Client

- [x] Archivo `service-account.json` descargado
  - [x] Renombrado correctamente
  - [x] Ubicado en la raíz del proyecto
  - [x] NO está en Git (verificar .gitignore)

### 4. Variables de Entorno (.env)

Verifica que cada variable esté configurada:

```env
# Dialogflow
DIALOGFLOW_PROJECT_ID=_____________  ← ⚠️ Reemplazar
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json  ← ✅ OK

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cbricenho  ← ✅ OK
MONGODB_DB_NAME=cbricenho  ← ✅ OK

# App
NODE_ENV=development  ← ✅ OK
PORT=3000  ← ✅ OK

# Company Info
COMPANY_NAME=CBRICENHO E.I.R.L  ← ✅ OK
COMPANY_RUC=20606300825  ← ✅ OK
COMPANY_ADDRESS=A.H. Marco Jara...  ← ✅ OK
COMPANY_PHONE=_____________  ← ⚠️ Agregar
COMPANY_WHATSAPP=_____________  ← ⚠️ Agregar
COMPANY_EMAIL=_____________  ← ⚠️ Agregar
COMPANY_FACEBOOK=facebook.com/cbricenho  ← ✅ OK
COMPANY_INSTAGRAM=@cbricenho  ← ✅ OK
```

**Campos obligatorios completados:**

- [x] `DIALOGFLOW_PROJECT_ID`
- [x] `COMPANY_PHONE`
- [x] `COMPANY_WHATSAPP`
- [x] `COMPANY_EMAIL`

---

## Configuración de Dialogflow

### 1. Entidades Creadas (Iteración 1)

- [x] `@tipo_equipo` con 6 valores (PC, laptop, impresora, cámara, monitor, otro)
- [x] `@tipo_servicio` con 6 valores (mantenimiento, cambio_teclado, etc.)

### 2. Intents Creados (Iteración 1)

- [x] `saludo` con 10+ training phrases
- [x] `despedida` con 10+ training phrases
- [x] `ayuda` con 10+ training phrases
- [x] `faq_horarios` con 15+ training phrases
- [x] `faq_ubicacion` con 10+ training phrases
- [x] `faq_contacto` con 10+ training phrases
- [x] `faq_redes_sociales` con 10+ training phrases
- [x] `Default Fallback Intent` con webhook habilitado
- [x] `derivar_agente_humano` con 15+ training phrases

### 3. Webhook Habilitado en Intents

Cada intent tiene **"Enable webhook call for this intent"** activado:

- [x] `saludo` ✅
- [x] `despedida` ✅
- [x] `ayuda` ✅
- [x] `faq_horarios` ✅
- [x] `faq_ubicacion` ✅
- [x] `faq_contacto` ✅
- [x] `faq_redes_sociales` ✅
- [x] `Default Fallback Intent` ✅
- [x] `derivar_agente_humano` ✅

### 4. Fulfillment Global

- [x] En Dialogflow Console > Fulfillment
- [x] Webhook habilitado
- [x] URL configurada y probada
- [x] Sin errores al guardar

---

## Pruebas de Funcionamiento

### 1. MongoDB

```bash
mongosh
```

- [ ] Se conecta sin errores
- [ ] Puedes ejecutar: `show dbs`
- [ ] Puedes ejecutar: `use cbricenho`

### 2. Servidor Node.js

```bash
npm run dev
```

Verifica que aparezca:

- [ ] `[Database] Connected to MongoDB`
- [ ] `[Server] CBRICENHO Chatbot running on port 3000`
- [ ] `[Server] Webhook URL: http://localhost:3000/webhook`
- [ ] Sin errores en rojo

### 3. Health Check Local

```bash
curl http://localhost:3000/health
```

O abre en navegador: http://localhost:3000/health

- [ ] Responde con JSON
- [ ] `"status": "ok"`
- [ ] `"database": "connected"`

### 4. ngrok

```bash
ngrok http 3000
```

- [ ] Se inicia sin errores
- [ ] Muestra URL de Forwarding: `https://_____________.ngrok-free.app`
- [ ] Copia la URL para configurar en Dialogflow

### 5. Health Check Público (a través de ngrok)

```bash
curl https://tu-url.ngrok-free.app/health
```

- [ ] Responde con JSON igual que local
- [ ] `"status": "ok"`
- [ ] `"database": "connected"`

### 6. Dialogflow Console > Fulfillment

- [ ] URL de webhook actualizada con URL de ngrok
- [ ] Sin errores al guardar
- [ ] Status indicator verde

---

## Pruebas en el Simulador

En Dialogflow Console > **Test Agent**:

### Test 1: Saludo

- [ ] Usuario: `Hola`
- [ ] Bot responde con mensaje de bienvenida completo
- [ ] Sin errores

### Test 2: Horarios

- [ ] Usuario: `¿A qué hora atienden?`
- [ ] Bot responde con horarios (L-V, Sábado, Domingo)
- [ ] Sin errores

### Test 3: Ubicación

- [ ] Usuario: `¿Dónde están?`
- [ ] Bot responde con dirección completa
- [ ] Sin errores

### Test 4: Contacto

- [ ] Usuario: `¿Cuál es su teléfono?`
- [ ] Bot responde con teléfono, WhatsApp y correo
- [ ] Los valores NO son "Próximamente" (están configurados en .env)

### Test 5: Redes Sociales

- [ ] Usuario: `¿Tienen Facebook?`
- [ ] Bot responde con Facebook e Instagram
- [ ] Sin errores

### Test 6: Fallback

- [ ] Usuario: `asdfghjkl`
- [ ] Bot responde con mensaje de fallback
- [ ] Ofrece opciones alternativas

### Test 7: Despedida

- [ ] Usuario: `Gracias, adiós`
- [ ] Bot responde con mensaje de despedida
- [ ] Sin errores

---

## Verificación de Logs

### Logs del Servidor

En la terminal donde ejecutaste `npm run dev`, deberías ver:

- [ ] `[Webhook] Session: projects/...`
- [ ] `[Webhook] Intent: nombre_del_intent`
- [ ] `[Webhook] Query: texto_del_usuario`
- [ ] `[Metrics] Message recorded`
- [ ] `[Webhook] Response sent in XXms`
- [ ] Sin errores en rojo

### Logs de MongoDB

```bash
mongosh
use cbricenho
db.conversations.find().pretty()
```

- [ ] Hay documentos en la colección `conversations`
- [ ] Cada documento tiene `sessionId`, `messages`, `startedAt`
- [ ] Los mensajes incluyen `role`, `content`, `intent`, `timestamp`

---

## Documentación Revisada

- [ ] He leído [`README.md`](README.md)
- [ ] He leído [`docs/QUICK_START.md`](docs/QUICK_START.md)
- [ ] He seguido [`docs/SETUP_CREDENTIALS.md`](docs/SETUP_CREDENTIALS.md)
- [ ] He seguido [`docs/SETUP_NGROK_DIALOGFLOW.md`](docs/SETUP_NGROK_DIALOGFLOW.md)
- [ ] He seguido [`docs/DIALOGFLOW_INTENTS_SETUP.md`](docs/DIALOGFLOW_INTENTS_SETUP.md)
- [ ] He completado [`docs/TESTING_GUIDE.md`](docs/TESTING_GUIDE.md)

---

## Problemas Comunes

Si algo no funciona, revisa:

### MongoDB no conecta

- [ ] MongoDB está corriendo: `mongosh` funciona
- [ ] `MONGODB_URI` en `.env` es correcto
- [ ] Puerto 27017 no está bloqueado

### Servidor no inicia

- [ ] `npm install` completado sin errores
- [ ] `service-account.json` existe
- [ ] `.env` configurado correctamente
- [ ] Puerto 3000 no está en uso

### Dialogflow no llama al webhook

- [ ] Servidor corriendo (`npm run dev`)
- [ ] ngrok corriendo (`ngrok http 3000`)
- [ ] URL en Dialogflow es correcta y actualizada
- [ ] Intent tiene webhook habilitado
- [ ] Fulfillment global está habilitado

### Bot responde texto estático de Dialogflow

- [ ] Webhook está habilitado en el intent específico
- [ ] URL del webhook es correcta
- [ ] Servidor está respondiendo (revisar logs)

---

## Estado Final - 3 Iteraciones Completadas

✅ **Las 3 iteraciones han sido completadas exitosamente.**

Estado actual:

1. ✅ Iteración 1 (FAQ) - completada y validada
2. ✅ Iteración 2 (Gestión de Citas) - completada y validada
3. ✅ Iteración 3 (Cotizaciones) - completada y validada

## Checklist Iteración 2

- [x] Google Calendar API configurada
- [x] Handlers de citas implementados (appointments.handler.js)
- [x] 20 intents de citas creados en Dialogflow
- [x] Testing de flujos de citas (local y domicilio)
- [x] Validación de fecha, hora, teléfono y cobertura geográfica

## Checklist Iteración 3

- [x] Seed de catálogo ejecutado (10 computadoras, 13 repuestos, 9 servicios)
- [x] Modelo Service.js implementado
- [x] quotes.service.js implementado
- [x] quotes.handler.js implementado (15 intents)
- [x] 15 intents de cotización creados en Dialogflow
- [x] Entidad @uso_computadora creada
- [x] Cálculo de IGV (18%) verificado
- [x] Testing de flujos de cotización

## Checklist Intent de Escalamiento

- [x] Intent `derivar_agente_humano` creado en Dialogflow
- [x] Handler registrado en webhook
- [x] Limpieza de contextos activos verificada
- [x] Campo `escalatedToHuman` se marca correctamente en MongoDB
- [x] Fallback progresivo (3 intentos) también marca escalamiento

---

## Contacto y Soporte

**Proyecto:** Chatbot CBRICENHO  
**Desarrollador:** Luis Humberto Paz Córdova  
**Universidad:** Universidad Nacional de Piura

**Recursos:**

- 📖 [README](README.md)
- 🚀 [Quick Start](docs/QUICK_START.md)
- 📊 [Estado del Proyecto](docs/PROJECT_STATUS.md)
- 🔍 [Guía de Testing](docs/TESTING_GUIDE.md)

---

**Fecha de verificación:** ******\_\_\_******  
**Verificado por:** ******\_\_\_******  
**Resultado:** ⬜ Aprobado | ⬜ Requiere correcciones

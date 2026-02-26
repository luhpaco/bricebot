# Configuración de ngrok y Webhook en Dialogflow

Este documento explica cómo configurar ngrok para exponer tu servidor local y conectarlo con Dialogflow.

## Parte 1: Instalar y Configurar ngrok

### Paso 1: Descargar ngrok

1. Ve a: https://ngrok.com/download
2. Descarga la versión para Windows
3. Extrae el archivo `ngrok.exe` en una ubicación conveniente (ej: `C:\ngrok\`)

### Paso 2: (Opcional) Crear una Cuenta

Para obtener un token de autenticación y evitar limitaciones:

1. Crea una cuenta gratuita en: https://dashboard.ngrok.com/signup
2. Ve a: https://dashboard.ngrok.com/get-started/your-authtoken
3. Copia tu authtoken
4. Ejecuta en la terminal:

```bash
ngrok authtoken TU_TOKEN_AQUI
```

### Paso 3: Iniciar el Servidor del Chatbot

Abre una terminal y ejecuta:

```bash
npm run dev
```

Deberías ver:

```
[Server] CBRICENHO Chatbot running on port 3000
[Server] Webhook URL: http://localhost:3000/webhook
```

**IMPORTANTE:** Deja esta terminal abierta mientras trabajas.

### Paso 4: Exponer el Servidor con ngrok

Abre **otra terminal** (mantén la del servidor abierta) y ejecuta:

```bash
ngrok http 3000
```

Verás una pantalla como esta:

```
ngrok

Session Status                online
Account                       tu@email.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copia la URL de Forwarding** (la que empieza con `https://`).
Por ejemplo: `https://abc123def456.ngrok-free.app`

**IMPORTANTE:** Esta URL cambiará cada vez que reinicies ngrok (en la versión gratuita).

### Paso 5: Verificar que Funciona

En un navegador o con curl, prueba:

```bash
curl https://abc123def456.ngrok-free.app/health
```

Deberías recibir:

```json
{
	"status": "ok",
	"timestamp": "2026-02-03T...",
	"database": "connected"
}
```

---

## Parte 2: Configurar el Webhook en Dialogflow

### Paso 1: Acceder a Dialogflow Console

1. Ve a: https://dialogflow.cloud.google.com
2. Inicia sesión con tu cuenta de Google
3. Selecciona tu agente (el que ya creaste)

### Paso 2: Habilitar Fulfillment

1. En el menú lateral izquierdo, haz clic en **Fulfillment**
2. Activa el interruptor de **Webhook**
3. En el campo **URL**, pega tu URL de ngrok + `/webhook`:

```
https://abc123def456.ngrok-free.app/webhook
```

**Reemplaza** `abc123def456.ngrok-free.app` con tu URL real de ngrok.

4. (Opcional) Configura el timeout. Recomendado: **10 segundos**
5. Deja las cabeceras vacías (no son necesarias por ahora)
6. Haz clic en **SAVE** en la parte inferior

### Paso 3: Verificar la Conexión

Dialogflow mostrará un mensaje de éxito si la conexión es correcta.

Si ves un error:

- Verifica que ngrok esté corriendo
- Verifica que el servidor Node.js esté corriendo
- Verifica que la URL esté correcta (debe incluir `/webhook`)
- Revisa los logs de tu servidor en la terminal

---

## Parte 3: Habilitar Webhook en los Intents

Para que Dialogflow llame a tu webhook cuando un intent se active:

### Paso 1: Ir a un Intent

1. En el menú lateral, haz clic en **Intents**
2. Selecciona un intent (ej: `faq_horarios`)

### Paso 2: Habilitar Webhook

1. Desplázate hasta la sección **Fulfillment** al final del intent
2. Activa el interruptor: **Enable webhook call for this intent**
3. Haz clic en **SAVE**

### Paso 3: Repetir para Todos los Intents de FAQ

Habilita el webhook para estos intents:

- `saludo`
- `despedida`
- `ayuda`
- `faq_horarios`
- `faq_ubicacion`
- `faq_contacto`
- `faq_redes_sociales`

**Nota:** El `Default Fallback Intent` ya tiene el webhook habilitado por defecto.

---

## Parte 4: Probar la Integración

### Paso 1: Abrir el Simulador

1. En Dialogflow Console, haz clic en **Test Agent** (panel derecho)
2. Si no está visible, haz clic en el ícono de mensaje en la esquina superior derecha

### Paso 2: Enviar Mensajes de Prueba

Escribe en el simulador:

```
Hola
```

Deberías recibir el mensaje de bienvenida del chatbot.

Prueba con:

```
¿Cuál es el horario de atención?
```

Deberías recibir los horarios configurados.

### Paso 3: Revisar los Logs del Servidor

En la terminal donde está corriendo tu servidor, verás:

```
[Webhook] Session: projects/.../sessions/...
[Webhook] Intent: faq_horarios
[Webhook] Query: ¿Cuál es el horario de atención?
[Metrics] Message recorded for session: ...
[Webhook] Response sent in 45ms
```

### Paso 4: Revisar los Logs de ngrok (Opcional)

ngrok tiene una interfaz web para ver las peticiones:

1. Abre en tu navegador: http://localhost:4040
2. Verás todas las peticiones HTTP que pasan por ngrok
3. Útil para debugging

---

## Solución de Problemas

### ngrok dice "command not found"

**Solución:** Agrega ngrok al PATH o ejecuta con la ruta completa:

```bash
C:\ngrok\ngrok.exe http 3000
```

### Dialogflow muestra error al guardar el webhook

**Posibles causas:**

1. La URL no es accesible públicamente
2. El servidor no está corriendo
3. La URL no incluye `/webhook`

**Verificar:**

```bash
# Debe responder con JSON
curl https://tu-url-ngrok.ngrok-free.app/health
```

### El intent no llama al webhook

**Solución:**

1. Verifica que el intent tenga "Enable webhook call for this intent" activado
2. Guarda el intent después de habilitarlo
3. Prueba nuevamente en el simulador

### ngrok muestra "Too Many Connections"

**Solución:** La cuenta gratuita de ngrok tiene límite de conexiones. Opciones:

1. Reinicia ngrok
2. Actualiza a un plan de pago
3. Usa una alternativa como localtunnel o serveo

### La URL de ngrok cambió

**Esto es normal** en la cuenta gratuita. Cada vez que reinicies ngrok:

1. Copia la nueva URL
2. Actualiza la URL en Dialogflow Console > Fulfillment
3. Guarda los cambios

Para evitar esto, considera:

- Cuenta de pago de ngrok (tiene URLs estáticas)
- Desplegar en un servidor real (Heroku, Google Cloud Run, etc.)

---

## Monitorear las Peticiones

### Logs del Servidor

La terminal de tu servidor mostrará:

```
[2026-02-03T...] POST /webhook
[Webhook] Session: ...
[Webhook] Intent: faq_horarios
[Webhook] Query: ¿Cuál es el horario?
[Metrics] Message recorded
[Webhook] Response sent in 42ms
```

### Interfaz Web de ngrok

http://localhost:4040

Muestra:

- Todas las peticiones HTTP
- Request/Response completos
- Tiempos de respuesta
- Errores

### MongoDB Compass (Opcional)

Para ver las conversaciones registradas:

1. Instala MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Conecta a: `mongodb://localhost:27017`
3. Selecciona la base de datos `cbricenho`
4. Ve la colección `conversations`

---

## Próximos Pasos

Una vez que la integración funcione correctamente:

1. ✅ Crear los intents restantes en Dialogflow
2. ✅ Habilitar webhook en cada intent
3. ✅ Probar todos los flujos de FAQ
4. ✅ Comenzar con la Iteración 2 (Gestión de Citas)

---

## Notas Importantes

- **Mantén ambas terminales abiertas** (servidor + ngrok) mientras desarrollas
- **La URL de ngrok cambia** cada vez que lo reinicias (en la versión gratuita)
- **Actualiza Dialogflow** cada vez que la URL de ngrok cambie
- **Los logs son tu mejor amigo** para debugging
- **MongoDB debe estar corriendo** para que el servidor inicie correctamente

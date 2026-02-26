# Crear Intents y Entidades en Dialogflow

Esta guía te ayudará a configurar todos los intents y entidades necesarios para la **Iteración 1 (FAQ)** del chatbot CBRICENHO.

## Parte 1: Crear Entidades Personalizadas

Las entidades son como los tipos de datos que Dialogflow puede extraer de las frases del usuario.

### Paso 1: Acceder a Entities

1. Ve a [Dialogflow Console](https://dialogflow.cloud.google.com)
2. Selecciona tu agente
3. En el menú lateral, haz clic en **Entities**

### Paso 2: Crear @tipo_equipo

1. Haz clic en **CREATE ENTITY**
2. Nombre de la entidad: `tipo_equipo`
3. Agrega las siguientes entradas:

| Reference Value | Synonyms                                                    |
| --------------- | ----------------------------------------------------------- |
| PC              | computadora, computador, desktop, equipo de escritorio, cpu |
| laptop          | notebook, portátil, portatil, lap, laptops                  |
| impresora       | printer, impresoras, multifuncional                         |
| camara          | cámara, camaras, cámaras, camara de seguridad               |
| monitor         | pantalla, display, monitores                                |
| otro            | otros, diferente, distinto                                  |

4. Deja **Allow automated expansion** activado
5. Haz clic en **SAVE**

### Paso 3: Crear @tipo_servicio

1. Haz clic en **CREATE ENTITY**
2. Nombre de la entidad: `tipo_servicio`
3. Agrega las siguientes entradas:

| Reference Value      | Synonyms                                                                         |
| -------------------- | -------------------------------------------------------------------------------- |
| mantenimiento        | limpieza, mantenimiento preventivo, mantenimiento correctivo, revisión, revision |
| cambio_teclado       | teclado roto, cambiar teclado, reparar teclado                                   |
| cambio_pantalla      | pantalla rota, cambiar pantalla, display roto                                    |
| repotenciacion       | upgrade, mejora, aumentar ram, cambiar disco, ssd                                |
| instalacion_software | instalar windows, instalar office, formatear, formateo                           |
| instalacion_camaras  | instalar camaras, instalación de cámaras, poner camaras                          |

4. Deja **Allow automated expansion** activado
5. Haz clic en **SAVE**

**Nota:** Crearemos más entidades en las siguientes iteraciones cuando implementemos Citas y Cotizaciones.

---

## Parte 2: Crear Intents de FAQ

Ahora crearemos los intents básicos para responder consultas frecuentes.

### Intent 1: saludo

1. En el menú lateral, haz clic en **Intents**
2. Haz clic en **CREATE INTENT**
3. **Intent name:** `saludo`

**Training Phrases:**

Haz clic en **ADD TRAINING PHRASES** y agrega:

```
Hola
Buenos días
Buenas tardes
Buenas noches
Qué tal
Hey
Buenas
Holi
Saludos
Buen día
Qué onda
Alo
Hola, cómo están
Buenos días, quisiera información
```

**Action and Parameters:** (Dejar vacío)

**Responses:** (Dejar vacío - usaremos el webhook)

**Fulfillment:**

1. Desplázate hasta el final
2. Activa: **Enable webhook call for this intent**

**Haz clic en SAVE**

---

### Intent 2: despedida

1. **CREATE INTENT**
2. **Intent name:** `despedida`

**Training Phrases:**

```
Chao
Adiós
Hasta luego
Gracias, eso es todo
Bye
Nos vemos
Eso sería todo
Gracias
Muchas gracias
Hasta pronto
Me despido
Eso es todo por ahora
Okay, gracias
Perfecto, gracias
```

**Fulfillment:**

- ✅ Enable webhook call for this intent

**SAVE**

---

### Intent 3: ayuda

1. **CREATE INTENT**
2. **Intent name:** `ayuda`

**Training Phrases:**

```
Ayuda
¿Qué puedes hacer?
Opciones
Menú
¿Cómo funciona?
No sé qué hacer
¿En qué me puedes ayudar?
¿Qué opciones tengo?
¿Qué servicios ofrecen?
Necesito ayuda
Auxilio
No entiendo
Explícame qué haces
```

**Fulfillment:**

- ✅ Enable webhook call for this intent

**SAVE**

---

### Intent 4: faq_horarios

1. **CREATE INTENT**
2. **Intent name:** `faq_horarios`

**Training Phrases:**

```
¿A qué hora atienden?
Horario de atención
¿Cuál es su horario?
¿Están abiertos los sábados?
¿Qué días trabajan?
¿Hasta qué hora están?
¿A qué hora abren?
¿A qué hora cierran?
¿Atienden domingos?
Horarios
¿Cuándo están abiertos?
¿Trabajan feriados?
¿Abren los sábados?
Quiero saber el horario
¿Están abiertos hoy?
¿A qué hora puedo ir?
```

**Fulfillment:**

- ✅ Enable webhook call for this intent

**SAVE**

---

### Intent 5: faq_ubicacion

1. **CREATE INTENT**
2. **Intent name:** `faq_ubicacion`

**Training Phrases:**

```
¿Dónde están ubicados?
¿Cuál es su dirección?
Dirección
Ubicación
¿Dónde queda CBRICENHO?
¿Cómo llego?
¿Por dónde están?
Mapa
¿Dónde los encuentro?
¿En qué zona están?
¿Dónde están?
Su ubicación
¿Tienen local físico?
¿Dónde puedo visitarlos?
Quiero ir al local
```

**Fulfillment:**

- ✅ Enable webhook call for this intent

**SAVE**

---

### Intent 6: faq_contacto

1. **CREATE INTENT**
2. **Intent name:** `faq_contacto`

**Training Phrases:**

```
¿Cuál es el teléfono?
Número de teléfono
¿Tienen WhatsApp?
¿Cuál es su correo?
Email
¿Cómo los contacto?
Datos de contacto
Teléfono
¿Me pueden llamar?
Quiero que me llamen
Contacto
¿Cómo me comunico con ustedes?
Teléfono de contacto
WhatsApp
Correo electrónico
```

**Fulfillment:**

- ✅ Enable webhook call for this intent

**SAVE**

---

### Intent 7: faq_redes_sociales

1. **CREATE INTENT**
2. **Intent name:** `faq_redes_sociales`

**Training Phrases:**

```
¿Tienen Facebook?
¿Cuál es su Instagram?
Redes sociales
Facebook
Instagram
¿Dónde los sigo?
Fan page
¿Están en redes?
Páginas sociales
¿Tienen cuenta de Instagram?
Quiero seguirlos
Su Facebook
Su Instagram
```

**Fulfillment:**

- ✅ Enable webhook call for this intent

**SAVE**

---

### Default Fallback Intent

Este intent ya existe en tu agente. Solo necesitas verificar:

1. Haz clic en **Default Fallback Intent** en la lista
2. Verifica que **Enable webhook call for this intent** esté activado
3. Si no lo está, actívalo
4. **SAVE**

---

## Parte 3: Verificar la Configuración

### Checklist de Entidades

- [ ] `@tipo_equipo` creada con 6 valores
- [ ] `@tipo_servicio` creada con 6 valores

### Checklist de Intents

- [ ] `saludo` creado con webhook habilitado
- [ ] `despedida` creado con webhook habilitado
- [ ] `ayuda` creado con webhook habilitado
- [ ] `faq_horarios` creado con webhook habilitado
- [ ] `faq_ubicacion` creado con webhook habilitado
- [ ] `faq_contacto` creado con webhook habilitado
- [ ] `faq_redes_sociales` creado con webhook habilitado
- [ ] `Default Fallback Intent` con webhook habilitado

### Verificar Webhook Global

1. Ve a **Fulfillment** en el menú lateral
2. Verifica que el **Webhook** esté habilitado
3. Verifica que la URL sea: `https://tu-ngrok-url.ngrok-free.app/webhook`
4. Si todo está correcto, continúa a probar

---

## Parte 4: Probar los Intents

### Prueba 1: Saludo

En el simulador (Test Agent):

```
Usuario: Hola
Bot: ¡Hola! 👋 Soy el asistente virtual de CBRICENHO...
```

### Prueba 2: Horarios

```
Usuario: ¿A qué hora atienden?
Bot: 📅 Nuestros horarios de atención son:
     Lunes a Viernes: 9:00 AM - 6:00 PM...
```

### Prueba 3: Ubicación

```
Usuario: ¿Dónde están ubicados?
Bot: 📍 Nos encontramos en:
     AA. HH. Marco Jara Schennone...
```

### Prueba 4: Contacto

```
Usuario: ¿Cuál es su teléfono?
Bot: 📞 Puede contactarnos por:
     Teléfono: ...
```

### Prueba 5: Redes Sociales

```
Usuario: ¿Tienen Facebook?
Bot: 📱 ¡Síguenos en nuestras redes sociales!...
```

### Prueba 6: Ayuda

```
Usuario: ¿Qué puedes hacer?
Bot: ¡Con gusto le explico! 😊
     Puedo ayudarle con:...
```

### Prueba 7: Fallback

```
Usuario: asdfghjkl
Bot: Disculpe, no entendí su mensaje...
```

### Prueba 8: Despedida

```
Usuario: Gracias, adiós
Bot: ¡Gracias por contactarnos! Que tenga un excelente día. 😊
```

---

## Solución de Problemas

### El intent no se activa

**Posibles causas:**

1. Las training phrases no cubren la variación del usuario
2. Otro intent tiene mayor confianza

**Solución:**

- Agrega más training phrases variadas
- Revisa en el simulador qué intent se está activando

### El bot responde con el texto estático de Dialogflow

**Causa:** El webhook no está habilitado en el intent

**Solución:**

1. Abre el intent
2. Ve a la sección Fulfillment
3. Activa "Enable webhook call for this intent"
4. SAVE

### El bot no responde

**Posibles causas:**

1. El webhook no está configurado correctamente
2. El servidor no está corriendo
3. ngrok no está exponiendo el puerto

**Solución:**

1. Verifica que el servidor esté corriendo: `npm run dev`
2. Verifica que ngrok esté activo: `ngrok http 3000`
3. Verifica la URL en Fulfillment
4. Revisa los logs del servidor

### Error "WEBHOOK_ERROR" en el simulador

**Causa:** El servidor no puede procesar la petición

**Solución:**

1. Revisa los logs del servidor en la terminal
2. Verifica que MongoDB esté corriendo
3. Verifica que no haya errores de sintaxis en el código

---

## Exportar la Configuración (Backup)

Es buena práctica hacer backups de tu agente:

1. Ve a **Settings** (ícono de engranaje junto al nombre del agente)
2. Haz clic en la pestaña **Export and Import**
3. Haz clic en **EXPORT AS ZIP**
4. Guarda el archivo en: `dialogflow/agent-backup-FECHA.zip`

---

## Parte 4: Intent de Escalamiento a Agente Humano

Este intent permite al usuario solicitar atención humana en cualquier momento de la conversación. A diferencia de los intents FAQ anteriores, este handler es `async` porque registra la solicitud de escalamiento en MongoDB para las métricas de la tesis.

### Intent: derivar_agente_humano

1. En el menú lateral, haz clic en **Intents**
2. Haz clic en **CREATE INTENT**
3. **Intent name:** `derivar_agente_humano`

**Training Phrases:**

Haz clic en **ADD TRAINING PHRASES** y agrega:

```
Quiero hablar con un humano
Quiero hablar con una persona
Agente
Asesor
Persona real
No me entiendes
Quiero hablar con alguien
Necesito ayuda humana
Comunícame con alguien
Hablar con asesor
Derivar a agente
Atención humana
Prefiero hablar con alguien
Quiero que me atienda una persona
No quiero chatbot
```

**Action and Parameters:** (Dejar vacío)

**Contexts:** (Dejar vacío tanto Input como Output)

No necesita contextos porque debe funcionar en cualquier punto de la conversación, incluso a mitad de un flujo de cita o cotización.

**Responses:** (Dejar vacío - usaremos el webhook)

**Fulfillment:**

1. Desplázate hasta el final
2. Activa: **Enable webhook call for this intent**

**Haz clic en SAVE**

---

### Verificar el intent

En el simulador de Dialogflow (**Try it now**):

| Mensaje del usuario | Respuesta esperada |
| ------------------- | ------------------ |
| "Quiero hablar con un humano" | Mensaje con datos de contacto (teléfono, WhatsApp, horario) |
| "Agente" | Mismo mensaje de contacto |
| "No me entiendes" | Mensaje de contacto (no confundir con fallback) |

### Verificar el comportamiento dentro de un flujo activo

1. Inicia un flujo de cita: escribe "Quiero agendar una cita"
2. El bot preguntará "¿Local o domicilio?"
3. En vez de responder, escribe "Quiero hablar con un humano"
4. El bot debe:
   - Cancelar el flujo de cita activo
   - Mostrar un mensaje diferente que reconoce el proceso cancelado
   - Los contextos de cita deben haberse limpiado

**Respuesta esperada dentro de un flujo:**

```
Entiendo. Voy a cancelar el proceso actual y comunicarlo con un asesor. 👤

Puede contactarnos directamente por:
📞 Teléfono: [número configurado]
💬 WhatsApp: [número configurado]

🕐 Horario de atención:
Lunes a Viernes: 9:00 AM - 6:00 PM
Sábados: 9:00 AM - 1:00 PM

No se preocupe, cuando vuelva a contactarnos podremos retomar su solicitud.
```

**Respuesta esperada sin flujo activo:**

```
Entiendo, con gusto lo comunicamos con uno de nuestros asesores. 👤

Puede contactarnos directamente por:
📞 Teléfono: [número configurado]
💬 WhatsApp: [número configurado]

🕐 Horario de atención:
Lunes a Viernes: 9:00 AM - 6:00 PM
Sábados: 9:00 AM - 1:00 PM

Lamentamos no haber podido resolver su consulta automáticamente. ¡Nuestro equipo estará encantado de atenderle!
```

### Verificar métricas en MongoDB

Después de probar el intent, verifica que se registró el escalamiento:

```bash
mongosh
use cbricenho
db.conversations.find({ escalatedToHuman: true })
```

Deberías ver al menos un documento con `escalatedToHuman: true`.

### Verificar escalamiento automático por fallback

Este fix se hizo al mismo tiempo que el intent `derivar_agente_humano`. Verifica que funciona:

1. En el simulador, escribe 3 mensajes sin sentido seguidos:
   - "asdfghjkl"
   - "xyz123"
   - "qwerty"
2. En el tercer mensaje, el bot debe ofrecer comunicar con un asesor
3. Verifica en MongoDB que `escalatedToHuman: true` también se marcó

---

### Troubleshooting

**El bot no reconoce "Quiero hablar con un humano":**

- Verifica que el intent `derivar_agente_humano` tenga webhook habilitado
- Verifica que el nombre del intent sea exactamente `derivar_agente_humano` (sin espacios extra)
- Asegúrate de haber hecho clic en **SAVE** después de crear el intent

**El bot responde con texto estático en vez del webhook:**

- Ve al intent > desplázate hasta **Fulfillment** > verifica que **Enable webhook call for this intent** esté activado

**Los contextos de cita/cotización no se limpian:**

- Revisa los logs del servidor para ver si el handler `handleDerivarAgente` se ejecutó
- Verifica que ngrok esté corriendo y la URL en Dialogflow sea correcta

**`escalatedToHuman` no se marca en MongoDB:**

- Es no-fatal: el handler continúa aunque falle la actualización
- Revisa los logs del servidor buscando `[DerivarAgente] Metrics escalation update failed`
- Verifica que MongoDB esté corriendo y conectado

---

## Próximos Pasos

Una vez que todos los intents funcionen correctamente:

✅ **Iteración 1 (FAQ + Escalamiento) completada**

Siguiente: **Iteración 2 - Gestión de Citas**

Ver guía detallada en: [`DIALOGFLOW_ITERATION_2_SETUP.md`](DIALOGFLOW_ITERATION_2_SETUP.md)

---

## Recursos Adicionales

- [Dialogflow ES Documentation](https://cloud.google.com/dialogflow/es/docs)
- [Training Phrases Best Practices](https://cloud.google.com/dialogflow/es/docs/intents-training-phrases)
- [Entities Guide](https://cloud.google.com/dialogflow/es/docs/entities-overview)
- [Fulfillment Guide](https://cloud.google.com/dialogflow/es/docs/fulfillment-overview)

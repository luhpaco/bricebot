# Flujo FAQ y Escalamiento - Iteración 1

## Intents cubiertos

`saludo`, `despedida`, `ayuda`, `faq_horarios`, `faq_ubicacion`, `faq_contacto`, `faq_redes_sociales`, `Default Fallback Intent`, `derivar_agente_humano`

## Diagrama de flujo general

```
Usuario envía mensaje
        │
        ▼
┌───────────────────┐
│  Dialogflow NLU   │
│ detecta el intent │
└────────┬──────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
    ▼                                 ▼
Intent reconocido            Default Fallback Intent
    │                                 │
    ▼                          ┌──────┴──────┐
Respuesta estática             │ fallback_count │
(horarios, ubicación,          │ ¿es >= 3?     │
contacto, redes)               └──────┬──────┘
                                  Sí  │  No
                               ┌──────┘  └──────┐
                               ▼                 ▼
                       markEscalatedToHuman  Incrementar
                       MESSAGES.ESCALATE    contador
                                            (retry o
                                             fallback)
```

## Flujo de Escalamiento Explícito (`derivar_agente_humano`)

```
Usuario: "Quiero hablar con un humano" / "agente" / etc.
         │
         ▼
┌────────────────────────┐
│  ¿Hay flujo activo?    │
│  getActiveFlow(agent)  │
└────────┬───────────────┘
    No   │   Sí
    │    └──────────────────────┐
    │                           ▼
    │              Limpiar todos los contextos
    │              CONTEXT_NAMES.APPOINTMENT
    │              CONTEXT_NAMES.QUOTE
    │                           │
    └──────────┬────────────────┘
               ▼
     Limpiar fallback_count
               │
               ▼
     markEscalatedToHuman()
     → conversation.escalatedToHuman = true
     → Persiste en MongoDB
               │
               ▼
   ┌───────────────────────────┐
   │  ¿Había flujo activo?     │
   └───────────┬───────────────┘
          No   │   Sí
          │    └──────────────────────┐
          ▼                           ▼
   MESSAGES.DERIVAR_AGENTE   MESSAGES.DERIVAR_AGENTE_CON_FLUJO
   (mensaje genérico)        (reconoce proceso cancelado)
```

## Fallback Progresivo (3 intentos automáticos)

```
Usuario envía mensaje no reconocido
            │
            ▼
   ┌────────────────────┐
   │  Leer contexto     │
   │  fallback_count    │
   └────────┬───────────┘
            │
    count   │   count   │   count
     = 0    │    = 1    │   >= 2
      ▼     │     ▼     │     ▼
 MESSAGES.  │ MESSAGES. │ markEscalatedToHuman()
 FALLBACK   │ FALLBACK  │ MESSAGES.ESCALATE
 count → 1  │ _RETRY    │ Limpiar contexto
            │ count → 2 │
```

## Training Phrases de `derivar_agente_humano`

| Frase | Variación |
| ----- | --------- |
| "Quiero hablar con un humano" | Explícita |
| "Agente" | Palabra clave |
| "Asesor" | Rol |
| "Persona real" | Énfasis humano |
| "No me entiendes" | Frustración |
| "Quiero hablar con alguien" | General |
| "Necesito ayuda humana" | Necesidad |
| "Comunícame con alguien" | Solicitud directa |
| "Hablar con asesor" | Rol |
| "Derivar a agente" | Técnico |
| "Atención humana" | Tipo de atención |
| "Prefiero hablar con alguien" | Preferencia |
| "Quiero que me atienda una persona" | Explícita completa |
| "No quiero chatbot" | Rechazo al bot |
| "Ayúdame tú no el robot" | Informal |

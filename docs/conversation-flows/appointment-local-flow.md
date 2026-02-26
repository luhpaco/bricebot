# Flujo de Cita en Local - Iteración 2

## Intents cubiertos (10)

`cita_iniciar` → `cita_local_iniciar` → `cita_local_equipo` → `cita_local_problema` → `cita_local_nombre` → `cita_local_telefono` → `cita_local_fecha` → `cita_local_hora` → `cita_local_confirmar_si` / `cita_local_confirmar_no`

## Diagrama del flujo completo

```
Usuario: "Quiero agendar una cita"
         [intent: cita_iniciar]
                  │
                  ▼
    Bot: ¿Local o domicilio?
    [ctx_out: cita_seleccion_tipo]
                  │
    Usuario: "Visitar local"
    [intent: cita_local_iniciar]
                  │
                  ▼
    Bot: ¿Qué tipo de equipo?
    [ctx_out: cita_local_en_curso]
                  │
    [intent: cita_local_equipo]
    param: @tipo_equipo
                  │
        ┌─────────┴─────────┐
        │  Válido           │  Inválido
        ▼                   ▼
  Bot: ¿Cuál es      Bot: Pide de nuevo
  el problema?       (prompt de Dialogflow)
  [ctx: lifespan+1]
        │
  [intent: cita_local_problema]
  param: @sys.any
        │
        ▼
  Bot: ¿Cuál es su nombre?
        │
  [intent: cita_local_nombre]
  param: @sys.person
        │
        ▼
  Bot: ¿Su número de teléfono?
        │
  [intent: cita_local_telefono]
  param: @sys.phone-number
        │
        ▼ Validación: validatePhone()
        │
  ┌─────┴─────┐
  │  Válido   │  Inválido
  ▼           ▼
Bot: Muestra  Bot: MESSAGES.INVALID_PHONE
fechas        (pide de nuevo)
disponibles
  │
[intent: cita_local_fecha]
param: @sys.date
  │
  ▼ Validación: validateDate() + MAX_BOOKING_DAYS
  │
  ├── Fecha inválida → Bot informa, ofrece alternativas
  │
  ▼ getAvailableDates() → Google Calendar
  │
Bot: Muestra horarios disponibles
  │
[intent: cita_local_hora]
param: @sys.time
  │
  ▼ Validación: validateTime() + isWithinBusinessHours()
  │
  ├── Horario no disponible → APPOINTMENT_SLOT_UNAVAILABLE
  │
  ▼
Bot: Resumen de la cita + ¿Confirma?
[ctx_out: cita_local_confirmar]
  │
  ├── [cita_local_confirmar_no]
  │   └── Bot: ¿Qué desea modificar?
  │       [ctx_out: cita_local_en_curso (restaurado)]
  │
  └── [cita_local_confirmar_si]
        │
        ▼
  Guardar en MongoDB (Appointment)
  creationStartTime → creationEndTime
  creationDurationMs = endTime - startTime
        │
        ▼ (no-fatal)
  calendarService.createEvent()
        │
        ▼ (no-fatal)
  whatsappService.sendAppointmentConfirmation()
        │
        ▼
  Bot: ✅ Su cita ha sido registrada
  Limpiar contextos cita_local_*
```

## Reglas de Negocio Aplicadas

| Regla | Validación | Mensaje |
| ----- | ---------- | ------- |
| Fecha máx. 7 días | `validateDate()` en validators.js | INVALID_DATE |
| Horario L-V 9-18, S 9-13 | `isWithinBusinessHours()` en availability.service.js | APPOINTMENT_OUT_OF_HOURS |
| Máx. 3 citas simultáneas | `isSlotFullyBooked()` en availability.service.js | APPOINTMENT_SLOT_UNAVAILABLE |
| Teléfono 9 dígitos | `validatePhone()` en validators.js | INVALID_PHONE |

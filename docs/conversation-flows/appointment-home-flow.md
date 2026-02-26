# Flujo de Cita a Domicilio - Iteración 2

## Intents cubiertos (10)

`cita_iniciar` → `cita_domicilio_iniciar` → `cita_domicilio_equipo` → `cita_domicilio_problema` → `cita_domicilio_nombre` → `cita_domicilio_telefono` → `cita_domicilio_direccion` → `cita_domicilio_fecha` → `cita_domicilio_rango_horario` → `cita_domicilio_confirmar_si` / `cita_domicilio_confirmar_no`

## Diferencias clave respecto al flujo local

| Aspecto | Cita en Local | Cita a Domicilio |
| ------- | ------------- | ---------------- |
| Datos extra | Ninguno | Dirección + referencia |
| Horario | Hora exacta (HH:MM) | Rango (mañana 8-12 / tarde 14-18) |
| Validación extra | Ninguna | Cobertura geográfica (Paita) |
| Contexto base | `cita_local_en_curso` | `cita_domicilio_en_curso` |

## Diagrama del flujo completo

```
Usuario: "A domicilio"
[intent: cita_domicilio_iniciar]
         │
         ▼
Bot: ¿Qué tipo de equipo?
[ctx_out: cita_domicilio_en_curso]
         │
[intent: cita_domicilio_equipo]
         │
         ▼
Bot: ¿Cuál es el problema?
         │
[intent: cita_domicilio_problema]
         │
         ▼
Bot: ¿Cuál es su nombre?
         │
[intent: cita_domicilio_nombre]
         │
         ▼
Bot: ¿Su número de teléfono?
         │
[intent: cita_domicilio_telefono]
         │
         ▼ validatePhone()
         │
Bot: ¿Cuál es su dirección completa?
         │
[intent: cita_domicilio_direccion]
param: direccion (@sys.any), referencia (@sys.any)
         │
         ▼ validateAddress() + validateCoverageArea()
         │
    ┌────┴──────────────────────────┐
    │  Dentro de Paita              │  Fuera de cobertura
    ▼                               ▼
Bot: Muestra fechas            Bot: Informa zona no cubierta
disponibles                    Ofrece cita en local como alternativa
    │
[intent: cita_domicilio_fecha]
    │
    ▼ validateDate() + MAX_BOOKING_DAYS
    │
Bot: ¿Mañana o tarde?
[rango horario, NO hora exacta]
    │
[intent: cita_domicilio_rango_horario]
param: @rango_horario (mañana / tarde)
    │
    ▼
Bot: Resumen de la cita + ¿Confirma?
[ctx_out: cita_domicilio_confirmar]
    │
    └── [cita_domicilio_confirmar_si]
          │
          ▼
    Guardar en MongoDB (Appointment)
    appointmentType: 'domicilio'
    address + addressReference
    scheduledTime: 'mañana' | 'tarde'
    creationDurationMs registrado
          │
          ▼
    calendarService.createEvent() (no-fatal)
          │
          ▼
    whatsappService.sendAppointmentConfirmation() (no-fatal)
          │
          ▼
    Bot: ✅ Cita a domicilio registrada
    Limpiar contextos cita_domicilio_*
```

## Cobertura Geográfica

La validación `validateCoverageArea()` en `validators.js` verifica que la dirección contenga alguna de estas palabras clave:

- paita
- marco jara
- san francisco
- pueblo nuevo
- villa marina
- colán
- la huaca

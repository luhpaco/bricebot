# Flujo de Cotizaciones - Iteración 3

## Intents cubiertos (15)

`cotizar_iniciar` → ramificación por tipo → selección → `cotizar_agregar_mas` → `cotizar_datos_cliente` → `cotizar_confirmar_si` / `cotizar_confirmar_no`

## Árbol de flujos por tipo de cotización

```
Usuario: "Quiero una cotización"
[intent: cotizar_iniciar]
         │
         ▼
Bot: ¿Producto o servicio?
[ctx_out: cotizacion_tipo]
         │
    ┌────┴──────────────────────┐
    │  Producto                 │  Servicio
    ▼                           ▼
[cotizar_producto_categoria]  [cotizar_servicio_tipo]
    │                           │
    ├── Computadora             ├── Mantenimiento
    │   └── [cotizar_computadora]   ├── Reparación
    │       │                  │   └── Instalación
    │   [cotizar_computadora_uso]
    │       │                      [cotizar_servicio_equipo]
    │   Bot: 2-3 opciones           │
    │   de BD                    [cotizar_servicio_seleccionar]
    │   [cotizar_computadora_seleccionar]
    │
    ├── Repuesto de Laptop
    │   └── [cotizar_repuesto_laptop]
    │       param: modelo, tipo_repuesto
    │       │
    │   Bot: Opciones de repuesto
    │   [cotizar_repuesto_seleccionar]
    │
    └── Otro producto
        └── [cotizar_producto_generico]
            Consulta por categoría
```

## Flujo de confirmación (común a todos los tipos)

```
Item seleccionado → agregado a cotizacion_items context
         │
         ▼
[intent: cotizar_agregar_mas]
         │
    ┌────┴─────────────────────┐
    │  Sí                      │  No
    ▼                           ▼
Vuelve a                 [cotizar_datos_cliente]
ramificación              Bot: ¿Nombre completo?
de tipo
                          Bot: ¿Teléfono/WhatsApp?
                               │
                          validatePhone()
                               │
                          Bot: Resumen de cotización
                          con IGV 18% calculado
                          [ctx_out: cotizacion_confirmar]
                               │
                          ┌────┴─────────────────┐
                          │ confirmar_si          │ confirmar_no
                          ▼                       ▼
                    Quote.create()          clearAllQuoteContexts()
                    creationDurationMs      MESSAGES.QUOTE_CANCELLED
                    registrado
                          │
                    whatsappService
                    .sendQuote() (simulado)
                          │
                    Bot: ✅ Cotización enviada
                    Válida por 7 días
```

## Campos registrados en MongoDB (Quote)

| Campo | Descripción |
| ----- | ----------- |
| `quoteNumber` | COT-YYYYMMDD-NNN (atómico con Counter) |
| `clientName` | Nombre del cliente |
| `phone` | Teléfono normalizado |
| `quoteType` | 'producto' o 'servicio' |
| `items[]` | Array con nombre, cantidad, precio unitario, subtotal |
| `subtotal` | Suma de items sin IGV |
| `igv` | 18% del subtotal |
| `totalAmount` | subtotal + igv |
| `validUntil` | 7 días desde creación |
| `creationStartTime` | Inicio del flujo (para métricas de tesis) |
| `creationEndTime` | Confirmación del usuario |
| `creationDurationMs` | Diferencia en ms (métrica principal) |

## Manejo de errores

| Error | Respuesta del bot |
| ----- | ----------------- |
| Sin productos en categoría | QUOTE_NO_PRODUCTS + ofrece otra categoría |
| Sin repuestos compatibles | QUOTE_NO_PARTS + ofrece cita presencial |
| Sin servicios disponibles | QUOTE_NO_SERVICES + ofrece otro equipo |
| Error al guardar cotización | QUOTE_ERROR + retry |

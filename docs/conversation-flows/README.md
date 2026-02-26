# Diagramas de Flujo de Conversación - CBRICENHO Chatbot

Diagramas de los flujos conversacionales implementados en las 3 iteraciones del proyecto de tesis.

## Archivos

| Archivo | Módulo | Iteración |
| ------- | ------ | --------- |
| [`faq-flow.md`](faq-flow.md) | FAQ y Escalamiento | 1 |
| [`appointment-local-flow.md`](appointment-local-flow.md) | Cita en Local | 2 |
| [`appointment-home-flow.md`](appointment-home-flow.md) | Cita a Domicilio | 2 |
| [`quote-flow.md`](quote-flow.md) | Cotizaciones | 3 |

## Convenciones

- Los **rectángulos** representan mensajes del bot
- Los **rombos** representan decisiones o puntos de validación
- Las **flechas continuas** son el flujo exitoso
- Las **flechas punteadas** son flujos alternativos (error, cancelación)
- Los **contextos de Dialogflow** se indican entre corchetes `[ctx_nombre]`

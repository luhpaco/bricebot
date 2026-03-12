# CBRICENHO Chatbot - Project Rules

## Project Context

- **Thesis**: "Desarrollo de un Agente Conversacional como Herramienta de Ayuda para el Proceso de Atencion al Cliente en la Empresa CBRICENHO E.I.R.L"
- **Author**: Bach. Luis Humberto Paz Cordova - Universidad Nacional de Piura
- **Methodology**: Extreme Programming (XP) - 3 iterations
- **Language**: All user-facing text in Spanish (Peru), formal "usted" form

## Tech Stack

- **Channel**: Facebook Messenger
- **NLP**: Google Dialogflow Essentials Edition
- **Backend**: Node.js (Fulfillment/Webhook)
- **Database**: MongoDB
- **External APIs**: Google Calendar API
- **Language**: JavaScript (ES6+)

## Project Structure

```
bricebot/
├── dialogflow/          # 45 intent JSON definitions + 6 custom entities
├── fulfillment/
│   ├── src/
│   │   ├── index.js     # Main webhook entry point (intentMap + override system)
│   │   ├── handlers/    # faq.handler.js, appointments.handler.js, quotes.handler.js
│   │   ├── services/    # metrics, calendar, availability, quotes
│   │   ├── models/      # Conversation, Appointment, Quote, Product, Service
│   │   ├── utils/       # validators, formatters, dateHelpers
│   │   └── config/      # constants.js, database.js, dialogflow.js
│   └── tests/
└── docs/
```

## Coding Standards

- ES6+ syntax (const/let, arrow functions, async/await)
- camelCase for variables/functions, PascalCase for classes, UPPER_SNAKE_CASE for constants
- Always use semicolons
- Max line length: 100 characters
- JSDoc comments for all exported functions
- No console.log in production code

## Intent Handler Pattern

Every handler follows this structure:
1. Record `startTime = Date.now()`
2. Validate required parameters
3. Execute business logic
4. Record metrics via `metricsService.recordInteraction()`
5. Respond to user via `agent.add()`
6. Catch errors and record failed metrics

## Chatbot Modules (45 intents total)

- **Module 1 - FAQ** (faq.handler.js): 8 FAQ intents + 2 cross-cutting (derivar_agente_humano, cancelar_proceso)
- **Module 2 - Appointments** (appointments.handler.js): 10 cita_local + 10 cita_domicilio intents
- **Module 3 - Quotes** (quotes.handler.js): 15 cotizar_ intents

## Intent Override Mechanism

The webhook implements a runtime override in `index.js`: when a user is inside an active multi-turn flow and types cancel/goodbye/escalation keywords that Dialogflow misroutes, the handler is replaced. The 10 FAQ/utility intents are marked as `NON_OVERRIDABLE`.

## Business Rules

- **Appointments**: Max 7 days ahead, Mon-Fri 8:00-18:00, Sat 8:00-13:00, max 3 simultaneous, home service only in Paita district
- **Quotes**: Products must be active in DB, 7-day validity, 18% IGV, min S/ 50.00
- **Fallback**: 3-level escalation (simple fallback -> options -> human agent)

## Naming Conventions

- **Intents**: snake_case, prefixed by category: `faq_`, `cita_`, `cotizar_`
- **Entities**: snake_case with @ prefix: `@tipo_equipo`, `@rango_horario`, `@uso_computadora`
- **Contexts**: descriptive: `cita_local_en_curso`, `cotizacion_pendiente`, lifespan typically 5-10

## Custom Entities (6)

`@tipo_equipo`, `@tipo_servicio`, `@rango_horario`, `@uso_computadora`, `@categoria_producto`, `@tipo_cotizacion`

## Git Commit Convention

```
feat: / fix: / docs: / style: / refactor: / test: / chore: / metrics:
Example: feat(appointments): add domicilio appointment flow
```

## Testing

- Framework: Jest
- Pattern: AAA (Arrange-Act-Assert)
- Mock Dialogflow agent with `createMockAgent()` from `tests/helpers/mockAgent.js`
- Coverage targets: handlers 90%, services 95%, utils 80%, models 70%
- Run tests before every commit: `npm run test:unit`

## Response Tone

- Friendly but professional, "usted" form
- Emojis sparingly: checkmark, calendar, pin, etc.
- Always offer next steps or alternatives
- Messages defined in `config/constants.js` under MESSAGES object

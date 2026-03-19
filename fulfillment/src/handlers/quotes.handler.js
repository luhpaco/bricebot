const quotesService = require('../services/quotes.service');
const {
	validatePhone,
	normalizePhone,
	parseSelectionIndex,
} = require('../utils/validators');
const {
	formatProductOptions,
	formatPartOptions,
	formatServiceOptions,
	formatQuoteSummary,
	formatQuoteConfirmation,
	formatProductCategories,
	formatComputerUseCases,
	formatPartTypes,
	formatQuoteTypes,
} = require('../utils/formatters');
const { MESSAGES, CONTEXT_NAMES, CONFIG } = require('../config/constants');

const ALL_QUOTE_CONTEXT_NAMES = CONTEXT_NAMES.QUOTE;
const ALL_APPOINTMENT_CONTEXT_NAMES = CONTEXT_NAMES.APPOINTMENT;

/**
 * Clears all active quote contexts to prevent state leakage
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
function clearAllQuoteContexts(agent) {
	ALL_QUOTE_CONTEXT_NAMES.forEach((name) => {
		agent.context.set({ name, lifespan: 0, parameters: {} });
	});
}

/**
 * Handles quote initiation - asks product or service
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteInitiate = (agent) => {
	// C4: Clear all active contexts (quotes and appointments) before starting fresh
	ALL_QUOTE_CONTEXT_NAMES.forEach((name) => {
		agent.context.set({ name, lifespan: 0, parameters: {} });
	});
	ALL_APPOINTMENT_CONTEXT_NAMES.forEach((name) => {
		agent.context.set({ name, lifespan: 0, parameters: {} });
	});

	agent.context.set({
		name: 'cotizacion_tipo',
		lifespan: 5,
		parameters: {
			startTime: Date.now(),
		},
	});

	agent.add(formatQuoteTypes());
};

/**
 * Handles product category selection
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteProductCategory = (agent) => {
	const context = agent.context.get('cotizacion_tipo');
	const startTime = context?.parameters?.startTime || Date.now();
	const items = context?.parameters?.items || [];

	// C1: Immediately clear cotizacion_tipo so the service branch cannot activate
	agent.context.set({ name: 'cotizacion_tipo', lifespan: 0, parameters: {} });

	agent.context.set({
		name: 'cotizacion_producto',
		lifespan: 8,
		parameters: {
			startTime,
			quoteType: items.length > 0 ? 'mixto' : 'producto',
			items,
		},
	});

	agent.add(formatProductCategories());
};

/**
 * Handles service type selection - clears tipo branch and asks for equipment type
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteServiceType = async (agent) => {
	const context = agent.context.get('cotizacion_tipo');
	const startTime = context?.parameters?.startTime || Date.now();
	const items = context?.parameters?.items || [];

	// C1: Immediately clear cotizacion_tipo so the product branch cannot activate
	agent.context.set({ name: 'cotizacion_tipo', lifespan: 0, parameters: {} });

	const equipmentType = agent.parameters['tipo_equipo'];

	if (!equipmentType) {
		agent.context.set({
			name: 'cotizacion_servicio',
			lifespan: 8,
			parameters: {
				startTime,
				quoteType: items.length > 0 ? 'mixto' : 'servicio',
				items,
			},
		});
		agent.add(MESSAGES.QUOTE_ASK_EQUIPMENT_TYPE);
		return;
	}

	// Equipment type was provided in the same message — show services directly
	const normalizedType = quotesService.normalizeEquipmentType(equipmentType);
	const allServices = await quotesService.getServices(normalizedType);
	const displayServices = allServices.slice(0, CONFIG.MAX_DISPLAY_OPTIONS);

	agent.context.set({
		name: 'cotizacion_servicio',
		lifespan: 8,
		parameters: {
			startTime,
			quoteType: items.length > 0 ? 'mixto' : 'servicio',
			equipmentType: normalizedType,
			items,
			serviceOptions: displayServices.map((s) => ({
				id: s._id.toString(),
				name: s.name,
				price: s.basePrice,
			})),
		},
	});

	agent.add(formatServiceOptions(displayServices, allServices.length));
};

/**
 * Handles equipment type response for service quotes.
 * Also acts as fallback selection handler when serviceOptions are already loaded
 * (detected by checking context state).
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteServiceEquipment = async (agent) => {
	const context = agent.context.get('cotizacion_servicio');
	if (!context) {
		agent.add('Lo siento, hubo un problema. ¿Podría indicarme qué tipo de cotización desea?');
		return;
	}

	// If services are already displayed, the user is selecting — delegate to select logic
	if (context.parameters.serviceOptions && context.parameters.serviceOptions.length > 0) {
		return handleQuoteServiceSelectInternal(agent, context);
	}

	const startTime = context.parameters.startTime;
	const items = context.parameters.items || [];

	const rawType = agent.parameters['tipo_equipo'] || agent.query;
	const normalizedType = quotesService.normalizeEquipmentType(rawType);

	const allServices = await quotesService.getServices(normalizedType);

	if (allServices.length === 0) {
		agent.context.set({
			name: 'cotizacion_servicio',
			lifespan: 8,
			parameters: { ...context.parameters },
		});
		agent.add(`${MESSAGES.QUOTE_NO_SERVICES}\n\n${MESSAGES.QUOTE_ASK_EQUIPMENT_TYPE}`);
		return;
	}

	const displayServices = allServices.slice(0, CONFIG.MAX_DISPLAY_OPTIONS);

	agent.context.set({
		name: 'cotizacion_servicio',
		lifespan: 8,
		parameters: {
			startTime,
			quoteType: 'servicio',
			equipmentType: normalizedType,
			items,
			serviceOptions: displayServices.map((s) => ({
				id: s._id.toString(),
				name: s.name,
				price: s.basePrice,
			})),
		},
	});

	agent.add(formatServiceOptions(displayServices, allServices.length));
};

/**
 * Shared internal logic for selecting a service from the displayed list
 * @param {Object} agent
 * @param {Object} context - cotizacion_servicio context
 */
function handleQuoteServiceSelectInternal(agent, context) {
	const startTime = context.parameters.startTime;
	const items = context.parameters.items || [];
	const options = context.parameters.serviceOptions || [];

	const selectionIndex = parseSelectionIndex(agent.query, options.length);

	if (selectionIndex === null) {
		agent.add(`Por favor, indíqueme el número de la opción que le interesa (1 a ${options.length}).`);
		return;
	}

	const selected = options[selectionIndex];
	const newItems = [
		...items,
		{
			productId: null,
			name: selected.name,
			quantity: 1,
			unitPrice: selected.price,
		},
	];

	// Clear the service sub-flow context so it doesn't carry stale data
	agent.context.set({ name: 'cotizacion_servicio', lifespan: 0, parameters: {} });

	agent.context.set({
		name: 'cotizacion_items',
		lifespan: 8,
		parameters: {
			startTime,
			quoteType: 'servicio',
			items: newItems,
		},
	});

	agent.add(`${MESSAGES.QUOTE_ITEM_ADDED} Se agregó *${selected.name}* (S/ ${selected.price.toFixed(2)}).\n\n${MESSAGES.QUOTE_ASK_ADD_MORE}`);
}

/**
 * Handles explicit service selection from the displayed list
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteServiceSelect = (agent) => {
	const context = agent.context.get('cotizacion_servicio');
	if (!context) {
		agent.add('Lo siento, hubo un problema. ¿Podría iniciar la cotización nuevamente?');
		return;
	}

	const options = context.parameters.serviceOptions || [];
	if (options.length === 0) {
		agent.add(MESSAGES.QUOTE_ASK_EQUIPMENT_TYPE);
		return;
	}

	handleQuoteServiceSelectInternal(agent, context);
};

/**
 * Handles computer quote — asks complete or parts, then use case.
 * Redirects to laptop part flow if Dialogflow misclassified the category.
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteComputer = async (agent) => {
	const context = agent.context.get('cotizacion_producto');
	if (!context) {
		agent.add('Lo siento, hubo un problema. ¿Podría indicarme qué tipo de producto desea cotizar?');
		return;
	}

	const startTime = context.parameters.startTime;
	const items = context.parameters.items || [];
	const category = agent.parameters['categoria_producto'];

	// Clear cotizacion_producto so category-level intents don't re-fire during the sub-flow
	agent.context.set({ name: 'cotizacion_producto', lifespan: 0, parameters: {} });

	if (category === 'repuesto_laptop') {
		agent.context.set({
			name: 'cotizar_repuesto_en_curso',
			lifespan: 8,
			parameters: {
				startTime,
				quoteType: 'producto',
				items,
			},
		});
		agent.add(MESSAGES.QUOTE_ASK_LAPTOP_MODEL);
		return;
	}

	agent.context.set({
		name: 'cotizar_computadora_en_curso',
		lifespan: 8,
		parameters: {
			startTime,
			quoteType: 'producto',
			items,
		},
	});

	agent.add(formatComputerUseCases());
};

/**
 * Handles computer use case selection — queries DB and shows options
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteComputerUse = async (agent) => {
	const context = agent.context.get('cotizar_computadora_en_curso');
	if (!context) {
		agent.add('Lo siento, hubo un problema. ¿Podría indicarme para qué uso necesita la computadora?');
		return;
	}

	const startTime = context.parameters.startTime;
	const items = context.parameters.items || [];

	const rawUseCase = agent.parameters['uso_computadora'] || agent.query;
	const useCase = quotesService.normalizeUseCase(rawUseCase);

	if (!useCase) {
		agent.add('No identifiqué el uso. ¿Podría indicarme si es para ofimática, diseño, programación, gaming o estudio?');
		return;
	}

	const allComputers = await quotesService.getComputersByUse(useCase);

	if (allComputers.length === 0) {
		agent.context.set({
			name: 'cotizar_computadora_en_curso',
			lifespan: 8,
			parameters: { startTime, quoteType: 'producto', items },
		});
		agent.add(MESSAGES.QUOTE_NO_PRODUCTS + '\n\n' + formatComputerUseCases());
		return;
	}

	const displayComputers = allComputers.slice(0, CONFIG.MAX_DISPLAY_OPTIONS);

	agent.context.set({
		name: 'cotizar_computadora_opciones',
		lifespan: 5,
		parameters: {
			startTime,
			quoteType: 'producto',
			items,
			useCase,
			computerOptions: displayComputers.map((c) => ({
				id: c._id.toString(),
				name: c.name,
				price: c.price,
				specs: c.specifications,
			})),
		},
	});

	agent.add(formatProductOptions(displayComputers, allComputers.length));
};

/**
 * Handles computer option selection
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteComputerSelect = (agent) => {
	const context = agent.context.get('cotizar_computadora_opciones');
	if (!context) {
		agent.add('Lo siento, hubo un problema con la selección. ¿Podría indicarme el uso de la computadora nuevamente?');
		return;
	}

	const startTime = context.parameters.startTime;
	const items = context.parameters.items || [];
	const options = context.parameters.computerOptions || [];

	const selectionIndex = parseSelectionIndex(agent.query, options.length);

	if (selectionIndex === null) {
		agent.add(`Por favor, indíqueme el número de la opción que le interesa (1 a ${options.length}).`);
		return;
	}

	const selected = options[selectionIndex];
	const newItems = [
		...items,
		{
			productId: selected.id,
			name: selected.name,
			quantity: 1,
			unitPrice: selected.price,
		},
	];

	// Clear sub-flow contexts so they don't carry stale data on "agregar más"
	agent.context.set({ name: 'cotizar_computadora_opciones', lifespan: 0, parameters: {} });
	agent.context.set({ name: 'cotizar_computadora_en_curso', lifespan: 0, parameters: {} });
	agent.context.set({ name: 'cotizacion_producto', lifespan: 0, parameters: {} });

	agent.context.set({
		name: 'cotizacion_items',
		lifespan: 8,
		parameters: {
			startTime,
			quoteType: 'producto',
			items: newItems,
		},
	});

	agent.add(`${MESSAGES.QUOTE_ITEM_ADDED} Se agregó *${selected.name}* (S/ ${selected.price.toFixed(2)}).\n\n${MESSAGES.QUOTE_ASK_ADD_MORE}`);
};

/**
 * Handles generic product categories (impresora, accesorios) that don't have
 * dedicated sub-flows. Queries DB by category and shows available products,
 * or redirects to contact if the catalog is empty for that category.
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteGenericProduct = async (agent) => {
	const context = agent.context.get('cotizacion_producto');
	if (!context) {
		agent.add('Lo siento, hubo un problema. ¿Podría indicarme qué tipo de producto le interesa?');
		return;
	}

	const startTime = context.parameters.startTime;
	const items = context.parameters.items || [];

	const categoryParam = agent.parameters['categoria_producto'];
	const queryNorm = agent.query
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');

	let dbCategory;
	let displayName;

	if (
		categoryParam === 'impresora' ||
		queryNorm.includes('impresora') ||
		queryNorm.trim() === '3'
	) {
		dbCategory = 'impresora';
		displayName = 'impresoras';
	} else if (
		categoryParam === 'accesorio' ||
		queryNorm.includes('accesorio') ||
		queryNorm.includes('componente') ||
		queryNorm.trim() === '4'
	) {
		dbCategory = 'accesorio';
		displayName = 'accesorios y componentes';
	} else {
		agent.context.set({
			name: 'cotizacion_producto',
			lifespan: 8,
			parameters: context.parameters,
		});
		agent.add(`No identifiqué la categoría. ¿Le interesa una impresora o accesorios y componentes?\n\n${formatProductCategories()}`);
		return;
	}

	const allProducts = await quotesService.getProductsByCategory(dbCategory);

	// Clear cotizacion_producto so cotizar_repuesto_laptop (which shares this
	// input context) cannot compete with cotizar_computadora_seleccionar on
	// the next numeric selection turn.
	agent.context.set({ name: 'cotizacion_producto', lifespan: 0, parameters: {} });

	if (allProducts.length === 0) {
		agent.context.set({
			name: 'cotizacion_producto',
			lifespan: 8,
			parameters: context.parameters,
		});
		const phone = process.env.COMPANY_PHONE || 'ver en "Contacto"';
		const facebook = process.env.COMPANY_FACEBOOK || 'ver en "Contacto"';
		agent.add(
			`Actualmente no tenemos ${displayName} disponibles en nuestro catálogo digital. Para consultar precios y disponibilidad, contáctenos:\n\n📞 Teléfono: ${phone}\n💬 Messenger: ${facebook}\n\n¿Le gustaría cotizar algo más de nuestro catálogo?\n\n${formatProductCategories()}`
		);
		return;
	}

	const displayProducts = allProducts.slice(0, CONFIG.MAX_DISPLAY_OPTIONS);

	// Reuse cotizar_computadora_opciones for the selection step
	agent.context.set({
		name: 'cotizar_computadora_opciones',
		lifespan: 5,
		parameters: {
			startTime,
			quoteType: 'producto',
			items,
			computerOptions: displayProducts.map((p) => ({
				id: p._id.toString(),
				name: p.name,
				price: p.price,
				specs: p.specifications,
			})),
		},
	});

	agent.add(formatProductOptions(displayProducts, allProducts.length));
};

/**
 * Handles laptop part quote flow with state-based logic.
 * Determines the current step by checking what data is already stored
 * in the cotizar_repuesto_en_curso context.
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteLaptopPart = async (agent) => {
	const repuestoContext = agent.context.get('cotizar_repuesto_en_curso');
	const productoContext = agent.context.get('cotizacion_producto');

	// Dialogflow sets cotizar_repuesto_en_curso as an output context on the intent,
	// so the context may exist even on first entry but without our custom startTime.
	const isHandlerInitialized = repuestoContext?.parameters?.startTime;

	// On first entry, read accumulated items from productoContext (set by handleQuoteAddMore
	// or handleQuoteProductCategory). On subsequent entries, read from our own context.
	const baseContext = isHandlerInitialized ? repuestoContext : productoContext;
	const startTime = baseContext?.parameters?.startTime || Date.now();
	const items = baseContext?.parameters?.items || [];

	if (!isHandlerInitialized) {
		agent.context.set({
			name: 'cotizar_repuesto_en_curso',
			lifespan: 8,
			parameters: { startTime, quoteType: 'producto', items },
		});
		agent.add(MESSAGES.QUOTE_ASK_LAPTOP_MODEL);
		return;
	}

	const storedModel = repuestoContext.parameters.laptopModel;

	if (!storedModel) {
		const rawModel = agent.parameters['modelo_equipo'] || agent.query;
		const isMenuSelection =
			/^\d{1,2}$/.test(rawModel.trim()) ||
			['la primera', 'la segunda', 'opción 1', 'opción 2', 'opcion 1', 'opcion 2'].includes(
				rawModel.trim().toLowerCase()
			);

		if (isMenuSelection || rawModel.trim().length < 3) {
			agent.context.set({
				name: 'cotizar_repuesto_en_curso',
				lifespan: 8,
				parameters: { startTime, quoteType: 'producto', items },
			});
			agent.add(MESSAGES.QUOTE_ASK_LAPTOP_MODEL);
			return;
		}

		agent.context.set({
			name: 'cotizar_repuesto_en_curso',
			lifespan: 8,
			parameters: {
				startTime,
				quoteType: 'producto',
				items,
				laptopModel: rawModel,
			},
		});
		agent.add(`Entendido, modelo *${rawModel}*.\n\n${formatPartTypes()}`);
		return;
	}

	const rawPartType = agent.parameters['tipo_repuesto'] || agent.query;
	const partType = quotesService.normalizePartType(rawPartType);

	if (!partType) {
		agent.context.set({
			name: 'cotizar_repuesto_en_curso',
			lifespan: 8,
			parameters: repuestoContext.parameters,
		});
		agent.add(`No identifiqué el tipo de repuesto. ¿Podría elegir una opción?\n\n${formatPartTypes()}`);
		return;
	}

	const allParts = await quotesService.getLaptopParts(storedModel, partType);
	const installationPrice = await quotesService.getInstallationPrice(partType);

	if (allParts.length === 0) {
		agent.context.set({
			name: 'cotizar_repuesto_en_curso',
			lifespan: 8,
			parameters: { startTime, quoteType: 'producto', items, laptopModel: storedModel },
		});
		agent.add(MESSAGES.QUOTE_NO_PARTS);
		return;
	}

	const displayParts = allParts.slice(0, CONFIG.MAX_DISPLAY_OPTIONS);

	agent.context.set({
		name: 'cotizar_repuesto_en_curso',
		lifespan: 8,
		parameters: {
			startTime,
			quoteType: 'producto',
			items,
			laptopModel: storedModel,
			partType,
			installationPrice,
			partOptions: displayParts.map((p) => ({
				id: p._id.toString(),
				name: p.name,
				price: p.price,
			})),
		},
	});

	agent.add(formatPartOptions(displayParts, installationPrice, allParts.length));
};

/**
 * Handles laptop part selection
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuotePartSelect = async (agent) => {
	const context = agent.context.get('cotizar_repuesto_en_curso');
	if (!context) {
		agent.add('Lo siento, hubo un problema. ¿Podría indicarme el modelo de laptop nuevamente?');
		return;
	}

	const options = context.parameters.partOptions || [];

	// If part options haven't been loaded yet, the user is still in the
	// multi-step flow (model → part type → parts list). Delegate to the
	// state-machine handler which knows how to advance each step.
	if (options.length === 0) {
		return handleQuoteLaptopPart(agent);
	}

	const startTime = context.parameters.startTime;
	const items = context.parameters.items || [];
	const installationPrice = context.parameters.installationPrice || 0;

	const userQuery = agent.query.toLowerCase();
	const wantsInstallation =
		userQuery.includes('instalacion') ||
		userQuery.includes('instalación') ||
		userQuery.includes('con instalacion') ||
		userQuery.includes('con instalación');

	const selectionIndex = parseSelectionIndex(agent.query, options.length);

	if (selectionIndex === null && !wantsInstallation) {
		agent.add(`Por favor, indíqueme el número de la opción (1 a ${options.length}).`);
		return;
	}

	const selected = selectionIndex !== null ? options[selectionIndex] : options[0];
	const newItems = [...items];

	newItems.push({
		productId: selected.id,
		name: selected.name,
		quantity: 1,
		unitPrice: selected.price,
	});

	if (wantsInstallation && installationPrice > 0) {
		newItems.push({
			productId: null,
			name: 'Servicio de instalación',
			quantity: 1,
			unitPrice: installationPrice,
		});
	}

	// Clear sub-flow contexts so they don't carry stale data on "agregar más"
	agent.context.set({ name: 'cotizar_repuesto_en_curso', lifespan: 0, parameters: {} });
	agent.context.set({ name: 'cotizacion_producto', lifespan: 0, parameters: {} });

	agent.context.set({
		name: 'cotizacion_items',
		lifespan: 8,
		parameters: {
			startTime,
			quoteType: 'producto',
			items: newItems,
		},
	});

	let message = `${MESSAGES.QUOTE_ITEM_ADDED} Se agregó *${selected.name}* (S/ ${selected.price.toFixed(2)}).`;
	if (wantsInstallation && installationPrice > 0) {
		message += `\nTambién se incluyó el servicio de instalación (S/ ${installationPrice.toFixed(2)}).`;
	}
	message += `\n\n${MESSAGES.QUOTE_ASK_ADD_MORE}`;

	agent.add(message);
};

/**
 * Handles adding more items to quote — returns to product category menu
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteAddMore = (agent) => {
	const context = agent.context.get('cotizacion_items');

	// If we're collecting client data (name/phone), Dialogflow misclassified
	// the user's input as "add more". Re-ask for the pending data instead.
	if (context?.parameters?.awaitingClientData) {
		agent.context.set({
			name: 'cotizacion_items',
			lifespan: 8,
			parameters: context.parameters,
		});
		// Clear Dialogflow-set affectedContext to prevent product intents from firing
		agent.context.set({ name: 'cotizacion_producto', lifespan: 0, parameters: {} });
		if (!context.parameters.clientName) {
			agent.add('Para continuar necesito su nombre completo. ¿Me lo podría indicar?');
		} else {
			agent.add('Para continuar necesito su número de teléfono. ¿Me lo podría indicar?');
		}
		return;
	}

	const startTime = context?.parameters?.startTime || Date.now();
	const items = context?.parameters?.items || [];
	const quoteType = context?.parameters?.quoteType || 'producto';

	// Clear all sub-flow contexts so they start fresh for the next item
	agent.context.set({ name: 'cotizar_computadora_en_curso', lifespan: 0, parameters: {} });
	agent.context.set({ name: 'cotizar_computadora_opciones', lifespan: 0, parameters: {} });
	agent.context.set({ name: 'cotizar_repuesto_en_curso', lifespan: 0, parameters: {} });
	agent.context.set({ name: 'cotizacion_servicio', lifespan: 0, parameters: {} });
	// Clear Dialogflow-set affectedContext to prevent product intents competing with datos_cliente
	agent.context.set({ name: 'cotizacion_producto', lifespan: 0, parameters: {} });

	// Set cotizacion_tipo so the user can pick products or services
	agent.context.set({
		name: 'cotizacion_tipo',
		lifespan: 5,
		parameters: { startTime, quoteType, items },
	});

	// Keep cotizacion_items alive so cotizar_datos_cliente can fire for option 3
	agent.context.set({
		name: 'cotizacion_items',
		lifespan: 5,
		parameters: { startTime, quoteType, items },
	});

	agent.add(`¿Qué desea agregar a su cotización?\n\n1️⃣ Productos (computadoras, repuestos, impresoras, etc.)\n2️⃣ Servicios (mantenimiento, reparaciones, instalaciones)\n3️⃣ Ya no, proceder con mis datos`);
};

/**
 * Handles client data collection (name + phone)
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteClientData = async (agent) => {
	const context =
		agent.context.get('cotizacion_items') ||
		agent.context.get('cotizacion_servicio');

	if (!context) {
		agent.add('Lo siento, hubo un problema. ¿Podría indicarme qué desea cotizar?');
		return;
	}

	const startTime = context.parameters.startTime;
	const items = context.parameters.items || [];
	const quoteType = context.parameters.quoteType || 'producto';

	const clientName = agent.parameters['nombre_cliente'];
	const rawPhone = agent.parameters['telefono'];

	if (!clientName) {
		agent.context.set({
			name: 'cotizacion_items',
			lifespan: 8,
			parameters: { startTime, quoteType, items, awaitingClientData: true },
		});
		agent.add(MESSAGES.QUOTE_ASK_CLIENT_NAME);
		return;
	}

	const parsedName =
		(clientName && typeof clientName === 'object' ? clientName.name : clientName) ||
		agent.query;

	if (!rawPhone) {
		agent.context.set({
			name: 'cotizacion_items',
			lifespan: 8,
			parameters: { startTime, quoteType, items, clientName: parsedName, awaitingClientData: true },
		});
		agent.add(MESSAGES.QUOTE_ASK_CLIENT_PHONE);
		return;
	}

	const phoneValid = validatePhone(rawPhone);
	if (!phoneValid) {
		agent.context.set({
			name: 'cotizacion_items',
			lifespan: 8,
			parameters: { startTime, quoteType, items, clientName: parsedName, awaitingClientData: true },
		});
		agent.add(MESSAGES.INVALID_PHONE);
		return;
	}

	const phone = normalizePhone(rawPhone);
	const totals = quotesService.calculateTotals(items);

	// Clear cotizacion_items so only cotizacion_confirmar is active,
	// preventing Dialogflow from ambiguously matching cotizar_agregar_mas
	// when the user says "Sí" to confirm
	agent.context.set({ name: 'cotizacion_items', lifespan: 0, parameters: {} });

	agent.context.set({
		name: 'cotizacion_confirmar',
		lifespan: 3,
		parameters: {
			startTime,
			quoteType,
			items,
			clientName: parsedName,
			phone,
			...totals,
		},
	});

	agent.add(formatQuoteSummary({ clientName: parsedName, phone, items, ...totals }));
};

/**
 * Handles quote confirmation — creates quote in DB and clears all contexts
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteConfirmYes = async (agent) => {
	const context = agent.context.get('cotizacion_confirmar');
	if (!context) {
		agent.add('Lo siento, no encontré la cotización pendiente. ¿Podría iniciar el proceso nuevamente?');
		return;
	}

	try {
		const quote = await quotesService.createQuote({
			clientName: context.parameters.clientName,
			phone: context.parameters.phone,
			quoteType: context.parameters.quoteType,
			items: context.parameters.items,
			creationStartTime: new Date(context.parameters.startTime),
		});

		agent.add(formatQuoteConfirmation(quote));

		// C6: Clear ALL quote contexts so future flows start clean
		clearAllQuoteContexts(agent);
	} catch (error) {
		console.error('[QuotesHandler] Error creating quote:', error);
		agent.add(MESSAGES.QUOTE_ERROR);
	}
};

/**
 * Handles quote cancellation/modification
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleQuoteConfirmNo = (agent) => {
	const context = agent.context.get('cotizacion_confirmar');
	if (!context) {
		agent.add('Lo siento, no encontré la cotización pendiente. ¿Le gustaría iniciar una nueva?');
		return;
	}

	// Clear stale confirmation context to prevent accidental re-confirmation
	agent.context.set({ name: 'cotizacion_confirmar', lifespan: 0, parameters: {} });

	agent.context.set({
		name: 'cotizacion_items',
		lifespan: 8,
		parameters: {
			startTime: context.parameters.startTime,
			quoteType: context.parameters.quoteType,
			items: context.parameters.items,
		},
	});

	agent.add('Sin problema. ¿Qué le gustaría hacer?\n\n1️⃣ Agregar más productos o servicios\n2️⃣ Empezar una cotización nueva desde cero');
};

module.exports = {
	handleQuoteInitiate,
	handleQuoteProductCategory,
	handleQuoteServiceType,
	handleQuoteServiceEquipment,
	handleQuoteServiceSelect,
	handleQuoteComputer,
	handleQuoteComputerUse,
	handleQuoteComputerSelect,
	handleQuoteGenericProduct,
	handleQuoteLaptopPart,
	handleQuotePartSelect,
	handleQuoteAddMore,
	handleQuoteClientData,
	handleQuoteConfirmYes,
	handleQuoteConfirmNo,
};

const Product = require('../models/Product');
const Service = require('../models/Service');
const Quote = require('../models/Quote');
const { CONFIG } = require('../config/constants');

const IGV_RATE = CONFIG.IGV_PERCENTAGE / 100;
const QUOTE_VALIDITY_DAYS = CONFIG.QUOTE_VALIDITY_DAYS;

class QuotesService {
	/**
	 * Finds computers matching a specific use case
	 * @param {string} useCase - Use case identifier (ofimatica, diseno, gaming, programacion, estudio)
	 * @returns {Promise<Array>} Matching products
	 */
	async getComputersByUse(useCase) {
		try {
			const products = await Product.find({
				category: 'computadora',
				isActive: true,
				'specifications.useCase': useCase,
				stock: { $gt: 0 },
			}).sort({ price: 1 });

			console.log(`[QuotesService] Found ${products.length} computers for use case: ${useCase}`);
			return products;
		} catch (error) {
			console.error('[QuotesService] Error finding computers:', error);
			return [];
		}
	}

	/**
	 * Finds laptop parts matching a model and part type
	 * @param {string} laptopModel - Laptop model or brand
	 * @param {string} partType - Type of part (pantalla, teclado, bateria, disco, memoria, cargador)
	 * @returns {Promise<Array>} Matching parts
	 */
	async getLaptopParts(laptopModel, partType) {
		try {
			const normalizedModel = laptopModel.trim();

			const query = {
				category: 'componente',
				isActive: true,
				'specifications.type': partType,
				stock: { $gt: 0 },
			};

			let parts = await Product.find(query).sort({ price: 1 });

			if (normalizedModel) {
				const modelLower = normalizedModel.toLowerCase();
				const filtered = parts.filter((part) => {
					const compatibleWith = part.specifications?.compatibleWith || [];
					return compatibleWith.some(
						(compat) =>
							modelLower.includes(compat.toLowerCase()) || compat.toLowerCase().includes(modelLower)
					);
				});

				if (filtered.length > 0) {
					parts = filtered;
				}
			}

			console.log(`[QuotesService] Found ${parts.length} parts for ${laptopModel} (${partType})`);
			return parts;
		} catch (error) {
			console.error('[QuotesService] Error finding laptop parts:', error);
			return [];
		}
	}

	/**
	 * Normalizes equipment type string to match the values used in the DB seed.
	 * Handles case variations and synonyms since Dialogflow may return different forms.
	 * Seed values: 'PC' (uppercase), 'laptop', 'impresora', 'camara' (lowercase).
	 * @param {string} input - Raw equipment type string
	 * @returns {string} Normalized equipment type
	 */
	normalizeEquipmentType(input) {
		if (!input) return 'PC';

		const trimmed = input.trim();

		const numberMap = {
			1: 'PC',
			2: 'laptop',
			3: 'impresora',
			4: 'camara',
		};
		if (numberMap[trimmed]) return numberMap[trimmed];

		const normalized = trimmed
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');

		if (
			['pc', 'computadora', 'desktop', 'escritorio', 'equipo de escritorio'].includes(normalized)
		) {
			return 'PC';
		}
		if (['laptop', 'notebook', 'portatil'].includes(normalized)) {
			return 'laptop';
		}
		if (['impresora', 'printer', 'multifuncional'].includes(normalized)) {
			return 'impresora';
		}
		if (['camara', 'camara de seguridad', 'camaras'].includes(normalized)) {
			return 'camara';
		}

		return input;
	}

	/**
	 * Finds products by category
	 * @param {string} category - Product category (impresora, accesorio, etc.)
	 * @returns {Promise<Array>} Matching products
	 */
	async getProductsByCategory(category) {
		try {
			const products = await Product.find({
				category,
				isActive: true,
				stock: { $gt: 0 },
			}).sort({ price: 1 });

			console.log(`[QuotesService] Found ${products.length} products for category: ${category}`);
			return products;
		} catch (error) {
			console.error('[QuotesService] Error finding products by category:', error);
			return [];
		}
	}

	/**
	 * Finds services matching equipment type and optionally a category
	 * @param {string} equipmentType - Equipment type (PC, laptop, impresora, camara)
	 * @param {string} [category] - Service category filter
	 * @returns {Promise<Array>} Matching services
	 */
	async getServices(equipmentType, category) {
		// A3: Normalize to match seed data casing ('PC' uppercase, rest lowercase)
		const normalizedType = this.normalizeEquipmentType(equipmentType);

		try {
			const query = {
				isActive: true,
				equipmentTypes: normalizedType,
			};

			if (category) {
				query.category = category;
			}

			const services = await Service.find(query).sort({ basePrice: 1 });

			console.log(`[QuotesService] Found ${services.length} services for ${normalizedType}`);
			return services;
		} catch (error) {
			console.error('[QuotesService] Error finding services:', error);
			return [];
		}
	}

	/**
	 * Gets the installation service price for a part type
	 * @param {string} partType - Part type (pantalla, teclado, disco, memoria)
	 * @returns {Promise<number>} Installation price
	 */
	async getInstallationPrice(partType) {
		const serviceMap = {
			pantalla: 'SRV-REP-001',
			teclado: 'SRV-REP-002',
			disco: 'SRV-REP-010',
			memoria: 'SRV-REP-011',
			bateria: 'SRV-REP-006',
		};

		const serviceCode = serviceMap[partType];
		if (!serviceCode) return 0;

		try {
			const service = await Service.findOne({ code: serviceCode, isActive: true });
			return service ? service.basePrice : 0;
		} catch (error) {
			console.error('[QuotesService] Error getting installation price:', error);
			return 0;
		}
	}

	/**
	 * Calculates quote totals from items
	 * @param {Array} items - Array of { name, quantity, unitPrice }
	 * @returns {Object} { subtotal, igv, totalAmount }
	 */
	calculateTotals(items) {
		const subtotal = items.reduce((sum, item) => {
			return sum + item.unitPrice * item.quantity;
		}, 0);

		const igv = Math.round(subtotal * IGV_RATE * 100) / 100;
		const totalAmount = Math.round((subtotal + igv) * 100) / 100;

		return {
			subtotal: Math.round(subtotal * 100) / 100,
			igv,
			totalAmount,
		};
	}

	/**
	 * Creates and persists a quote in MongoDB
	 * @param {Object} quoteData - Quote data
	 * @returns {Promise<Object>} Saved quote document
	 */
	async createQuote(quoteData) {
		try {
			const quoteNumber = await Quote.generateQuoteNumber();

			const validUntil = new Date();
			validUntil.setDate(validUntil.getDate() + QUOTE_VALIDITY_DAYS);

			const items = quoteData.items.map((item) => ({
				productId: item.productId || null,
				name: item.name,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				subtotal: item.unitPrice * item.quantity,
			}));

			const totals = this.calculateTotals(items);

			const quote = new Quote({
				quoteNumber,
				clientName: quoteData.clientName,
				phone: quoteData.phone,
				email: quoteData.email || null,
				clientType: quoteData.clientType || 'natural',
				ruc: quoteData.ruc || null,
				companyName: quoteData.companyName || null,
				quoteType: quoteData.quoteType,
				items,
				subtotal: totals.subtotal,
				igv: totals.igv,
				totalAmount: totals.totalAmount,
				validUntil,
				status: 'generada',
				creationStartTime: quoteData.creationStartTime,
				creationEndTime: new Date(),
				creationDurationMs: Date.now() - quoteData.creationStartTime.getTime(),
				createdByChatbot: true,
			});

			await quote.save();

			console.log(`[QuotesService] Quote created: ${quoteNumber} for ${quoteData.clientName}`);
			return quote;
		} catch (error) {
			console.error('[QuotesService] Error creating quote:', error);
			throw error;
		}
	}

	/**
	 * Normalizes a part type string from user input
	 * @param {string} input - Raw user input
	 * @returns {string} Normalized part type
	 */
	normalizePartType(input) {
		if (!input) return '';

		const trimmed = input.trim();

		const numberMap = {
			1: 'pantalla',
			2: 'teclado',
			3: 'bateria',
			4: 'disco',
			5: 'memoria',
			6: 'cargador',
		};
		if (numberMap[trimmed]) return numberMap[trimmed];

		const normalized = trimmed
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');

		const typeMap = {
			pantalla: 'pantalla',
			display: 'pantalla',
			lcd: 'pantalla',
			led: 'pantalla',
			screen: 'pantalla',
			teclado: 'teclado',
			keyboard: 'teclado',
			tecla: 'teclado',
			bateria: 'bateria',
			pila: 'bateria',
			battery: 'bateria',
			disco: 'disco',
			ssd: 'disco',
			hdd: 'disco',
			almacenamiento: 'disco',
			memoria: 'memoria',
			ram: 'memoria',
			cargador: 'cargador',
			adaptador: 'cargador',
			charger: 'cargador',
		};

		for (const [keyword, type] of Object.entries(typeMap)) {
			if (normalized.includes(keyword)) {
				return type;
			}
		}

		return '';
	}

	/**
	 * Normalizes a use case string from user input
	 * @param {string} input - Raw user input
	 * @returns {string} Normalized use case
	 */
	normalizeUseCase(input) {
		if (!input) return '';

		const trimmed = input.trim();

		const numberMap = {
			1: 'ofimatica',
			2: 'diseno',
			3: 'programacion',
			4: 'gaming',
			5: 'estudio',
		};
		if (numberMap[trimmed]) return numberMap[trimmed];

		const normalized = trimmed
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');

		const useCaseMap = {
			ofimatica: 'ofimatica',
			oficina: 'ofimatica',
			word: 'ofimatica',
			excel: 'ofimatica',
			documentos: 'ofimatica',
			basico: 'ofimatica',
			diseno: 'diseno',
			photoshop: 'diseno',
			illustrator: 'diseno',
			edicion: 'diseno',
			grafico: 'diseno',
			programacion: 'programacion',
			desarrollo: 'programacion',
			programar: 'programacion',
			codigo: 'programacion',
			software: 'programacion',
			gaming: 'gaming',
			juegos: 'gaming',
			gamer: 'gaming',
			videojuegos: 'gaming',
			jugar: 'gaming',
			estudio: 'estudio',
			estudiante: 'estudio',
			tareas: 'estudio',
			clases: 'estudio',
			universidad: 'estudio',
			colegio: 'estudio',
		};

		for (const [keyword, useCase] of Object.entries(useCaseMap)) {
			if (normalized.includes(keyword)) {
				return useCase;
			}
		}

		return '';
	}
}

const quotesService = new QuotesService();

module.exports = quotesService;

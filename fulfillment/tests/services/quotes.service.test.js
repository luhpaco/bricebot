require('../setup');
const quotesService = require('../../src/services/quotes.service');
const Product = require('../../src/models/Product');
const Service = require('../../src/models/Service');
const Quote = require('../../src/models/Quote');

describe('quotesService', () => {
	beforeEach(async () => {
		await Product.deleteMany({});
		await Service.deleteMany({});
		await Quote.deleteMany({});
	});

	// -------------------------------------------------------------------------
	// normalizeEquipmentType — pure method
	// -------------------------------------------------------------------------
	describe('normalizeEquipmentType', () => {
		it('should return PC for null/undefined input', () => {
			expect(quotesService.normalizeEquipmentType(null)).toBe('PC');
			expect(quotesService.normalizeEquipmentType(undefined)).toBe('PC');
			expect(quotesService.normalizeEquipmentType('')).toBe('PC');
		});

		it('should map numeric string "1" to PC', () => {
			expect(quotesService.normalizeEquipmentType('1')).toBe('PC');
		});

		it('should map numeric string "2" to laptop', () => {
			expect(quotesService.normalizeEquipmentType('2')).toBe('laptop');
		});

		it('should map numeric string "3" to impresora', () => {
			expect(quotesService.normalizeEquipmentType('3')).toBe('impresora');
		});

		it('should map numeric string "4" to camara', () => {
			expect(quotesService.normalizeEquipmentType('4')).toBe('camara');
		});

		it('should normalize PC synonyms to PC', () => {
			expect(quotesService.normalizeEquipmentType('PC')).toBe('PC');
			expect(quotesService.normalizeEquipmentType('computadora')).toBe('PC');
			expect(quotesService.normalizeEquipmentType('desktop')).toBe('PC');
			expect(quotesService.normalizeEquipmentType('escritorio')).toBe('PC');
			expect(quotesService.normalizeEquipmentType('equipo de escritorio')).toBe('PC');
		});

		it('should normalize laptop synonyms', () => {
			expect(quotesService.normalizeEquipmentType('laptop')).toBe('laptop');
			expect(quotesService.normalizeEquipmentType('notebook')).toBe('laptop');
			expect(quotesService.normalizeEquipmentType('portatil')).toBe('laptop');
			expect(quotesService.normalizeEquipmentType('portátil')).toBe('laptop');
		});

		it('should normalize impresora synonyms', () => {
			expect(quotesService.normalizeEquipmentType('impresora')).toBe('impresora');
			expect(quotesService.normalizeEquipmentType('printer')).toBe('impresora');
			expect(quotesService.normalizeEquipmentType('multifuncional')).toBe('impresora');
		});

		it('should normalize camara synonyms', () => {
			expect(quotesService.normalizeEquipmentType('camara')).toBe('camara');
			expect(quotesService.normalizeEquipmentType('cámara')).toBe('camara');
			expect(quotesService.normalizeEquipmentType('camara de seguridad')).toBe('camara');
			expect(quotesService.normalizeEquipmentType('camaras')).toBe('camara');
		});

		it('should return the original input for unknown values', () => {
			expect(quotesService.normalizeEquipmentType('drone')).toBe('drone');
		});
	});

	// -------------------------------------------------------------------------
	// normalizePartType — pure method
	// -------------------------------------------------------------------------
	describe('normalizePartType', () => {
		it('should return empty string for null/undefined/empty input', () => {
			expect(quotesService.normalizePartType(null)).toBe('');
			expect(quotesService.normalizePartType(undefined)).toBe('');
			expect(quotesService.normalizePartType('')).toBe('');
		});

		it('should map numeric strings correctly', () => {
			expect(quotesService.normalizePartType('1')).toBe('pantalla');
			expect(quotesService.normalizePartType('2')).toBe('teclado');
			expect(quotesService.normalizePartType('3')).toBe('bateria');
			expect(quotesService.normalizePartType('4')).toBe('disco');
			expect(quotesService.normalizePartType('5')).toBe('memoria');
			expect(quotesService.normalizePartType('6')).toBe('cargador');
		});

		it('should normalize pantalla synonyms', () => {
			expect(quotesService.normalizePartType('pantalla')).toBe('pantalla');
			expect(quotesService.normalizePartType('display')).toBe('pantalla');
			expect(quotesService.normalizePartType('lcd')).toBe('pantalla');
			expect(quotesService.normalizePartType('led')).toBe('pantalla');
			expect(quotesService.normalizePartType('screen')).toBe('pantalla');
		});

		it('should normalize teclado synonyms', () => {
			expect(quotesService.normalizePartType('teclado')).toBe('teclado');
			expect(quotesService.normalizePartType('keyboard')).toBe('teclado');
			expect(quotesService.normalizePartType('tecla')).toBe('teclado');
		});

		it('should normalize bateria synonyms', () => {
			expect(quotesService.normalizePartType('bateria')).toBe('bateria');
			expect(quotesService.normalizePartType('batería')).toBe('bateria');
			expect(quotesService.normalizePartType('pila')).toBe('bateria');
			expect(quotesService.normalizePartType('battery')).toBe('bateria');
		});

		it('should normalize disco synonyms', () => {
			expect(quotesService.normalizePartType('disco')).toBe('disco');
			expect(quotesService.normalizePartType('ssd')).toBe('disco');
			expect(quotesService.normalizePartType('hdd')).toBe('disco');
			expect(quotesService.normalizePartType('almacenamiento')).toBe('disco');
		});

		it('should normalize memoria synonyms', () => {
			expect(quotesService.normalizePartType('memoria')).toBe('memoria');
			expect(quotesService.normalizePartType('ram')).toBe('memoria');
		});

		it('should normalize cargador synonyms', () => {
			expect(quotesService.normalizePartType('cargador')).toBe('cargador');
			expect(quotesService.normalizePartType('adaptador')).toBe('cargador');
			expect(quotesService.normalizePartType('charger')).toBe('cargador');
		});

		it('should return empty string for unknown input', () => {
			expect(quotesService.normalizePartType('desconocido')).toBe('');
		});
	});

	// -------------------------------------------------------------------------
	// normalizeUseCase — pure method
	// -------------------------------------------------------------------------
	describe('normalizeUseCase', () => {
		it('should return empty string for null/undefined/empty input', () => {
			expect(quotesService.normalizeUseCase(null)).toBe('');
			expect(quotesService.normalizeUseCase(undefined)).toBe('');
			expect(quotesService.normalizeUseCase('')).toBe('');
		});

		it('should map numeric strings correctly', () => {
			expect(quotesService.normalizeUseCase('1')).toBe('ofimatica');
			expect(quotesService.normalizeUseCase('2')).toBe('diseno');
			expect(quotesService.normalizeUseCase('3')).toBe('programacion');
			expect(quotesService.normalizeUseCase('4')).toBe('gaming');
			expect(quotesService.normalizeUseCase('5')).toBe('estudio');
		});

		it('should normalize ofimatica synonyms', () => {
			expect(quotesService.normalizeUseCase('ofimatica')).toBe('ofimatica');
			expect(quotesService.normalizeUseCase('oficina')).toBe('ofimatica');
			expect(quotesService.normalizeUseCase('word')).toBe('ofimatica');
			expect(quotesService.normalizeUseCase('excel')).toBe('ofimatica');
			expect(quotesService.normalizeUseCase('documentos')).toBe('ofimatica');
			expect(quotesService.normalizeUseCase('basico')).toBe('ofimatica');
		});

		it('should normalize diseno synonyms', () => {
			expect(quotesService.normalizeUseCase('diseno')).toBe('diseno');
			expect(quotesService.normalizeUseCase('diseño')).toBe('diseno');
			expect(quotesService.normalizeUseCase('photoshop')).toBe('diseno');
			expect(quotesService.normalizeUseCase('illustrator')).toBe('diseno');
			expect(quotesService.normalizeUseCase('edicion')).toBe('diseno');
			expect(quotesService.normalizeUseCase('grafico')).toBe('diseno');
		});

		it('should normalize programacion synonyms', () => {
			expect(quotesService.normalizeUseCase('programacion')).toBe('programacion');
			expect(quotesService.normalizeUseCase('desarrollo')).toBe('programacion');
			expect(quotesService.normalizeUseCase('programar')).toBe('programacion');
			expect(quotesService.normalizeUseCase('codigo')).toBe('programacion');
			expect(quotesService.normalizeUseCase('software')).toBe('programacion');
		});

		it('should normalize gaming synonyms', () => {
			expect(quotesService.normalizeUseCase('gaming')).toBe('gaming');
			expect(quotesService.normalizeUseCase('juegos')).toBe('gaming');
			expect(quotesService.normalizeUseCase('gamer')).toBe('gaming');
			expect(quotesService.normalizeUseCase('videojuegos')).toBe('gaming');
			expect(quotesService.normalizeUseCase('jugar')).toBe('gaming');
		});

		it('should normalize estudio synonyms', () => {
			expect(quotesService.normalizeUseCase('estudio')).toBe('estudio');
			expect(quotesService.normalizeUseCase('estudiante')).toBe('estudio');
			expect(quotesService.normalizeUseCase('tareas')).toBe('estudio');
			expect(quotesService.normalizeUseCase('clases')).toBe('estudio');
			expect(quotesService.normalizeUseCase('universidad')).toBe('estudio');
			expect(quotesService.normalizeUseCase('colegio')).toBe('estudio');
		});

		it('should return empty string for unknown input', () => {
			expect(quotesService.normalizeUseCase('desconocido_xyz')).toBe('');
		});
	});

	// -------------------------------------------------------------------------
	// getComputersByUse
	// -------------------------------------------------------------------------
	describe('getComputersByUse', () => {
		it('should return products matching the use case', async () => {
			await Product.create([
				{
					sku: 'PC-001',
					category: 'computadora',
					name: 'PC Básica',
					brand: 'HP',
					model: 'Slimline',
					description: 'Para ofimática',
					specifications: { useCase: 'ofimatica' },
					price: 1500,
					stock: 5,
					isActive: true,
				},
				{
					sku: 'PC-002',
					category: 'computadora',
					name: 'PC Gamer',
					brand: 'ASUS',
					model: 'ROG',
					description: 'Para gaming',
					specifications: { useCase: 'gaming' },
					price: 4500,
					stock: 2,
					isActive: true,
				},
			]);

			const results = await quotesService.getComputersByUse('ofimatica');
			expect(results.length).toBeGreaterThanOrEqual(1);
			results.forEach((p) => {
				expect(p.isActive).toBe(true);
			});
		});

		it('should return empty array when no products match', async () => {
			const results = await quotesService.getComputersByUse('diseno');
			expect(results).toEqual([]);
		});
	});

	// -------------------------------------------------------------------------
	// getLaptopParts — DB method
	// -------------------------------------------------------------------------
	describe('getLaptopParts', () => {
		it('should return all parts of the given type when no model match filters them', async () => {
			await Product.create({
				sku: 'PART-001',
				category: 'componente',
				name: 'Pantalla HP 15',
				brand: 'HP',
				model: 'Generic',
				description: 'Pantalla de reemplazo',
				specifications: { type: 'pantalla', compatibleWith: ['HP Pavilion'] },
				price: 350,
				stock: 3,
				isActive: true,
			});

			const results = await quotesService.getLaptopParts('HP Pavilion', 'pantalla');
			expect(results.length).toBeGreaterThanOrEqual(1);
			results.forEach((p) => expect(p.isActive).toBe(true));
		});

		it('should return all matching parts when no specific model filter matches', async () => {
			await Product.create({
				sku: 'PART-002',
				category: 'componente',
				name: 'Teclado genérico',
				brand: 'Genérico',
				model: 'USB',
				description: 'Teclado de reemplazo',
				specifications: { type: 'teclado', compatibleWith: ['Dell'] },
				price: 80,
				stock: 10,
				isActive: true,
			});

			// Use a model that doesn't match the compatibleWith array — falls back to all
			const results = await quotesService.getLaptopParts('Lenovo IdeaPad', 'teclado');
			// Since filtered is empty, it returns the unfiltered array
			expect(Array.isArray(results)).toBe(true);
		});

		it('should return empty array when no parts exist for type', async () => {
			const results = await quotesService.getLaptopParts('HP', 'bateria');
			expect(results).toEqual([]);
		});
	});

	// -------------------------------------------------------------------------
	// getProductsByCategory — DB method
	// -------------------------------------------------------------------------
	describe('getProductsByCategory', () => {
		it('should return active products for a given category', async () => {
			await Product.create({
				sku: 'IMP-001',
				category: 'impresora',
				name: 'Impresora HP LaserJet',
				brand: 'HP',
				model: 'LaserJet Pro',
				description: 'Impresora láser',
				price: 1200,
				stock: 4,
				isActive: true,
			});

			const results = await quotesService.getProductsByCategory('impresora');
			expect(results.length).toBeGreaterThanOrEqual(1);
			results.forEach((p) => expect(p.isActive).toBe(true));
		});

		it('should return empty array when no products in category', async () => {
			const results = await quotesService.getProductsByCategory('camara');
			expect(results).toEqual([]);
		});
	});

	// -------------------------------------------------------------------------
	// getInstallationPrice — DB method
	// -------------------------------------------------------------------------
	describe('getInstallationPrice', () => {
		it('should return 0 when part type is not in the service map', async () => {
			const price = await quotesService.getInstallationPrice('desconocido');
			expect(price).toBe(0);
		});

		it('should return 0 when no matching service exists in DB', async () => {
			const price = await quotesService.getInstallationPrice('pantalla');
			expect(price).toBe(0);
		});

		it('should return basePrice when matching service exists', async () => {
			await Service.create({
				code: 'SRV-REP-001',
				name: 'Instalación de pantalla',
				description: 'Reemplazo de pantalla',
				category: 'reparacion',
				equipmentTypes: ['laptop'],
				basePrice: 120,
				estimatedDuration: '2 horas',
				isActive: true,
			});

			const price = await quotesService.getInstallationPrice('pantalla');
			expect(price).toBe(120);
		});

		it('should return correct price for each known part type with service in DB', async () => {
			const serviceMap = [
				{ code: 'SRV-REP-002', partType: 'teclado', basePrice: 80 },
				{ code: 'SRV-REP-010', partType: 'disco', basePrice: 60 },
				{ code: 'SRV-REP-011', partType: 'memoria', basePrice: 50 },
				{ code: 'SRV-REP-006', partType: 'bateria', basePrice: 90 },
			];

			for (const { code, partType, basePrice } of serviceMap) {
				await Service.create({
					code,
					name: `Instalación ${partType}`,
					description: '',
					category: 'reparacion',
					equipmentTypes: ['laptop'],
					basePrice,
					estimatedDuration: '1 hora',
					isActive: true,
				});
				const price = await quotesService.getInstallationPrice(partType);
				expect(price).toBe(basePrice);
			}
		});
	});

	// -------------------------------------------------------------------------
	// calculateTotals
	// -------------------------------------------------------------------------
	describe('calculateTotals', () => {
		it('should calculate subtotal, igv and total correctly', () => {
			const items = [
				{ name: 'PC Básica', quantity: 1, unitPrice: 1000, subtotal: 1000 },
				{ name: 'Monitor', quantity: 2, unitPrice: 300, subtotal: 600 },
			];

			const totals = quotesService.calculateTotals(items);
			expect(totals.subtotal).toBe(1600);
			expect(totals.igv).toBeCloseTo(1600 * 0.18, 2);
			expect(totals.totalAmount).toBeCloseTo(1600 + 1600 * 0.18, 2);
		});

		it('should return zeros for empty items', () => {
			const totals = quotesService.calculateTotals([]);
			expect(totals.subtotal).toBe(0);
			expect(totals.igv).toBe(0);
			expect(totals.totalAmount).toBe(0);
		});
	});

	// -------------------------------------------------------------------------
	// getServices
	// -------------------------------------------------------------------------
	describe('getServices', () => {
		it('should return active services for a given equipment type', async () => {
			await Service.create({
				code: 'SVC-001',
				name: 'Mantenimiento Laptop',
				description: 'Limpieza y revisión',
				category: 'mantenimiento',
				equipmentTypes: ['laptop'],
				basePrice: 80,
				estimatedDuration: '1-2 horas',
				isActive: true,
			});

			const results = await quotesService.getServices('laptop');
			expect(results.length).toBeGreaterThanOrEqual(1);
			results.forEach((s) => expect(s.isActive).toBe(true));
		});

		it('should return empty array when no services match', async () => {
			const results = await quotesService.getServices('drone');
			expect(results).toEqual([]);
		});

		it('should normalize equipment type before querying (number input)', async () => {
			await Service.create({
				code: 'SVC-002',
				name: 'Mantenimiento PC',
				description: 'Limpieza escritorio',
				category: 'mantenimiento',
				equipmentTypes: ['PC'],
				basePrice: 70,
				estimatedDuration: '1 hora',
				isActive: true,
			});

			// '1' normalizes to 'PC'
			const results = await quotesService.getServices('1');
			expect(results.length).toBeGreaterThanOrEqual(1);
		});

		it('should filter by category when provided', async () => {
			await Service.create({
				code: 'SVC-003',
				name: 'Reparacion PC',
				description: 'Reparacion general',
				category: 'reparacion',
				equipmentTypes: ['PC'],
				basePrice: 150,
				estimatedDuration: '3 horas',
				isActive: true,
			});

			const results = await quotesService.getServices('PC', 'reparacion');
			expect(results.length).toBeGreaterThanOrEqual(1);
			results.forEach((s) => expect(s.category).toBe('reparacion'));
		});
	});

	// -------------------------------------------------------------------------
	// createQuote — DB method
	// -------------------------------------------------------------------------
	describe('createQuote', () => {
		it('should persist a quote and return the saved document', async () => {
			const quoteData = {
				clientName: 'Juan Pérez',
				phone: '987654321',
				email: null,
				clientType: 'natural',
				ruc: null,
				companyName: null,
				quoteType: 'producto',
				items: [{ name: 'PC Básica', quantity: 1, unitPrice: 1500 }],
				creationStartTime: new Date(Date.now() - 5000),
			};

			const quote = await quotesService.createQuote(quoteData);

			expect(quote).toBeDefined();
			expect(quote.quoteNumber).toMatch(/^COT-/);
			expect(quote.clientName).toBe('Juan Pérez');
			expect(quote.totalAmount).toBeGreaterThan(0);
			expect(quote.status).toBe('generada');
			expect(quote.createdByChatbot).toBe(true);
		});

		it('should calculate totals correctly when creating a quote with multiple items', async () => {
			const quoteData = {
				clientName: 'Maria García',
				phone: '912345678',
				quoteType: 'mixto',
				items: [
					{ name: 'Monitor', quantity: 2, unitPrice: 400 },
					{ name: 'Teclado', quantity: 1, unitPrice: 80 },
				],
				creationStartTime: new Date(Date.now() - 3000),
			};

			const quote = await quotesService.createQuote(quoteData);

			expect(quote.subtotal).toBe(880);
			expect(quote.igv).toBeCloseTo(880 * 0.18, 2);
			expect(quote.totalAmount).toBeCloseTo(880 * 1.18, 2);
		});

		it('should generate a unique quoteNumber for each call', async () => {
			const base = {
				clientName: 'Test',
				phone: '900000000',
				quoteType: 'servicio',
				items: [{ name: 'Mantenimiento', quantity: 1, unitPrice: 100 }],
				creationStartTime: new Date(),
			};

			const q1 = await quotesService.createQuote(base);
			const q2 = await quotesService.createQuote(base);

			expect(q1.quoteNumber).not.toBe(q2.quoteNumber);
		});

		it('should throw when required fields are missing', async () => {
			// Missing required fields: clientName, phone, quoteType
			await expect(
				quotesService.createQuote({
					items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
					creationStartTime: new Date(),
				})
			).rejects.toThrow();
		});
	});
});

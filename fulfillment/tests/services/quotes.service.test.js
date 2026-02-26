require('../setup');
const quotesService = require('../../src/services/quotes.service');
const Product = require('../../src/models/Product');
const Service = require('../../src/models/Service');

describe('quotesService', () => {
	beforeEach(async () => {
		await Product.deleteMany({});
		await Service.deleteMany({});
	});

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
	});
});

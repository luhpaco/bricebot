require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Service = require('../models/Service');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cbricenho';
const SEED_DIR = path.resolve(__dirname, '../../../seed');

// ====================================================================
// CSV Parsing (handles quoted fields with escaped "" and JSON values)
// ====================================================================

/**
 * Parses a single CSV line, handling quoted fields and escaped quotes.
 * Standard CSV: doubled quotes ("") inside a quoted field represent a literal ".
 * @param {string} line - A single CSV line
 * @returns {string[]} Array of field values
 */
function parseCSVLine(line) {
	const result = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (inQuotes) {
			if (char === '"') {
				if (i + 1 < line.length && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				current += char;
			}
		} else {
			if (char === '"') {
				inQuotes = true;
			} else if (char === ',') {
				result.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}
	}

	result.push(current.trim());
	return result;
}

/**
 * Reads and parses a CSV file into an array of row objects.
 * @param {string} filePath - Absolute path to the CSV file
 * @returns {Object[]} Array of objects keyed by CSV headers
 */
function parseCSV(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n').filter(line => line.trim());
	const headers = parseCSVLine(lines[0]);

	return lines.slice(1).map(line => {
		const values = parseCSVLine(line);
		const row = {};
		headers.forEach((header, i) => {
			row[header] = values[i] || '';
		});
		return row;
	});
}

// ====================================================================
// Data Transformation
// ====================================================================

/**
 * Transforms a CSV product row into a Product document.
 * @param {Object} row - Parsed CSV row object
 * @returns {Object} Product document ready for MongoDB insertion
 */
function transformProduct(row) {
	let specifications = {};
	try {
		specifications = JSON.parse(row.specifications || '{}');
	} catch {
		specifications = {};
	}

	return {
		sku: row.sku,
		category: row.category,
		name: row.name,
		brand: row.brand,
		model: row.model,
		description: row.description,
		specifications,
		price: parseFloat(row.price) || 0,
		stock: parseInt(row.stock) || 0,
		isActive: row.isActive === 'True',
	};
}

/**
 * Transforms a CSV service row into a Service document.
 * @param {Object} row - Parsed CSV row object
 * @returns {Object} Service document ready for MongoDB insertion
 */
function transformService(row) {
	let equipmentTypes = [];
	try {
		equipmentTypes = JSON.parse(row.equipmentTypes || '[]');
	} catch {
		equipmentTypes = [];
	}

	return {
		code: row.code,
		name: row.name,
		description: row.description,
		category: row.category,
		equipmentTypes,
		basePrice: parseFloat(row.basePrice) || 0,
		estimatedDuration: row.estimatedDuration,
		isActive: row.isActive === 'True',
	};
}

// ====================================================================
// Main Seed Function
// ====================================================================

async function seedDatabase() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log('[Seed] Connected to MongoDB');

		console.log('[Seed] Clearing existing products and services...');
		await Product.deleteMany({});
		await Service.deleteMany({});

		// --- Products ---
		console.log('\n[Seed] Processing products...');
		const productRows = parseCSV(path.join(SEED_DIR, 'seed-products.csv'));
		const products = productRows.map(transformProduct);
		await Product.insertMany(products);

		const productCats = {};
		products.forEach(p => {
			productCats[p.category] = (productCats[p.category] || 0) + 1;
		});
		console.log(`  Total products: ${products.length}`);
		Object.entries(productCats).sort().forEach(([cat, count]) => {
			console.log(`    ${cat}: ${count}`);
		});

		// --- Services ---
		console.log('\n[Seed] Processing services...');
		const serviceRows = parseCSV(path.join(SEED_DIR, 'seed-services.csv'));
		const services = serviceRows.map(transformService);
		await Service.insertMany(services);

		const serviceCats = {};
		services.forEach(s => {
			serviceCats[s.category] = (serviceCats[s.category] || 0) + 1;
		});
		console.log(`  Total services: ${services.length}`);
		Object.entries(serviceCats).sort().forEach(([cat, count]) => {
			console.log(`    ${cat}: ${count}`);
		});

		// --- Summary ---
		console.log('\n[Seed] ========== SUMMARY ==========');
		console.log(`  TOTAL PRODUCTS: ${products.length}`);
		console.log(`  TOTAL SERVICES: ${services.length}`);
		console.log('  ==================================');

		await mongoose.disconnect();
		console.log('\n[Seed] Done. Database seeded successfully.');
	} catch (error) {
		console.error('[Seed] Error seeding database:', error);
		await mongoose.disconnect();
		process.exit(1);
	}
}

seedDatabase();

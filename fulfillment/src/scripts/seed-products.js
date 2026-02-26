require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Service = require('../models/Service');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cbricenho';

const computers = [
	{
		sku: 'PC-OFI-001',
		category: 'computadora',
		name: 'PC Básica Ofimática',
		brand: 'Genérica',
		model: 'OFI-Basic',
		description: 'Ideal para trabajo de oficina, navegación web y documentos',
		specifications: {
			processor: 'Intel Core i3-12100',
			ram: '8GB DDR4',
			storage: '256GB SSD',
			useCase: 'ofimatica',
		},
		price: 1450,
		stock: 5,
		isActive: true,
	},
	{
		sku: 'PC-OFI-002',
		category: 'computadora',
		name: 'PC Ofimática Plus',
		brand: 'Genérica',
		model: 'OFI-Plus',
		description: 'Para oficina con mayor capacidad de almacenamiento y multitarea',
		specifications: {
			processor: 'Intel Core i5-12400',
			ram: '16GB DDR4',
			storage: '512GB SSD',
			useCase: 'ofimatica',
		},
		price: 2150,
		stock: 3,
		isActive: true,
	},
	{
		sku: 'PC-DIS-001',
		category: 'computadora',
		name: 'PC Diseño Gráfico',
		brand: 'Genérica',
		model: 'DSG-Pro',
		description: 'Para diseño gráfico, edición de fotos y video básico',
		specifications: {
			processor: 'Intel Core i5-13400F',
			ram: '16GB DDR4',
			storage: '512GB SSD NVMe',
			gpu: 'NVIDIA GTX 1650 4GB',
			useCase: 'diseno',
		},
		price: 3200,
		stock: 2,
		isActive: true,
	},
	{
		sku: 'PC-DIS-002',
		category: 'computadora',
		name: 'PC Diseño Profesional',
		brand: 'Genérica',
		model: 'DSG-ProMax',
		description: 'Para diseño profesional, edición de video 4K y render 3D',
		specifications: {
			processor: 'Intel Core i7-13700F',
			ram: '32GB DDR5',
			storage: '1TB SSD NVMe',
			gpu: 'NVIDIA RTX 3060 12GB',
			useCase: 'diseno',
		},
		price: 5500,
		stock: 1,
		isActive: true,
	},
	{
		sku: 'PC-GAM-001',
		category: 'computadora',
		name: 'PC Gamer Entry',
		brand: 'Genérica',
		model: 'GAM-Entry',
		description: 'Para gaming en resolución 1080p con buenos FPS',
		specifications: {
			processor: 'Intel Core i5-12400F',
			ram: '16GB DDR4',
			storage: '512GB SSD NVMe',
			gpu: 'NVIDIA GTX 1660 Super 6GB',
			useCase: 'gaming',
		},
		price: 3000,
		stock: 3,
		isActive: true,
	},
	{
		sku: 'PC-GAM-002',
		category: 'computadora',
		name: 'PC Gamer Pro',
		brand: 'Genérica',
		model: 'GAM-Pro',
		description: 'Para gaming en alta resolución y streaming',
		specifications: {
			processor: 'Intel Core i7-13700F',
			ram: '32GB DDR5',
			storage: '1TB SSD NVMe',
			gpu: 'NVIDIA RTX 4060 8GB',
			useCase: 'gaming',
		},
		price: 5800,
		stock: 1,
		isActive: true,
	},
	{
		sku: 'PC-PRG-001',
		category: 'computadora',
		name: 'PC Desarrollo',
		brand: 'Genérica',
		model: 'DEV-Standard',
		description: 'Para programación, compilación y entornos de desarrollo',
		specifications: {
			processor: 'Intel Core i5-13400',
			ram: '16GB DDR4',
			storage: '512GB SSD NVMe',
			useCase: 'programacion',
		},
		price: 2500,
		stock: 2,
		isActive: true,
	},
	{
		sku: 'PC-PRG-002',
		category: 'computadora',
		name: 'PC Desarrollo Avanzado',
		brand: 'Genérica',
		model: 'DEV-Pro',
		description: 'Para desarrollo intensivo, contenedores y máquinas virtuales',
		specifications: {
			processor: 'Intel Core i7-13700',
			ram: '32GB DDR5',
			storage: '1TB SSD NVMe',
			useCase: 'programacion',
		},
		price: 4200,
		stock: 1,
		isActive: true,
	},
	{
		sku: 'PC-EST-001',
		category: 'computadora',
		name: 'PC Estudio Básica',
		brand: 'Genérica',
		model: 'EDU-Basic',
		description: 'Para estudiantes, tareas, clases virtuales y navegación',
		specifications: {
			processor: 'Intel Core i3-12100',
			ram: '8GB DDR4',
			storage: '256GB SSD',
			useCase: 'estudio',
		},
		price: 1350,
		stock: 5,
		isActive: true,
	},
	{
		sku: 'PC-EST-002',
		category: 'computadora',
		name: 'PC Estudio Completa',
		brand: 'Genérica',
		model: 'EDU-Plus',
		description: 'Para estudiantes universitarios con necesidades intermedias',
		specifications: {
			processor: 'Intel Core i5-12400',
			ram: '16GB DDR4',
			storage: '512GB SSD',
			useCase: 'estudio',
		},
		price: 1950,
		stock: 3,
		isActive: true,
	},
];

const laptopParts = [
	{
		sku: 'REP-PAN-001',
		category: 'componente',
		name: 'Pantalla LCD 14" HD',
		brand: 'Genérica',
		model: 'LCD-14-HD',
		description: 'Pantalla de reemplazo 14 pulgadas HD 1366x768',
		specifications: {
			type: 'pantalla',
			size: '14"',
			resolution: '1366x768',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus'],
		},
		price: 220,
		stock: 4,
		isActive: true,
	},
	{
		sku: 'REP-PAN-002',
		category: 'componente',
		name: 'Pantalla LCD 15.6" HD',
		brand: 'Genérica',
		model: 'LCD-156-HD',
		description: 'Pantalla de reemplazo 15.6 pulgadas HD 1366x768',
		specifications: {
			type: 'pantalla',
			size: '15.6"',
			resolution: '1366x768',
			compatibleWith: ['HP Pavilion', 'Dell Inspiron', 'Lenovo IdeaPad', 'Acer Aspire', 'Asus VivoBook'],
		},
		price: 280,
		stock: 6,
		isActive: true,
	},
	{
		sku: 'REP-PAN-003',
		category: 'componente',
		name: 'Pantalla IPS 15.6" FHD',
		brand: 'Genérica',
		model: 'IPS-156-FHD',
		description: 'Pantalla de reemplazo 15.6 pulgadas Full HD IPS',
		specifications: {
			type: 'pantalla',
			size: '15.6"',
			resolution: '1920x1080',
			compatibleWith: ['HP Pavilion', 'Dell Inspiron', 'Lenovo IdeaPad', 'Acer Aspire', 'Asus VivoBook'],
		},
		price: 380,
		stock: 3,
		isActive: true,
	},
	{
		sku: 'REP-TEC-001',
		category: 'componente',
		name: 'Teclado Laptop Universal ES',
		brand: 'Genérica',
		model: 'KB-UNIV-ES',
		description: 'Teclado de reemplazo español latinoamericano',
		specifications: {
			type: 'teclado',
			layout: 'Español Latinoamericano',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus'],
		},
		price: 120,
		stock: 8,
		isActive: true,
	},
	{
		sku: 'REP-TEC-002',
		category: 'componente',
		name: 'Teclado HP Pavilion 15',
		brand: 'HP',
		model: 'KB-HP-PAV15',
		description: 'Teclado original para HP Pavilion 15 series',
		specifications: {
			type: 'teclado',
			layout: 'Español Latinoamericano',
			compatibleWith: ['HP Pavilion 15'],
		},
		price: 150,
		stock: 3,
		isActive: true,
	},
	{
		sku: 'REP-BAT-001',
		category: 'componente',
		name: 'Batería Laptop Universal 4 celdas',
		brand: 'Genérica',
		model: 'BAT-4CELL',
		description: 'Batería de reemplazo 4 celdas compatible con múltiples modelos',
		specifications: {
			type: 'bateria',
			cells: 4,
			capacity: '2200mAh',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer'],
		},
		price: 180,
		stock: 5,
		isActive: true,
	},
	{
		sku: 'REP-BAT-002',
		category: 'componente',
		name: 'Batería Laptop 6 celdas Alta Capacidad',
		brand: 'Genérica',
		model: 'BAT-6CELL',
		description: 'Batería de reemplazo 6 celdas de larga duración',
		specifications: {
			type: 'bateria',
			cells: 6,
			capacity: '4400mAh',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus'],
		},
		price: 250,
		stock: 3,
		isActive: true,
	},
	{
		sku: 'REP-SSD-001',
		category: 'componente',
		name: 'SSD 240GB SATA',
		brand: 'Kingston',
		model: 'A400-240',
		description: 'Disco SSD 240GB SATA III 2.5 pulgadas',
		specifications: {
			type: 'disco',
			capacity: '240GB',
			interface: 'SATA III',
			formFactor: '2.5"',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Toshiba'],
		},
		price: 120,
		stock: 10,
		isActive: true,
	},
	{
		sku: 'REP-SSD-002',
		category: 'componente',
		name: 'SSD 480GB SATA',
		brand: 'Kingston',
		model: 'A400-480',
		description: 'Disco SSD 480GB SATA III 2.5 pulgadas',
		specifications: {
			type: 'disco',
			capacity: '480GB',
			interface: 'SATA III',
			formFactor: '2.5"',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Toshiba'],
		},
		price: 180,
		stock: 6,
		isActive: true,
	},
	{
		sku: 'REP-SSD-003',
		category: 'componente',
		name: 'SSD 500GB NVMe M.2',
		brand: 'Kingston',
		model: 'NV2-500',
		description: 'Disco SSD 500GB NVMe M.2 2280 de alta velocidad',
		specifications: {
			type: 'disco',
			capacity: '500GB',
			interface: 'NVMe M.2',
			formFactor: 'M.2 2280',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus'],
		},
		price: 200,
		stock: 5,
		isActive: true,
	},
	{
		sku: 'REP-RAM-001',
		category: 'componente',
		name: 'Memoria RAM 8GB DDR4 Laptop',
		brand: 'Kingston',
		model: 'KVR26S19S8-8',
		description: 'Memoria RAM DDR4 2666MHz SODIMM para laptop',
		specifications: {
			type: 'memoria',
			capacity: '8GB',
			type_ram: 'DDR4',
			speed: '2666MHz',
			formFactor: 'SODIMM',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus'],
		},
		price: 110,
		stock: 8,
		isActive: true,
	},
	{
		sku: 'REP-RAM-002',
		category: 'componente',
		name: 'Memoria RAM 16GB DDR4 Laptop',
		brand: 'Kingston',
		model: 'KVR26S19D8-16',
		description: 'Memoria RAM DDR4 2666MHz SODIMM 16GB para laptop',
		specifications: {
			type: 'memoria',
			capacity: '16GB',
			type_ram: 'DDR4',
			speed: '2666MHz',
			formFactor: 'SODIMM',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus'],
		},
		price: 200,
		stock: 4,
		isActive: true,
	},
	{
		sku: 'REP-CAR-001',
		category: 'componente',
		name: 'Cargador Laptop Universal 65W',
		brand: 'Genérica',
		model: 'CHG-65W',
		description: 'Cargador universal 65W con múltiples puntas',
		specifications: {
			type: 'cargador',
			power: '65W',
			compatibleWith: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Toshiba'],
		},
		price: 80,
		stock: 10,
		isActive: true,
	},
];

const services = [
	{
		code: 'SRV-MAN-001',
		name: 'Mantenimiento Preventivo PC/Laptop',
		description: 'Limpieza interna, cambio de pasta térmica, revisión de componentes',
		category: 'mantenimiento',
		equipmentTypes: ['PC', 'laptop'],
		basePrice: 80,
		estimatedDuration: '1-2 horas',
		isActive: true,
	},
	{
		code: 'SRV-MAN-002',
		name: 'Mantenimiento Correctivo PC/Laptop',
		description: 'Diagnóstico completo y reparación de fallas detectadas',
		category: 'mantenimiento',
		equipmentTypes: ['PC', 'laptop'],
		basePrice: 120,
		estimatedDuration: '2-4 horas',
		isActive: true,
	},
	{
		code: 'SRV-REP-001',
		name: 'Cambio de Pantalla Laptop',
		description: 'Reemplazo de pantalla LCD/LED de laptop',
		category: 'reparacion',
		equipmentTypes: ['laptop'],
		basePrice: 70,
		estimatedDuration: '1-2 horas',
		isActive: true,
	},
	{
		code: 'SRV-REP-002',
		name: 'Cambio de Teclado Laptop',
		description: 'Reemplazo de teclado de laptop',
		category: 'reparacion',
		equipmentTypes: ['laptop'],
		basePrice: 50,
		estimatedDuration: '30 min - 1 hora',
		isActive: true,
	},
	{
		code: 'SRV-REP-003',
		name: 'Repotenciación (Upgrade RAM/SSD)',
		description: 'Instalación de memoria RAM adicional o disco SSD',
		category: 'reparacion',
		equipmentTypes: ['PC', 'laptop'],
		basePrice: 50,
		estimatedDuration: '30 min - 1 hora',
		isActive: true,
	},
	{
		code: 'SRV-SOF-001',
		name: 'Formateo e Instalación de Windows',
		description: 'Formateo completo, instalación de Windows, drivers y programas básicos',
		category: 'software',
		equipmentTypes: ['PC', 'laptop'],
		basePrice: 80,
		estimatedDuration: '2-3 horas',
		isActive: true,
	},
	{
		code: 'SRV-SOF-002',
		name: 'Instalación de Software Especializado',
		description: 'Instalación de Office, Adobe, AutoCAD u otro software profesional',
		category: 'software',
		equipmentTypes: ['PC', 'laptop'],
		basePrice: 40,
		estimatedDuration: '1-2 horas',
		isActive: true,
	},
	{
		code: 'SRV-INS-001',
		name: 'Instalación de Cámaras de Seguridad (1-4 cámaras)',
		description: 'Instalación completa de sistema de cámaras de seguridad',
		category: 'instalacion',
		equipmentTypes: ['camara'],
		basePrice: 350,
		estimatedDuration: '4-6 horas',
		isActive: true,
	},
	{
		code: 'SRV-MAN-003',
		name: 'Mantenimiento de Impresora',
		description: 'Limpieza de cabezales, alineación y revisión general',
		category: 'mantenimiento',
		equipmentTypes: ['impresora'],
		basePrice: 60,
		estimatedDuration: '1-2 horas',
		isActive: true,
	},
];

async function seedDatabase() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log('[Seed] Connected to MongoDB');

		console.log('[Seed] Clearing existing products...');
		await Product.deleteMany({});

		console.log('[Seed] Clearing existing services...');
		await Service.deleteMany({});

		console.log('[Seed] Inserting computers...');
		const insertedComputers = await Product.insertMany(computers);
		console.log(`[Seed] Inserted ${insertedComputers.length} computers`);

		console.log('[Seed] Inserting laptop parts...');
		const insertedParts = await Product.insertMany(laptopParts);
		console.log(`[Seed] Inserted ${insertedParts.length} laptop parts`);

		console.log('[Seed] Inserting services...');
		const insertedServices = await Service.insertMany(services);
		console.log(`[Seed] Inserted ${insertedServices.length} services`);

		console.log('\n[Seed] Summary:');
		console.log(`  Computers: ${insertedComputers.length}`);
		console.log(`  Laptop Parts: ${insertedParts.length}`);
		console.log(`  Services: ${insertedServices.length}`);
		console.log(`  Total Products: ${insertedComputers.length + insertedParts.length}`);

		await mongoose.disconnect();
		console.log('\n[Seed] Done. Database seeded successfully.');
	} catch (error) {
		console.error('[Seed] Error seeding database:', error);
		await mongoose.disconnect();
		process.exit(1);
	}
}

seedDatabase();

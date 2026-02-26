const {
	validatePhone,
	normalizePhone,
	validateDate,
	validateTime,
	validateAddress,
	validateCoverageArea,
	validateEmail,
	parseSelectionIndex,
} = require('../../src/utils/validators');

describe('validators', () => {
	describe('validatePhone', () => {
		it('should accept a valid 9-digit Peruvian number', () => {
			expect(validatePhone('987654321')).toBe(true);
		});

		it('should accept number with country code +51', () => {
			expect(validatePhone('+51987654321')).toBe(true);
		});

		it('should reject a number with fewer than 9 digits', () => {
			expect(validatePhone('12345')).toBe(false);
		});

		it('should reject an empty string', () => {
			expect(validatePhone('')).toBe(false);
		});

		it('should reject null', () => {
			expect(validatePhone(null)).toBe(false);
		});
	});

	describe('normalizePhone', () => {
		it('should return only digits for a number with country code', () => {
			const result = normalizePhone('+51987654321');
			expect(result).toMatch(/987654321/);
		});

		it('should return digits for a plain 9-digit number', () => {
			const result = normalizePhone('987654321');
			expect(result).toMatch(/987654321/);
		});
	});

	describe('validateDate', () => {
		it('should return valid = true for a future date within 7 days', () => {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			const result = validateDate(tomorrow);
			expect(result.valid).toBe(true);
		});

		it('should return valid = false for a past date', () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const result = validateDate(yesterday);
			expect(result.valid).toBe(false);
		});

		it('should return valid = false for a date beyond MAX_BOOKING_DAYS', () => {
			const farFuture = new Date();
			farFuture.setDate(farFuture.getDate() + 30);
			const result = validateDate(farFuture);
			expect(result.valid).toBe(false);
		});

		it('should return valid = false for null', () => {
			const result = validateDate(null);
			expect(result.valid).toBe(false);
		});
	});

	describe('validateTime', () => {
		it('should accept a valid weekday time within business hours', () => {
			const monday = new Date();
			monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7 || 7));
			const result = validateTime('10:00', monday);
			expect(result.valid).toBe(true);
		});

		it('should reject null and return valid = false', () => {
			const result = validateTime(null, new Date());
			expect(result.valid).toBe(false);
		});

		it('should reject time outside business hours', () => {
			const monday = new Date();
			monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7 || 7));
			const result = validateTime('22:00', monday);
			expect(result.valid).toBe(false);
		});
	});

	describe('validateAddress', () => {
		it('should return valid = true for a non-empty address string', () => {
			const result = validateAddress('Calle Los Pinos 123, Paita');
			expect(result.valid).toBe(true);
		});

		it('should return valid = false for an empty string', () => {
			const result = validateAddress('');
			expect(result.valid).toBe(false);
		});

		it('should return valid = false for null', () => {
			const result = validateAddress(null);
			expect(result.valid).toBe(false);
		});
	});

	describe('validateCoverageArea', () => {
		it('should return valid = true for an address containing "paita"', () => {
			const result = validateCoverageArea('Av. Principal, Paita');
			expect(result.valid).toBe(true);
		});

		it('should return valid = true for an address containing "marco jara"', () => {
			const result = validateCoverageArea('AA.HH Marco Jara Mz D Lote 36');
			expect(result.valid).toBe(true);
		});

		it('should return valid = false for an address outside coverage', () => {
			const result = validateCoverageArea('Lima, Miraflores');
			expect(result.valid).toBe(false);
		});
	});

	describe('validateEmail', () => {
		it('should return valid = true for a valid email address', () => {
			const result = validateEmail('test@example.com');
			expect(result.valid).toBe(true);
		});

		it('should return valid = false for an invalid email', () => {
			const result = validateEmail('not-an-email');
			expect(result.valid).toBe(false);
		});

		it('should return valid = false for null', () => {
			const result = validateEmail(null);
			expect(result.valid).toBe(false);
		});
	});

	describe('parseSelectionIndex', () => {
		it('should parse direct number "1" to index 0', () => {
			expect(parseSelectionIndex('1', 3)).toBe(0);
		});

		it('should parse "2" to index 1', () => {
			expect(parseSelectionIndex('2', 3)).toBe(1);
		});

		it('should parse "opción 3" to index 2', () => {
			expect(parseSelectionIndex('opción 3', 3)).toBe(2);
		});

		it('should return null for out-of-range selection', () => {
			expect(parseSelectionIndex('5', 3)).toBeNull();
		});

		it('should return null for non-numeric input', () => {
			expect(parseSelectionIndex('abc', 3)).toBeNull();
		});
	});
});

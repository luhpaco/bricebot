const {
	formatDate,
	formatTime,
	parseDialogflowDate,
	parseDialogflowTime,
	isToday,
	isTomorrow,
	getNextBusinessDays,
	formatDateISO,
} = require('../../src/utils/dateHelpers');

describe('dateHelpers', () => {
	describe('formatDate', () => {
		it('should format a Date object to Spanish locale string', () => {
			const date = new Date('2026-02-15T12:00:00.000Z');
			const result = formatDate(date);
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});

		it('should return empty string for null input', () => {
			expect(formatDate(null)).toBe('');
		});
	});

	describe('formatTime', () => {
		it('should format a time string to HH:MM AM/PM', () => {
			const result = formatTime('10:00');
			expect(typeof result).toBe('string');
			expect(result).toContain('10');
		});

		it('should return empty string for empty input', () => {
			expect(formatTime('')).toBe('');
		});
	});

	describe('parseDialogflowDate', () => {
		it('should parse an ISO date string and return a Date', () => {
			const result = parseDialogflowDate('2026-02-15');
			expect(result instanceof Date).toBe(true);
			expect(isNaN(result.getTime())).toBe(false);
		});

		it('should return null for null input', () => {
			expect(parseDialogflowDate(null)).toBeNull();
		});
	});

	describe('parseDialogflowTime', () => {
		it('should parse a Dialogflow time string', () => {
			const result = parseDialogflowTime('10:00:00');
			expect(typeof result).toBe('string');
			expect(result).toContain('10:00');
		});

		it('should return empty string for null input', () => {
			expect(parseDialogflowTime(null)).toBe('');
		});
	});

	describe('isToday', () => {
		it("should return true for today's date", () => {
			expect(isToday(new Date())).toBe(true);
		});

		it('should return false for tomorrow', () => {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			expect(isToday(tomorrow)).toBe(false);
		});
	});

	describe('isTomorrow', () => {
		it("should return true for tomorrow's date", () => {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			expect(isTomorrow(tomorrow)).toBe(true);
		});

		it('should return false for today', () => {
			expect(isTomorrow(new Date())).toBe(false);
		});
	});

	describe('getNextBusinessDays', () => {
		it('should return the requested number of business days', () => {
			const days = getNextBusinessDays(5);
			expect(Array.isArray(days)).toBe(true);
			expect(days.length).toBeLessThanOrEqual(5);
			days.forEach((d) => {
				expect(d instanceof Date).toBe(true);
				expect(d.getDay()).not.toBe(0);
			});
		});
	});

	describe('formatDateISO', () => {
		it('should return a YYYY-MM-DD string', () => {
			const date = new Date('2026-02-15T00:00:00.000Z');
			const result = formatDateISO(date);
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});
});

const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('MarketService', () => {
  let marketService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.OPENAI_API_KEY = 'test-api-key';
    marketService = require('../../src/infrastructure/services/marketService');
  });

  describe('getMockPrices', () => {
    test('debe retornar array de precios', () => {
      const prices = marketService.getMockPrices();
      
      expect(Array.isArray(prices)).toBe(true);
      expect(prices.length).toBeGreaterThan(0);
    });

    test('debe tener estructura correcta con campos en inglés', () => {
      const prices = marketService.getMockPrices();
      const firstPrice = prices[0];
      
      expect(firstPrice).toHaveProperty('productName');
      expect(firstPrice).toHaveProperty('currentPrice');
      expect(firstPrice).toHaveProperty('unit');
      expect(firstPrice).toHaveProperty('market');
      expect(firstPrice).toHaveProperty('region');
    });

    test('debe incluir productos comunes colombianos', () => {
      const prices = marketService.getMockPrices();
      const productNames = prices.map(p => p.productName);
      
      expect(productNames.some(name => name.includes('Tomate'))).toBe(true);
      expect(productNames.some(name => name.includes('Papa'))).toBe(true);
    });

    test('precios deben ser números positivos', () => {
      const prices = marketService.getMockPrices();
      
      prices.forEach(price => {
        expect(typeof price.currentPrice).toBe('number');
        expect(price.currentPrice).toBeGreaterThan(0);
      });
    });

    test('debe incluir fecha actual', () => {
      const prices = marketService.getMockPrices();
      const today = new Date().toISOString().split('T')[0];
      
      prices.forEach(price => {
        expect(price.date).toBe(today);
      });
    });
  });

  describe('Estructura de datos', () => {
    test('debe tener IDs únicos', () => {
      const prices = marketService.getMockPrices();
      const ids = prices.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
    });

    test('debe tener categorías definidas', () => {
      const prices = marketService.getMockPrices();
      
      prices.forEach(price => {
        expect(price).toHaveProperty('category');
        expect(typeof price.category).toBe('string');
        expect(price.category.length).toBeGreaterThan(0);
      });
    });

    test('debe calcular cambio de precio correctamente', () => {
      const prices = marketService.getMockPrices();
      
      prices.forEach(price => {
        const expectedChange = price.currentPrice - price.previousPrice;
        expect(price.priceChange).toBe(expectedChange);
      });
    });

    test('debe tener unidades válidas', () => {
      const prices = marketService.getMockPrices();
      const validUnits = ['kg', 'lb', 'unidad', 'bulto'];
      
      prices.forEach(price => {
        expect(validUnits).toContain(price.unit);
      });
    });
  });
});

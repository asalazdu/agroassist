const { describe, test, expect } = require('@jest/globals');
const hashService = require('../../src/infrastructure/services/hash.service');

describe('HashService', () => {
  describe('hashPassword', () => {
    test('debe hashear una contraseña correctamente', async () => {
      const password = 'password123';
      const hashedPassword = await hashService.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    test('debe generar hashes diferentes para la misma contraseña', async () => {
      const password = 'password123';
      const hash1 = await hashService.hashPassword(password);
      const hash2 = await hashService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    test('debe lanzar error si no se proporciona contraseña', async () => {
      await expect(hashService.hashPassword()).rejects.toThrow();
    });
  });

  describe('comparePassword', () => {
    test('debe retornar true para contraseña correcta', async () => {
      const password = 'password123';
      const hashedPassword = await hashService.hashPassword(password);
      
      const isMatch = await hashService.comparePassword(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    test('debe retornar false para contraseña incorrecta', async () => {
      const password = 'password123';
      const hashedPassword = await hashService.hashPassword(password);
      
      const isMatch = await hashService.comparePassword('wrongpassword', hashedPassword);
      expect(isMatch).toBe(false);
    });

    test('debe manejar strings vacíos correctamente', async () => {
      const hashedPassword = await hashService.hashPassword('test');
      const isMatch = await hashService.comparePassword('', hashedPassword);
      expect(isMatch).toBe(false);
    });
  });
});

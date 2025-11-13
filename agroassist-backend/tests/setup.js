// Configuración global para las pruebas
require('dotenv').config();

// Mock de variables de entorno para testing
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.OPENAI_API_KEY = 'test-openai-api-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-key';

// Suprimir logs durante tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

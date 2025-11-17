// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock básico de axios
jest.mock('axios');

// Suprimir warnings de console durante tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

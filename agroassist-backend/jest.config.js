module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/node_modules/**',
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};

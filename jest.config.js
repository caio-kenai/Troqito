/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Os apelidos de import (`@/*`) vêm do preset, que os deriva do tsconfig.
  // Redefinir moduleNameMapper aqui substituiria o mapa inteiro do preset,
  // inclusive o de react-native, e carregaria cópias duplicadas dos módulos.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  // O núcleo financeiro e as permissões concentram o risco do produto, então a
  // meta de cobertura é definida por área e não por um número global.
  coverageThreshold: {
    './src/lib/': { statements: 90, branches: 85, functions: 90, lines: 90 },
  },
};

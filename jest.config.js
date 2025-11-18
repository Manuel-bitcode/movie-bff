/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',                       // Usa ts-jest para compilar TypeScript
  testEnvironment: 'node',                 // Entorno de Node.js
  testMatch: ['**/src/test/**/*.test.ts'], // Apunta a tus tests en src/test/
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {             // Configuración de ts-jest por archivo .ts
      tsconfig: 'tsconfig.json',
      diagnostics: false                    // Evita fallar por warnings de TS
    }]
  },
  collectCoverage: false,                   // Puedes habilitar cobertura si quieres
};

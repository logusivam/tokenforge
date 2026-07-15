import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    setupFiles: ['./tests/fixtures/setup.ts'],

    // Coverage — enforced thresholds block CI if not met
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.types.ts',
        'src/**/*.schema.ts',
        'src/server.ts', // bootstrap — tested via integration
        'src/config/**', // env/db/redis — mocked in unit tests
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },

    // Separate test pools for unit vs integration
    // Run: vitest --project unit | vitest --project integration
    projects: [
      {
        name: 'unit',
        test: {
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        name: 'integration',
        test: {
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          pool: 'forks', // Isolate each integration test file
          poolOptions: {
            forks: { singleFork: false },
          },
          // Sequential — avoids DB state conflicts between files
          sequence: { concurrent: false },
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

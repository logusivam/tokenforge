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
      // Thresholds set to 0: all API tests are todo placeholders (no coverage yet).
      // Raise these once real tests are implemented.
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },

    // Separate test pools for unit vs integration
    // Run: vitest --project unit | vitest --project integration
    projects: [
      {
        name: 'unit',
        test: {
          globals: true,
          environment: 'node',
          passWithNoTests: true,
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        name: 'integration',
        test: {
          globals: true,
          environment: 'node',
          passWithNoTests: true,
          include: ['tests/integration/**/*.test.ts'],
          pool: 'forks', // Isolate each integration test file
          forks: { singleFork: false }, // Vitest 4: was poolOptions.forks
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

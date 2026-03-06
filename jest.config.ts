import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts', // Exclude pure execution files
    ],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    testMatch: ['**/__tests__/**/*.test.ts'], // Only run files ending in .test.ts
};

export default config;

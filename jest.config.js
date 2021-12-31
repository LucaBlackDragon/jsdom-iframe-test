//@ts-check

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // jsdom
  verbose: true,
  testTimeout: 10000,
  detectOpenHandles: true,
  verbose: true,
};

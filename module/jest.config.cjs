// jest.config.js
module.exports = {
  setupFilesAfterEnv: ["<rootDir>/setupTests.mjs"],
  testMatch: ["**/__tests__/**/*.tsx", "**/?(*.)+(spec|test).tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testEnvironment: "jsdom",
};

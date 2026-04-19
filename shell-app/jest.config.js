module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.(js|jsx)'],
  moduleNameMapper: {
    '^products_app/ProductList$': '<rootDir>/src/__mocks__/ProductList.jsx',
  },
};

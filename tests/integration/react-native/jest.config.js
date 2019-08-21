const config = {
  preset: 'react-native',
  collectCoverage: false,
  moduleDirectories: ['node_modules', 'test'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest'
  },
  setupFiles: ['<rootDir>/jest/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/jest', '/scripts']
};

module.exports = config;

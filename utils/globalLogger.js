const logger = require('../config/logger');

// Remplacer console.log globalement
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  logger.info(args.join(' '));
  originalConsoleLog(...args);
};

console.error = (...args) => {
  logger.error(args.join(' '));
  originalConsoleError(...args);
};

console.warn = (...args) => {
  logger.warn(args.join(' '));
  originalConsoleWarn(...args);
};

module.exports = logger;

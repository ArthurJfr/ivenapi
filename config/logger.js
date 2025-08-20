const winston = require('winston');
const MongoTransport = require('../utils/mongoTransport');

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Transport MongoDB personnalisé
const mongoTransport = new MongoTransport({
  level: 'info',
  collection: 'logs'
});

// Transport pour les erreurs critiques (niveau error uniquement)
const errorMongoTransport = new MongoTransport({
  level: 'error',
  collection: 'error_logs'
});

// Création du logger
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    mongoTransport,
    errorMongoTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Fonction utilitaire pour logger avec contexte de requête
logger.logWithContext = (level, message, req = null, meta = {}) => {
  const logInfo = {
    level,
    message,
    timestamp: new Date(),
    meta,
    source: 'application'
  };

  if (req) {
    logInfo.req = req;
  }

  logger.log(logInfo);
};

// Fonction utilitaire pour logger les erreurs avec contexte
logger.errorWithContext = (message, error, req = null, meta = {}) => {
  const logInfo = {
    level: 'error',
    message,
    timestamp: new Date(),
    meta: {
      ...meta,
      errorMessage: error.message,
      errorStack: error.stack
    },
    stack: error.stack,
    source: 'application'
  };

  if (req) {
    logInfo.req = req;
  }

  logger.log(logInfo);
};

module.exports = logger; 
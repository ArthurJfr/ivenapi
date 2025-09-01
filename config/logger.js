const winston = require('winston');
const MongoTransport = require('../utils/mongoTransport');

// Détecter si on est en mode test
const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Transports MongoDB seulement si pas en mode test
const transports = [
  // Console avec couleurs
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Ajouter les transports MongoDB seulement si pas en mode test
if (!isTest) {
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

  transports.push(mongoTransport, errorMongoTransport);
}

// Fichier pour les erreurs en production (seulement si pas en test)
if (process.env.NODE_ENV === 'production' && !isTest) {
  transports.push(
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    })
  );
}

// Ajouter des transports pour différents niveaux
const logger = winston.createLogger({
  format: logFormat,
  transports
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
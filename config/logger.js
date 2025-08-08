const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Transport pour les fichiers avec rotation
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', '%DATE%', 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  createSymlink: true,
  symlinkName: 'current.log'
});

// Transport pour les erreurs
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', '%DATE%', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  createSymlink: true,
  symlinkName: 'error.log'
});

// Création du logger
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    fileRotateTransport,
    errorRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger; 
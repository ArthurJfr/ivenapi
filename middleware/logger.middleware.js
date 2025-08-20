const logger = require('../config/logger');

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log de la requête entrante
  logger.logWithContext('info', 'Requête entrante', req, {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Intercepter la réponse pour logger les informations de fin
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log de la réponse
    logger.logWithContext('info', 'Requête terminée', req, {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: duration,
      contentLength: res.get('Content-Length') || 0
    });
  });

  next();
};

module.exports = loggerMiddleware; 
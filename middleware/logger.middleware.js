const logger = require('../config/logger');

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log plus détaillé de la requête
  logger.logWithContext('info', 'Requête entrante', req, {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id, // Si vous avez l'utilisateur authentifié
    body: req.body, // Corps de la requête (attention aux données sensibles)
    query: req.query,
    params: req.params
  });

  // Log de la réponse avec plus de contexte
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.logWithContext(logLevel, 'Requête terminée', req, {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: duration,
      contentLength: res.get('Content-Length') || 0,
      userId: req.user?.id
    });
  });

  next();
};

module.exports = loggerMiddleware; 
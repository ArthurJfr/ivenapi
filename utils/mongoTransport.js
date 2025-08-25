const winston = require('winston');
const Log = require('../models/Log');

class MongoTransport extends winston.Transport {
  constructor(options = {}) {
    super(options);
    this.name = 'mongo';
    this.level = options.level || 'info';
    this.collection = options.collection || 'logs';
    this.capped = options.capped || false;
    this.cappedSize = options.cappedSize || 10000000; // 10MB par défaut
    this.cappedMax = options.cappedMax || 100000; // 100k documents max
  }

  async log(info, callback) {
    try {
      // Extraire les informations de la requête si disponibles
      const logData = {
        level: info.level,
        message: info.message,
        timestamp: new Date(info.timestamp || Date.now()),
        meta: info.meta || {},
        stack: info.stack,
        source: info.source || 'application'
      };

      // Ajouter les informations de requête si disponibles
      if (info.req) {
        logData.ip = info.req.ip;
        logData.userAgent = info.req.get('User-Agent');
        logData.method = info.req.method;
        logData.url = info.req.originalUrl || info.req.url;
        logData.userId = info.req.user?.id;
      }

      // Ajouter les informations de réponse si disponibles
      if (info.res) {
        logData.statusCode = info.res.statusCode;
        logData.responseTime = info.responseTime;
      }

      // Sauvegarder le log dans MongoDB
      const log = new Log(logData);
      await log.save();

      // Appeler le callback de succès
      if (callback) callback(null, true);
    } catch (error) {
      // En cas d'erreur, on log dans la console pour éviter les boucles infinies
      console.error('Erreur lors de la sauvegarde du log dans MongoDB:', error);
      if (callback) callback(error);
    }
  }
}

module.exports = MongoTransport;

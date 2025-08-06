const mongoose = require('mongoose');
const db = require('../config/db');
const logger = require('../config/logger');

/**
 * Contrôleur pour le health check de l'API
 */
class HealthController {
  
  /**
   * Effectue un health check complet de l'API
   * @param {Object} req - Objet de requête Express
   * @param {Object} res - Objet de réponse Express
   */
  static async healthCheck(req, res) {
    try {
      const startTime = Date.now();
      
      // Informations de base du serveur
      const serverInfo = {
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('../package.json').version || '1.0.0'
      };

      // Vérification des services
      const services = await HealthController.checkServices();
      
      // Calcul du temps de réponse
      const responseTime = Date.now() - startTime;
      
      // Détermination du statut global
      const overallStatus = HealthController.determineOverallStatus(services);
      
      const healthResponse = {
        status: overallStatus,
        server: serverInfo,
        services,
        performance: {
          responseTime: `${responseTime}ms`,
          memory: {
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
          }
        }
      };

      // Log du health check
      logger.info('Health check effectué', {
        status: overallStatus,
        responseTime,
        services: Object.keys(services).map(key => ({
          service: key,
          status: services[key].status
        }))
      });

      // Retourner le statut HTTP approprié
      const httpStatus = overallStatus === 'healthy' ? 200 : 503;
      
      res.status(httpStatus).json({
        success: overallStatus === 'healthy',
        data: healthResponse,
        message: `API health check ${overallStatus === 'healthy' ? 'successful' : 'failed'}`
      });

    } catch (error) {
      logger.error('Erreur lors du health check', {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error during health check',
        message: 'API health check failed'
      });
    }
  }

  /**
   * Vérifie l'état de tous les services
   * @returns {Object} État des services
   */
  static async checkServices() {
    const services = {};

    // Vérification MongoDB
    try {
      const mongoState = mongoose.connection.readyState;
      const mongoStatus = {
        1: 'connected',
        2: 'connecting', 
        3: 'disconnecting',
        0: 'disconnected'
      };

      if (mongoState === 1) {
        // Test d'une requête simple pour vérifier que la DB répond
        await mongoose.connection.db.admin().ping();
        services.mongodb = {
          status: 'healthy',
          state: mongoStatus[mongoState],
          message: 'MongoDB is connected and responding'
        };
      } else {
        services.mongodb = {
          status: 'unhealthy',
          state: mongoStatus[mongoState],
          message: 'MongoDB is not connected'
        };
      }
    } catch (error) {
      services.mongodb = {
        status: 'unhealthy',
        state: 'error',
        message: `MongoDB error: ${error.message}`
      };
    }

    // Vérification MySQL
    try {
      const [result] = await db.query('SELECT 1 as test');
      if (result && result[0] && result[0].test === 1) {
        services.mysql = {
          status: 'healthy',
          message: 'MySQL is connected and responding'
        };
      } else {
        services.mysql = {
          status: 'unhealthy',
          message: 'MySQL query returned unexpected result'
        };
      }
    } catch (error) {
      services.mysql = {
        status: 'unhealthy',
        message: `MySQL error: ${error.message}`
      };
    }

    return services;
  }

  /**
   * Détermine le statut global basé sur l'état des services
   * @param {Object} services - État des services
   * @returns {string} Statut global ('healthy', 'degraded', 'unhealthy')
   */
  static determineOverallStatus(services) {
    const serviceStatuses = Object.values(services).map(service => service.status);
    
    if (serviceStatuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else if (serviceStatuses.some(status => status === 'healthy')) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  /**
   * Effectue un health check protégé avec informations utilisateur
   * @param {Object} req - Objet de requête Express (avec req.user)
   * @param {Object} res - Objet de réponse Express
   */
  static async healthCheckProtected(req, res) {
    try {
      const startTime = Date.now();
      
      // Informations de base du serveur
      const serverInfo = {
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('../package.json').version || '1.0.0'
      };

      // Informations de l'utilisateur connecté
      const userInfo = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role || 'user',
        lastLogin: req.user.lastLogin || null
      };

      // Vérification des services
      const services = await HealthController.checkServices();
      
      // Calcul du temps de réponse
      const responseTime = Date.now() - startTime;
      
      // Détermination du statut global
      const overallStatus = HealthController.determineOverallStatus(services);
      
      const healthResponse = {
        status: overallStatus,
        server: serverInfo,
        user: userInfo,
        services,
        performance: {
          responseTime: `${responseTime}ms`,
          memory: {
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
          }
        },
        security: {
          authenticated: true,
          tokenValid: true,
          userAuthorized: true
        }
      };

      // Log du health check protégé
      logger.info('Health check protégé effectué', {
        userId: req.user.id,
        username: req.user.username,
        status: overallStatus,
        responseTime,
        services: Object.keys(services).map(key => ({
          service: key,
          status: services[key].status
        }))
      });

      // Retourner le statut HTTP approprié
      const httpStatus = overallStatus === 'healthy' ? 200 : 503;
      
      res.status(httpStatus).json({
        success: overallStatus === 'healthy',
        data: healthResponse,
        message: `Protected health check ${overallStatus === 'healthy' ? 'successful' : 'failed'} for user ${req.user.username}`
      });

    } catch (error) {
      logger.error('Erreur lors du health check protégé', {
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error during protected health check',
        message: 'Protected API health check failed'
      });
    }
  }
}

module.exports = HealthController;
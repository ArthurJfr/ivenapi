const Log = require('../models/Log');
const LogManager = require('../utils/logManager');
const logger = require('../config/logger');

const logController = {
  // Obtenir les logs récents avec pagination
  async getRecentLogs(req, res) {
    try {
      const { 
        level, 
        limit = 50, 
        page = 1, 
        days = 7,
        userId,
        search 
      } = req.query;

      const skip = (page - 1) * limit;
      
      // Construire la requête de base
      let query = {};
      
      // Filtrer par niveau si spécifié
      if (level && ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'].includes(level)) {
        query.level = level;
      }
      
      // Filtrer par utilisateur si spécifié
      if (userId) {
        query.userId = userId;
      }
      
      // Filtrer par période si spécifiée
      if (days) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        query.timestamp = { $gte: startDate };
      }
      
      // Recherche textuelle si spécifiée
      if (search) {
        query.$or = [
          { message: { $regex: search, $options: 'i' } },
          { 'meta.method': { $regex: search, $options: 'i' } },
          { 'meta.url': { $regex: search, $options: 'i' } }
        ];
      }

      // Récupérer les logs avec pagination
      const logs = await Log.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('userId', 'username email fname lname')
        .lean();

      // Compter le total pour la pagination
      const total = await Log.countDocuments(query);
      
      // Calculer les informations de pagination
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info('Logs récupérés avec succès', {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        results: logs.length
      });

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage,
            hasPrevPage
          }
        },
        message: `${logs.length} logs récupérés sur ${total}`
      });

    } catch (error) {
      logger.error('Erreur lors de la récupération des logs', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs',
        error: error.message
      });
    }
  },

  // Obtenir les statistiques des logs
  async getLogStats(req, res) {
    try {
      const { days = 7 } = req.query;
      
      const stats = await LogManager.getLogStats(parseInt(days));
      
      // Calculer les totaux par niveau
      const levelCounts = {};
      let totalLogs = 0;
      
      stats.forEach(stat => {
        const level = stat._id.level;
        const count = stat.count;
        levelCounts[level] = (levelCounts[level] || 0) + count;
        totalLogs += count;
      });

      logger.info('Statistiques des logs récupérées avec succès', { days: parseInt(days) });

      res.json({
        success: true,
        data: {
          period: `${days} jours`,
          totalLogs,
          levelCounts,
          dailyStats: stats
        },
        message: 'Statistiques des logs récupérées avec succès'
      });

    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  },

  // Obtenir les logs d'erreur récents
  async getErrorLogs(req, res) {
    try {
      const { limit = 20, page = 1 } = req.query;
      const skip = (page - 1) * limit;

      const errorLogs = await Log.find({ level: 'error' })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('userId', 'username email fname lname')
        .lean();

      const total = await Log.countDocuments({ level: 'error' });
      const totalPages = Math.ceil(total / limit);

      logger.info('Logs d\'erreur récupérés avec succès', { total, results: errorLogs.length });

      res.json({
        success: true,
        data: {
          logs: errorLogs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        },
        message: `${errorLogs.length} logs d'erreur récupérés`
      });

    } catch (error) {
      logger.error('Erreur lors de la récupération des logs d\'erreur', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs d\'erreur',
        error: error.message
      });
    }
  },

  // Obtenir les logs d'un utilisateur spécifique
  async getUserLogs(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, page = 1, level } = req.query;
      const skip = (page - 1) * limit;

      let query = { userId };
      if (level) {
        query.level = level;
      }

      const userLogs = await Log.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('userId', 'username email fname lname')
        .lean();

      const total = await Log.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      logger.info('Logs utilisateur récupérés avec succès', { userId, total, results: userLogs.length });

      res.json({
        success: true,
        data: {
          logs: userLogs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        },
        message: `${userLogs.length} logs utilisateur récupérés`
      });

    } catch (error) {
      logger.error('Erreur lors de la récupération des logs utilisateur', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des logs utilisateur',
        error: error.message
      });
    }
  },

  // Nettoyer les anciens logs (admin et superadmin seulement)
  async cleanOldLogs(req, res) {
    try {
      const { days = 30 } = req.query;
      
      // Ajouter une vérification de sécurité supplémentaire
      if (req.userRole === 'admin' && parseInt(days) < 7) {
        return res.status(403).json({
          success: false,
          message: 'Les administrateurs ne peuvent pas supprimer les logs de moins de 7 jours'
        });
      }
      
      const deletedCount = await LogManager.cleanOldLogs(parseInt(days));
      
      logger.info('Anciens logs nettoyés avec succès', { 
        days: parseInt(days), 
        deletedCount,
        userRole: req.userRole 
      });

      res.json({
        success: true,
        data: {
          deletedCount,
          daysKept: parseInt(days)
        },
        message: `${deletedCount} anciens logs supprimés (conservés: ${days} jours)`
      });

    } catch (error) {
      logger.error('Erreur lors du nettoyage des logs', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Erreur lors du nettoyage des logs',
        error: error.message
      });
    }
  },

  // Supprimer TOUS les logs (superadmin seulement)
  async cleanAllLogs(req, res) {
    try {
      // Vérification de sécurité supplémentaire
      if (req.userRole !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Seuls les superadmins peuvent supprimer tous les logs'
        });
      }

      const deletedCount = await LogManager.cleanAllLogs();
      
      logger.info('Tous les logs supprimés avec succès', { 
        deletedCount,
        userRole: req.userRole 
      });

      res.json({
        success: true,
        data: {
          deletedCount
        },
        message: `${deletedCount} logs supprimés de la base de données`
      });

    } catch (error) {
      logger.error('Erreur lors de la suppression de tous les logs', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de tous les logs',
        error: error.message
      });
    }
  }
};

module.exports = logController;

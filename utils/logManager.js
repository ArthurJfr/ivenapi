const Log = require('../models/Log');
const logger = require('../config/logger');

class LogManager {
  // Nettoyer les anciens logs
  static async cleanOldLogs(daysToKeep = 30) {
    try {
      const deletedCount = await Log.cleanOldLogs(daysToKeep);
      logger.info(`🧹 ${deletedCount} anciens logs supprimés`);
      return deletedCount;
    } catch (error) {
      logger.error('❌ Erreur lors du nettoyage des logs:', error);
      throw error;
    }
  }

  // Supprimer TOUS les logs
  static async cleanAllLogs() {
    try {
      const deletedCount = await Log.deleteMany({});
      console.log(`🗑️ ${deletedCount} logs supprimés de la base de données`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de tous les logs:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des logs
  static async getLogStats(days = 7) {
    try {
      const stats = await Log.getLogStats(days);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Obtenir les logs par niveau
  static async getLogsByLevel(level, limit = 100, skip = 0) {
    try {
      const logs = await Log.find({ level })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);
      return logs;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs:', error);
      throw error;
    }
  }

  // Obtenir les logs d'un utilisateur spécifique
  static async getUserLogs(userId, limit = 100, skip = 0) {
    try {
      const logs = await Log.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);
      return logs;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs utilisateur:', error);
      throw error;
    }
  }

  // Rechercher dans les logs
  static async searchLogs(query, options = {}) {
    try {
      const { level, startDate, endDate, userId, limit = 100, skip = 0 } = options;
      
      let searchQuery = {};
      
      if (query) {
        searchQuery.$text = { $search: query };
      }
      
      if (level) {
        searchQuery.level = level;
      }
      
      if (startDate || endDate) {
        searchQuery.timestamp = {};
        if (startDate) searchQuery.timestamp.$gte = new Date(startDate);
        if (endDate) searchQuery.timestamp.$lte = new Date(endDate);
      }
      
      if (userId) {
        searchQuery.userId = userId;
      }

      const logs = await Log.find(searchQuery)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);
      
      return logs;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche dans les logs:', error);
      throw error;
    }
  }
}

module.exports = LogManager;

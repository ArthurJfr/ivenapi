const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stack: {
    type: String
  },
  source: {
    type: String,
    default: 'application'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  method: {
    type: String
  },
  url: {
    type: String
  },
  statusCode: {
    type: Number
  },
  responseTime: {
    type: Number
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ source: 1, timestamp: -1 });

// Méthode statique pour nettoyer les anciens logs
logSchema.statics.cleanOldLogs = async function(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  try {
    const result = await this.deleteMany({ timestamp: { $lt: cutoffDate } });
    return result.deletedCount;
  } catch (error) {
    console.error('Erreur lors du nettoyage des logs:', error);
    throw error;
  }
};

// Méthode statique pour obtenir les statistiques des logs
logSchema.statics.getLogStats = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  try {
    const stats = await this.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            level: '$level',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1, '_id.level': 1 }
      }
    ]);
    
    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

module.exports = mongoose.model('Log', logSchema);

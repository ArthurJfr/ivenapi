const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Vérifie que l'utilisateur authentifié possède un rôle suffisant.
 * Utilise `req.user.id` (fourni par l'auth middleware) pour récupérer le rôle
 * et le comparer à la hiérarchie.
 *
 * @param {('user'|'admin'|'superadmin')} requiredRole Rôle minimum requis
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>}
 */
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Récupérer l'ID utilisateur depuis req.user (déjà décodé par auth.middleware)
      const userId = req.user?.id; // Changé de req.user?.userId à req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Token d\'authentification requis'
        });
      }

      // Récupérer le rôle de l'utilisateur
      const userRole = await User.getUserRole(userId);
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Rôle utilisateur non trouvé'
        });
      }

      // Vérifier les permissions selon la hiérarchie des rôles
      const roleHierarchy = {
        'user': 1,
        'admin': 2,
        'superadmin': 3
      };

      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        logger.warn('Tentative d\'accès non autorisé', {
          userId,
          userRole,
          requiredRole,
          endpoint: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          message: `Accès refusé. Rôle requis: ${requiredRole}`
        });
      }

      // Ajouter le rôle à la requête pour utilisation ultérieure
      req.userRole = userRole;
      next();

    } catch (error) {
      logger.error('Erreur lors de la vérification du rôle', { error: error.message });
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  };
};

module.exports = { requireRole };

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

// Middleware combiné : authentification + vérification de rôle
const requireAuthAndRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // 1. Vérification du token
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: 'Token manquant' 
        });
      }

      // 2. Décodage du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      // 3. Vérification du rôle
      const userRole = user.role;
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Rôle utilisateur non trouvé'
        });
      }

      // 4. Vérification des permissions
      const roleHierarchy = {
        'user': 1,
        'admin': 2,
        'superadmin': 3
      };

      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        logger.warn('Tentative d\'accès non autorisé', {
          userId: user.id,
          userRole,
          requiredRole,
          endpoint: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          message: `Accès refusé. Rôle requis: ${requiredRole}`
        });
      }

      // 5. Ajouter les informations à la requête
      req.user = user;
      req.userRole = userRole;
      next();

    } catch (error) {
      logger.error('Erreur lors de la vérification d\'authentification et de rôle', { error: error.message });
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
  };
};

module.exports = { requireAuthAndRole };

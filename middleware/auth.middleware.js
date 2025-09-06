const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware d'authentification JWT.
 * Extrait le token depuis l'en-tête Authorization, vérifie la signature,
 * charge l'utilisateur et l'attache à `req.user`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = authMiddleware; 
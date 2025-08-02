const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fileManager = require('../utils/fileManager');
const { sendConfirmationEmail, sendResetPasswordEmail } = require('../utils/emailService');
const logger = require('../config/logger');
const emailService = require('../utils/emailService');

const authController = {
  async register(req, res) {
    try {
      const { email, password, username, fname, lname } = req.body;

      logger.info('Début inscription:', { email, username });

      // Vérification utilisateur existant
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Création de l'utilisateur
      const hashedPassword = await bcrypt.hash(password, 6);

      // const defaultRole = process.env.DEFAULT_ROLE;
      const userId = await User.create({
        username,
        email,
        password: hashedPassword,
        // role: defaultRole,
        active: 0,
        fname: fname,
        lname: lname
      });

      // Tentative d'envoi de l'email
      try {
        await emailService.sendConfirmationEmail(email, username);
        logger.info('Email de confirmation envoyé', { email });
        
        res.status(201).json({
          message: 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
          userId
        });
      } catch (emailError) {
        logger.error('Erreur envoi email:', emailError);
        
        // On informe l'utilisateur mais on ne bloque pas l'inscription
        res.status(201).json({
          message: 'Inscription réussie ! L\'envoi de l\'email de confirmation a échoué, veuillez contacter le support.',
          userId
        });
      }

    } catch (error) {
      logger.error('Erreur inscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email); 
      if (!user) {
        return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' });
      }
      

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
      if (user.active === 0) {
        return res.status(200).json({
          message: 'Votre compte n\'est pas activé',
          code: 'not-activated',
          user: {
            //id: user.id,
            username: user.username,
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            roles: user.roles,
            active: user.active
          }
        });
      }
   

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          active: user.active
        }
      });

    } catch (error) {
      console.error('Erreur login:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email' });
      }

      const resetToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      await User.updateResetToken(user.id, resetToken);
      
      // Envoi de l'email
      await sendResetPasswordEmail(email, resetToken);

      res.json({ 
        message: 'Instructions de réinitialisation envoyées par email'
      });

    } catch (error) {
      console.error('Erreur forgot-password:', error);
      res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
    }
  },

  async confirmEmail(req, res) {
    try {
      // Le token est dans le body de la requête, pas dans les query params
      const { token } = req.body;
      
      if (!token) {
        return res.status(200).json({ 
          message: 'Token manquant',
          error: 'Le token est requis'
        });
      }

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.email) {
        return res.status(400).json({ 
          message: 'Token invalide',
          error: 'Le token ne contient pas d\'email'
        });
      }

      logger.info('Confirmation email - token décodé:', { email: decoded.email });

      // Activer le compte
      await User.activateAccount(decoded.email);

      res.json({ 
        message: 'Compte activé avec succès',
        email: decoded.email 
      });

    } catch (error) {
      logger.error('Erreur confirmation email:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ 
          message: 'Token invalide',
          error: error.message 
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ 
          message: 'Token expiré',
          error: 'Le lien de confirmation a expiré. Veuillez demander un nouveau lien.'
        });
      }

      res.status(500).json({ 
        message: 'Erreur lors de la confirmation du compte',
        error: error.message 
      });
    }
  },

  async resendConfirmationEmail(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email' });
      }

      await emailService.sendConfirmationEmail(email, user.username);  

      res.json({ message: 'Email de confirmation envoyé' });

    } catch (error) {
      logger.error('Erreur envoi email:', error);
      res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email de confirmation' });
    }
  }
};

module.exports = authController;
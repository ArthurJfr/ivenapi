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

      const defaultRole = 'user'; // Rôle par défaut
      const userId = await User.create({
        username,
        email,
        password: hashedPassword,
        role: defaultRole,
        active: 0,
        fname: fname,
        lname: lname
      });

      // Génération du code de confirmation à 6 chiffres
      const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Sauvegarde du code en base
      await User.setConfirmationCode(email, confirmationCode);

      // Tentative d'envoi de l'email
      try {
        await emailService.sendConfirmationEmail(email, username, confirmationCode);
        logger.info('Email de confirmation envoyé', { email });
        
        res.status(201).json({
          message: 'Inscription réussie ! Un code de confirmation à 6 chiffres a été envoyé à votre email.',
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
          role: user.role,
          active: user.active,
          fname: user.fname,
          lname: user.lname
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
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ 
          message: 'Email et code sont requis',
          error: 'Veuillez fournir votre email et le code de confirmation'
        });
      }

      // Vérifier que le code fait bien 4 chiffres
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ 
          message: 'Code invalide',
          error: 'Le code doit contenir exactement 6 chiffres'
        });
      }

      logger.info('Tentative de confirmation avec code:', { email, code });

      // Vérifier le code
      const isValidCode = await User.verifyConfirmationCode(email, code);
      
      if (!isValidCode) {
        return res.status(400).json({ 
          message: 'Code invalide ou expiré',
          error: 'Le code de confirmation est incorrect ou a expiré. Veuillez demander un nouveau code.'
        });
      }

      // Activer le compte et supprimer le code
      await User.activateAccount(email);
      await User.clearConfirmationCode(email);

      logger.info('Compte activé avec succès:', { email });
      //Login automatique
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '72h' }
      );

      res.json({ 
        message: 'Compte activé avec succès',
        email: email,
        token: token,
        user: {
          id: user.id,
          username: user.username,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          active: user.active
        }
      });

    } catch (error) {
      logger.error('Erreur confirmation email:', error);

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

      if (user.active === 1) {
        return res.status(400).json({ message: 'Ce compte est déjà activé' });
      }

      // Génération d'un nouveau code de confirmation à 4 chiffres
      const confirmationCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Sauvegarde du nouveau code en base
      await User.setConfirmationCode(email, confirmationCode);

      await emailService.sendConfirmationEmail(email, user.username, confirmationCode);  

      res.json({ message: 'Nouveau code de confirmation envoyé par email' });

    } catch (error) {
      logger.error('Erreur envoi email:', error);
      res.status(500).json({ message: 'Erreur lors de l\'envoi du code de confirmation' });
    }
  },

  async logout(req, res) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: 'Token non fourni' });
      }

    //  await User.updateLastLogin(userId); 

      res.json({ message: 'Déconnexion réussie' });

    } catch (error) {
      logger.error('Erreur logout:', error);
      res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
  },

  async isConnected(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(201).json({
          message: 'Aucun token fourni',
          isConnected: false
        });
      }

      try {
        // Vérifier le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Récupérer les informations de l'utilisateur
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return res.status(201).json({
            message: 'Utilisateur non trouvé',
            isConnected: false
          });
        }

        // Token valide et utilisateur trouvé
        return res.status(200).json({
          message: 'Utilisateur connecté',
          isConnected: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            active: user.active,
            fname: user.fname,
            lname: user.lname
          }
        });

      } catch (jwtError) {
        // Token expiré ou invalide
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(201).json({
            message: 'Token expiré',
            isConnected: false
          });
        }
        
        // Autre erreur JWT
        return res.status(201).json({
          message: 'Token invalide',
          isConnected: false
        });
      }

    } catch (error) {
      logger.error('Erreur vérification connexion:', error);
      return res.status(201).json({
        message: 'Erreur lors de la vérification de la connexion',
        isConnected: false
      });
    }
  },
  async getUserById(req, res) {
    try {
      const user = await User.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      logger.error('Erreur récupération utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  },
  
  async updateUser(req, res) {
    try {
      const user = await User.updateUser(req.params.id, req.body);
      const updatedUser = await User.findById(req.params.id);
      res.json(updatedUser);
    } catch (error) {
      logger.error('Erreur mise à jour utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
  }
};



module.exports = authController;
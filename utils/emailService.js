const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      // Ajouter des options de timeout
      tls: {
        rejectUnauthorized: false // Utile en développement
      },
      pool: true, // Utiliser le pooling de connexions
      maxConnections: 5,
      maxMessages: 100
    });

    // Vérifier la connexion au démarrage
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Connexion SMTP établie avec succès');
    } catch (error) {
      logger.error('Erreur de connexion SMTP:', error);
      // Ne pas bloquer le démarrage de l'application
    }
  }

  async sendConfirmationEmail(email, username) {
    try {
      // Vérifier les paramètres requis
      if (!email || !username) {
        throw new Error('Email et username sont requis');
      }

      // Vérifier la configuration SMTP
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        throw new Error('Configuration SMTP manquante');
      }

      const confirmationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const confirmationLink = `${process.env.FRONTEND_URL}/auth/confirm-email?token=${confirmationToken}`;

      const mailOptions = {
        from: {
          name: 'Iven',
          address: process.env.SMTP_FROM
        },
        to: email,
        subject: 'Confirmation de votre compte',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Bonjour ${username},</h2>
            <p>Merci de confirmer votre compte en cliquant sur le lien ci-dessous :</p>
            <p><a href="${confirmationLink}">Confirmer mon compte</a></p>
            <p>Ce lien est valable pendant 24 heures.</p>
            <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          </div>
        `
      };

      // Tentative d'envoi avec retry
      let attempts = 3;
      while (attempts > 0) {
        try {
          const info = await this.transporter.sendMail(mailOptions);
          logger.info('Email de confirmation envoyé', { 
            messageId: info.messageId,
            email 
          });
          return true;
        } catch (error) {
          attempts--;
          if (attempts === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant retry
        }
      }

    } catch (error) {
      logger.error('Erreur détaillée envoi email:', {
        error: error.message,
        code: error.code,
        command: error.command,
        stack: error.stack
      });
      throw new Error('Erreur lors de l\'envoi de l\'email de confirmation');
    }
  }

  async sendResetPasswordEmail(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'Iven',
        address: process.env.SMTP_FROM
      },
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
          <p><a href="${resetLink}">Réinitialiser mon mot de passe</a></p>
          <p>Ce lien est valable pendant 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }
}

// Créer une instance unique
const emailService = new EmailService();

module.exports = emailService; 
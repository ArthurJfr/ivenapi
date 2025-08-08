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

  async sendConfirmationEmail(email, username, confirmationCode) {
    try {
      // Vérifier les paramètres requis
      if (!email || !username || !confirmationCode) {
        throw new Error('Email, username et code de confirmation sont requis');
      }

      // Vérifier la configuration SMTP
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        throw new Error('Configuration SMTP manquante');
      }

      const mailOptions = {
        from: {
          name: 'Iven',
          address: process.env.SMTP_FROM
        },
        to: email,
        subject: 'Code de confirmation de votre compte',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Bonjour ${username},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">Merci de vous être inscrit ! Pour confirmer votre compte, veuillez saisir le code de confirmation suivant dans votre application :</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #007bff; color: white; padding: 20px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
                  ${confirmationCode}
                </div>
              </div>
              
              <p style="color: #666; font-size: 14px; text-align: center;">Ce code est valable pendant 1 heure.</p>
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
            </div>
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
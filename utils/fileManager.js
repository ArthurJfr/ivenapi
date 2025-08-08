const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const logger = require('../config/logger');
const User = require('../models/User');

const fileManager = {
  async saveProfilePicture(base64String, prefix) {
    try {
      // Vérifier si la chaîne est vide ou invalide
      if (!base64String || !base64String.startsWith('data:image')) {
        logger.error('Format d\'image invalide');
        return null;
      }

      // Extraire le type d'image et les données base64
      const matches = base64String.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches) {
        logger.error('Format base64 invalide');
        return null;
      }

      const imageType = matches[1];  // png dans votre cas
      const base64Data = matches[2]; // les données réelles en base64

      // Convertir en buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Créer le nom de fichier
      const fileName = `${prefix}_${Date.now()}.${imageType}`;
      const filePath = path.join('uploads', 'profiles', fileName);
      const fullPath = path.join(process.cwd(), filePath);

      // Assurer que le dossier existe
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      // Traiter et sauvegarder l'image
      await sharp(imageBuffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        // Conserver le format PNG pour une meilleure qualité
        .png({ quality: 80 })
        .toFile(fullPath);

      logger.info('Image sauvegardée avec succès:', filePath);
      return `/${filePath.replace(/\\/g, '/')}`;

    } catch (error) {
      logger.error('Erreur lors de la sauvegarde de l\'image:', error);
      return null;
    }
  },
  async getProfilePicture(userId) {
    try {
      const user = await User.findById(userId);
      return user.profile_picture;
    } catch (error) {
      logger.error('Erreur récupération photo de profil:', error);  
      return null;
    }
  },

  async deleteFile(filePath) {
    try {
      if (!filePath) return;
      
      const absolutePath = path.join(process.cwd(), filePath.replace('/', ''));
      await fs.unlink(absolutePath);
      logger.info('Fichier supprimé avec succès:', filePath);
    } catch (error) {
      logger.error('Erreur suppression fichier:', error);
    }
  }
};

module.exports = fileManager; 
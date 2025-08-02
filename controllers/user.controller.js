const fs = require('fs').promises;
const path = require('path');
const User = require('../models/User');
const sharp = require('sharp');
const logger = require('../config/logger');
const fileManager = require('../utils/fileManager');

const userController = {
  async updateProfilePicture(req, res) {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'Aucune image fournie' });
      }

      const userId = req.user.id;
      const fileExtension = req.file.mimetype.split('/')[1];
      const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
      const filePath = path.join('uploads/profiles', fileName);

      // Optimisation de l'image
      const optimizedImageBuffer = await sharp(req.file.buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Sauvegarde de l'image optimisée
      await fs.writeFile(path.join(process.cwd(), filePath), optimizedImageBuffer);

      // Suppression de l'ancienne photo
      const oldPicture = await User.getProfilePicture(userId);
      if (oldPicture) {
        try {
          await fs.unlink(path.join(process.cwd(), oldPicture.replace('/', '')));
        } catch (error) {
          logger.error('Erreur suppression ancienne photo:', error);
        }
      }

      // Mise à jour en base de données
      await User.updateProfilePicture(userId, `/${filePath}`);

      logger.info('Photo de profil mise à jour', { userId, filePath });

      res.json({
        message: 'Photo de profil mise à jour avec succès',
        profilePicture: `/${filePath}`
      });

    } catch (error) {
      logger.error('Erreur mise à jour photo:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la photo de profil' });
    }
  },
  getProfilePicture: async (req, res) => {
    try {
      const username = req.params.username;
      const profilePicture = await fileManager.getProfilePicture(username);
      if (!profilePicture) {
        return res.status(404).json({ error: 'Photo de profil non trouvée' });
      }
      res.json({ profilePicture });
    } catch (error) {
      logger.error('Erreur récupération photo de profil:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la photo de profil' });
    }
  },
  async getUserByUsername(req, res) {
    try {
      const username = req.params.username;
      const user = await User.getUserByUsername(username);
      res.json(user);
    } catch (error) {
      logger.error('Erreur récupération utilisateur:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  },
  async getOnlineUsers(req, res) {
    try {
      //const { id } = req.params;
      const onlineUsers = await MinecraftService.getOnlinePlayers(process.env.SERVER_MINECRAFT_HOST, process.env.SERVER_MINECRAFT_PORT);

      res.json(onlineUsers);
    } catch (error) {
      console.error('Erreur récupération entreprise:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs en ligne' });
    }
  }, 
};

module.exports = userController; 
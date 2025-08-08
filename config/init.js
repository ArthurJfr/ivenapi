const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const initializeUploadDirectories = async () => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const profilesDir = path.join(uploadsDir, 'profiles');

    await fs.mkdir(uploadsDir, { recursive: true, mode: 0o755 });
    await fs.mkdir(profilesDir, { recursive: true, mode: 0o755 });

    logger.info('✅ Dossiers d\'upload initialisés avec succès');
  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation des dossiers d\'upload:', error);
    throw error;
  }
};

module.exports = { initializeUploadDirectories }; 
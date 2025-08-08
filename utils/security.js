const path = require('path');
const crypto = require('crypto');

const sanitizeFilename = (filename) => {
  // Supprime les caractères dangereux
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Ajoute un hash pour éviter les collisions
  const hash = crypto.createHash('md5').update(filename).digest('hex').slice(0, 8);
  
  return `${hash}_${sanitized}`;
};

module.exports = { sanitizeFilename }; 
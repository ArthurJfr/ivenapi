const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
require("dotenv").config(); 
const mongoose = require("mongoose");
const db = require('./config/db'); // Import de la connexion MySQL
const authRoutes = require('./routes/auth.route');
const adminRoutes = require('./routes/admin.route');
const healthRoutes = require('./routes/health.route');
const logger = require('./config/logger');
const loggerMiddleware = require('./middleware/logger.middleware');
const { initializeUploadDirectories } = require('./config/init');

// Test de la connexion MySQL
const testMySQLConnection = async () => {
  try {
    const [result] = await db.query('SELECT 1');
    logger.info('Connexion MySQL établie avec succès');
  } catch (error) {
    logger.error('Erreur de connexion MySQL', { error: error.message });
    process.exit(1); // Arrêt du serveur en cas d'échec de connexion
  }
};

// Middlewares CORS
app.use(cors({
  origin: '*',
 // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
 // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middlewares bodyParser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("✅Connected to MongoDB");
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
//app.use('/api/articles', articleRoutes);
app.get("/", (req, res) => {
  res.send("Bonjour le monde");
});

// Ajoutez le middleware de logging
app.use(loggerMiddleware);

// Modifiez la gestion des erreurs globales
app.use((err, req, res, next) => {
  logger.error('Erreur serveur non gérée', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({ message: 'Erreur serveur interne' });
});

// Initialisation des dossiers
initializeUploadDirectories()
  .then(() => {
    console.log('📁 Système de fichiers initialisé');
    
    // Configuration du serveur statique
    app.use('/uploads', express.static('uploads', {
      maxAge: '1d', // Cache client d'un jour
      index: false, // Désactive l'affichage du contenu du dossier
      dotfiles: 'deny' // Cache les fichiers commençant par un point
    }));
  })
  .catch(error => {
    console.error('Erreur fatale lors de l\'initialisation:', error);
    process.exit(1);
  });

// Test de la connexion MySQL avant de démarrer le serveur
testMySQLConnection().then(() => {
  const port = process.env.PORT || 3000;
  const host = '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
  });
});

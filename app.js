const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit');

// Détecter si on est en mode test
const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;

const authRoutes = require('./routes/auth.route');
const healthRoutes = require('./routes/health.route');
const logger = require('./config/logger');
const loggerMiddleware = require('./middleware/logger.middleware');
const eventRoutes = require('./routes/event.route');
const taskRoutes = require('./routes/task.route');
const logRoutes = require('./routes/log.route');

// Middlewares CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Rate limiting (global + auth plus strict)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Middlewares bodyParser (limites réduites)
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true, parameterLimit: 1000 }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/task', taskRoutes);

// Routes de logs seulement si pas en mode test
if (!isTest) {
  app.use('/api/logs', logRoutes);
}

// Middleware de logging seulement si pas en mode test
if (!isTest) {
  app.use(loggerMiddleware);
}

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  if (!isTest) {
    logger.error('Erreur serveur non gérée', {
      error: err.message,
      stack: err.stack,
      path: req.path
    });
  }
  res.status(500).json({ message: 'Erreur serveur interne' });
});

module.exports = app;



const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { validateQuery } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/reports/progress - Reporte de progreso
router.get('/progress',
  authenticate,
  validateQuery('generateReport'),
  reportController.generateProgressReport
);

// GET /api/reports/dashboard - Estadísticas del dashboard
router.get('/dashboard',
  authenticate,
  reportController.getDashboardStats
);

// GET /api/reports/export - Exportar reporte
router.get('/export',
  authenticate,
  reportController.exportReport
);

module.exports = router;
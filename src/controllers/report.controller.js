const reportService = require('../services/report.service');

class ReportController {
  async generateProgressReport(req, res) {
    try {
      const { startDate, endDate, reportType, groupBy, exerciseId } = req.query;
      let report;
      switch (reportType) {
        case 'volume':
          report = await reportService.generateVolumeReport(
            req.user.id,
            startDate,
            endDate
          );
          break;
        
        case 'frequency':
          report = await reportService.generateFrequencyReport(
            req.user.id,
            startDate,
            endDate
          );
          break;
        
        case 'strength':
          if (!exerciseId) {
            return res.status(400).json({
              success: false,
              message: 'Exercise ID required for strength report',
              code: 'EXERCISE_ID_REQUIRED'
            });
          }
          report = await reportService.generateStrengthProgressReport(
            req.user.id,
            exerciseId,
            startDate,
            endDate
          );
          break;
        
        case 'body':
          report = await reportService.generateBodyMetricsReport(
            req.user.id,
            startDate,
            endDate
          );
          break;
        
        case 'goals':
          report = await reportService.generateGoalProgressReport(req.user.id);
          break;
        
        case 'dashboard':
          report = await reportService.generateDashboardStats(req.user.id);
          break;
        
        default: // progress
          report = await reportService.generateProgressReport(
            req.user.id,
            startDate,
            endDate,
            groupBy
          );
      }

      res.json({
        success: true,
        data: report,
        metadata: {
          startDate,
          endDate,
          reportType,
          groupBy,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report',
        code: 'REPORT_GENERATION_ERROR'
      });
    }
  }

  async exportReport(req, res) {
    try {
      const { startDate, endDate, reportType, format = 'json' } = req.query;

      // Generar reporte
      const report = await reportService.generateProgressReport(
        req.user.id,
        startDate,
        endDate
      );

      // Exportar en diferentes formatos
      switch (format) {
        case 'csv':
          // Convertir a CSV
          const csv = this.convertToCSV(report);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.csv`);
          return res.send(csv);
        
        case 'pdf':
          // En una implementación real, usarías una librería como pdfkit
          return res.status(501).json({
            success: false,
            message: 'PDF export not implemented yet',
            code: 'PDF_EXPORT_NOT_IMPLEMENTED'
          });
        
        default: // json
          return res.json({
            success: true,
            data: report
          });
      }
    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        code: 'REPORT_EXPORT_ERROR'
      });
    }
  }

  convertToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row)
        .map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        )
        .join(',')
    );

    return [headers, ...rows].join('\n');
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await reportService.generateDashboardStats(req.user.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        code: 'DASHBOARD_STATS_ERROR'
      });
    }
  }
}

module.exports = new ReportController();
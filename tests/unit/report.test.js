// tests/unit/report.service.test.js
jest.mock('../../src/utils/database', () => ({
  query: jest.fn(),
}));
const ReportService = require('../../src/services/report.service');
const db = require('../../src/utils/database');

describe('ReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
    describe('generateProgressReport', () => {
    it('generates progress report grouped by week', async () => {
      const rows = [{ period: '2024-01-01', workout_count: 5 }];
      db.query.mockResolvedValue({ rows });

      const result = await ReportService.generateProgressReport(
        1,
        '2024-01-01',
        '2024-01-31'
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("DATE_TRUNC('week'"),
        [1, '2024-01-01', '2024-01-31']
      );

      expect(result).toEqual(rows);
    });
    it('groups progress report by exercise', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await ReportService.generateProgressReport(
        1,
        '2024-01-01',
        '2024-01-31',
        'exercise'
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN exercises'),
        expect.any(Array)
      );
    });
  });
  describe('generateVolumeReport', () => {
    it('returns volume report', async () => {
      const rows = [{ exercise_name: 'Bench Press', total_volume: 1200 }];
      db.query.mockResolvedValue({ rows });

      const result = await ReportService.generateVolumeReport(
        1,
        '2024-01-01',
        '2024-01-31'
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('total_volume'),
        [1, '2024-01-01', '2024-01-31']
      );

      expect(result).toEqual(rows);
    });
  });
  describe('generateFrequencyReport', () => {
    it('returns frequency report', async () => {
      const rows = [{ week: '2024-01-01', days_trained: 4 }];
      db.query.mockResolvedValue({ rows });

      const result = await ReportService.generateFrequencyReport(
        1,
        '2024-01-01',
        '2024-01-31'
      );

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(rows);
    });
  });
  describe('generateStrengthProgressReport', () => {
    it('returns strength progress for exercise', async () => {
      const rows = [{ weight: 80, reps: 10 }];
      db.query.mockResolvedValue({ rows });

      const result = await ReportService.generateStrengthProgressReport(
        1,
        10,
        '2024-01-01',
        '2024-01-31'
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('we.exercise_id = $2'),
        [1, 10, '2024-01-01', '2024-01-31']
      );

      expect(result).toEqual(rows);
    });
  });
  describe('generateBodyMetricsReport', () => {
    it('returns body metrics', async () => {
      const rows = [{ weight_kg: 70 }];
      db.query.mockResolvedValue({ rows });

      const result = await ReportService.generateBodyMetricsReport(
        1,
        '2024-01-01',
        '2024-01-31'
      );

      expect(result).toEqual(rows);
    });
  });
  describe('generateGoalProgressReport', () => {
    it('returns active goals with progress', async () => {
      const rows = [{ calculated_progress: 75 }];
      db.query.mockResolvedValue({ rows });

      const result = await ReportService.generateGoalProgressReport(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
      expect(result).toEqual(rows);
    });
  });
  describe('generateDashboardStats', () => {
    it('returns dashboard stats', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ total_workouts: 10 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ name: 'Squat' }] });

      const result = await ReportService.generateDashboardStats(1);

      expect(db.query).toHaveBeenCalledTimes(3);

      expect(result).toEqual({
        stats: { total_workouts: 10 },
        upcomingWorkouts: [{ id: 1 }],
        frequentExercises: [{ name: 'Squat' }],
      });
    });
  });
});

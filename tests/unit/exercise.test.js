jest.mock('../../src/models/exercise.model', () => ({
  findAllWithFilters: jest.fn(),
  findById: jest.fn(),
  findByCategory: jest.fn(),
  findByMuscleGroup: jest.fn(),
  db: {
    query: jest.fn(),
  },
}));
const ExerciseService = require('../../src/services/excercise.service');
const Exercise = require('../../src/models/exercise.model');

describe('ExerciseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllExercises', () => {
    it('returns exercises with filters and pagination', async () => {
      const mockResult = [{ id: 1, name: 'Push Up' }];

      Exercise.findAllWithFilters.mockResolvedValue(mockResult);

      const result = await ExerciseService.getAllExercises(
        { category: 'strength' },
        2,
        10
      );

      expect(Exercise.findAllWithFilters).toHaveBeenCalledWith(
        { category: 'strength' },
        2,
        10
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getExerciseById', () => {
    it('returns exercise if found', async () => {
      const exercise = { id: 1, name: 'Squat' };

      Exercise.findById.mockResolvedValue(exercise);

      const result = await ExerciseService.getExerciseById(1);

      expect(Exercise.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(exercise);
    });

    it('throws error if exercise not found', async () => {
      Exercise.findById.mockResolvedValue(null);

      await expect(
        ExerciseService.getExerciseById(999)
      ).rejects.toThrow('Exercise not found');
    });
  });

  describe('getExercisesByCategory', () => {
    it('returns exercises by category', async () => {
      const exercises = [{ id: 1 }, { id: 2 }];

      Exercise.findByCategory.mockResolvedValue(exercises);

      const result = await ExerciseService.getExercisesByCategory('cardio');

      expect(Exercise.findByCategory).toHaveBeenCalledWith('cardio');
      expect(result).toEqual(exercises);
    });
  });

  describe('getExercisesByMuscleGroup', () => {
    it('returns exercises by muscle group', async () => {
      const exercises = [{ id: 1 }];

      Exercise.findByMuscleGroup.mockResolvedValue(exercises);

      const result = await ExerciseService.getExercisesByMuscleGroup('chest');

      expect(Exercise.findByMuscleGroup).toHaveBeenCalledWith('chest');
      expect(result).toEqual(exercises);
    });
  });

  describe('searchExercises', () => {
    it('returns exercises matching search term', async () => {
      const rows = [{ id: 1, name: 'Bench Press' }];

      Exercise.db.query.mockResolvedValue({ rows });

      const result = await ExerciseService.searchExercises('bench');

      expect(Exercise.db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM exercises'),
        ['%bench%']
      );
      expect(result).toEqual(rows);
    });
  });

  describe('getExerciseCategories', () => {
    it('returns distinct categories', async () => {
      Exercise.db.query.mockResolvedValue({
        rows: [{ category: 'strength' }, { category: 'cardio' }],
      });

      const result = await ExerciseService.getExerciseCategories();

      expect(result).toEqual(['strength', 'cardio']);
    });
  });

  describe('getMuscleGroups', () => {
    it('returns distinct muscle groups', async () => {
      Exercise.db.query.mockResolvedValue({
        rows: [{ muscle_group: 'chest' }, { muscle_group: 'legs' }],
      });

      const result = await ExerciseService.getMuscleGroups();

      expect(result).toEqual(['chest', 'legs']);
    });
  });
});

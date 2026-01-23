jest.mock('../../src/models/workout.model', () => ({
  createWithExercises: jest.fn(),
  findAllByUserWithFilters: jest.fn(),
  findByIdWithExercises: jest.fn(),
  findById: jest.fn(),
  updateWithExercises: jest.fn(),
  deleteWithExercises: jest.fn(),
  update: jest.fn(),
  getUserWorkoutStats: jest.fn(),
  db: {
    query: jest.fn()
  }
}));

jest.mock('../../src/models/exerciseWorkout.model', () => ({
  updateExerciseCompletion: jest.fn(),
  getUserExerciseStats: jest.fn()
}));

jest.mock('../../src/models/exercise.model', () => ({
  findById: jest.fn()
}));

const WorkoutService = require('../../src/services/workout.service');
const Workout = require('../../src/models/workout.model');
const Exercise = require('../../src/models/exercise.model');
const WorkoutExercise = require('../../src/models/exerciseWorkout.model');

describe('WorkoutService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkout', () => {
    it('creates workout when exercises exist', async () => {
      Exercise.findById.mockResolvedValue({ id: 1 });
      Workout.createWithExercises.mockResolvedValue({ id: 10 });

      const result = await WorkoutService.createWorkout(1, {
        name: 'Push Day',
        scheduledDate: '2024-01-01',
        exercises: [{ exerciseId: 1 }]
      });

      expect(Exercise.findById).toHaveBeenCalled();
      expect(Workout.createWithExercises).toHaveBeenCalled();
      expect(result.id).toBe(10);
    });

    it('throws error if exercise does not exist', async () => {
      Exercise.findById.mockResolvedValue(null);

      await expect(
        WorkoutService.createWorkout(1, {
          name: 'Workout',
          scheduledDate: '2024-01-01',
          exercises: [{ exerciseId: 99 }]
        })
      ).rejects.toThrow('Exercise with ID 99 not found');
    });
  });

  describe('getWorkoutById', () => {
    it('returns workout if belongs to user', async () => {
      Workout.findByIdWithExercises.mockResolvedValue({
        id: 1,
        user_id: 1
      });

      const result = await WorkoutService.getWorkoutById(1, 1);

      expect(result.id).toBe(1);
    });

    it('throws error if workout not found', async () => {
      Workout.findByIdWithExercises.mockResolvedValue(null);

      await expect(
        WorkoutService.getWorkoutById(1, 1)
      ).rejects.toThrow('Workout not found');
    });

    it('throws error if workout does not belong to user', async () => {
      Workout.findByIdWithExercises.mockResolvedValue({
        id: 1,
        user_id: 2
      });

      await expect(
        WorkoutService.getWorkoutById(1, 1)
      ).rejects.toThrow('Unauthorized access to workout');
    });
  });

  describe('updateWorkout', () => {
    it('updates workout correctly', async () => {
      Workout.findById.mockResolvedValue({ id: 1, user_id: 1 });
      Exercise.findById.mockResolvedValue({ id: 1 });
      Workout.updateWithExercises.mockResolvedValue({ id: 1 });

      const result = await WorkoutService.updateWorkout(1, 1, {
        name: 'Updated name',
        exercises: [{ exerciseId: 1 }]
      });

      expect(Workout.updateWithExercises).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });

  describe('deleteWorkout', () => {
    it('deletes workout when authorized', async () => {
      Workout.findById.mockResolvedValue({ id: 1, user_id: 1 });
      Workout.deleteWithExercises.mockResolvedValue(true);

      const result = await WorkoutService.deleteWorkout(1, 1);

      expect(result).toBe(true);
    });
  });

  describe('completeWorkout', () => {
    it('marks workout as completed and updates exercises', async () => {
      Workout.findById.mockResolvedValue({ id: 1, user_id: 1 });
      Workout.update.mockResolvedValue({ id: 1 });

      const result = await WorkoutService.completeWorkout(1, 1, {
        rating: 5,
        exercises: [{
          workoutExerciseId: 10,
          completedSets: 3,
          completedReps: 10,
          completedWeights: 50
        }]
      });

      expect(WorkoutExercise.updateExerciseCompletion).toHaveBeenCalled();
      expect(Workout.update).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });

  describe('getUpcomingWorkouts', () => {
    it('returns upcoming workouts', async () => {
      Workout.db.query.mockResolvedValue({
        rows: [{ id: 1 }]
      });

      const result = await WorkoutService.getUpcomingWorkouts(1);

      expect(result.length).toBe(1);
    });
  });

});

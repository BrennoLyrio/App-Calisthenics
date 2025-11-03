import sequelize from '../config/database';
import User from './User';
import Exercise from './Exercise';
import Workout from './Workout';
import WorkoutExercise from './WorkoutExercise';
import WorkoutHistory from './WorkoutHistory';
import Goal from './Goal';
import ThematicProgram from './ThematicProgram';
import UserProgram from './UserProgram';

// Define associations
User.hasMany(Workout, { 
  foreignKey: 'id_usuario', 
  as: 'workouts' 
});
Workout.belongsTo(User, { 
  foreignKey: 'id_usuario', 
  as: 'user' 
});

User.hasMany(WorkoutHistory, { 
  foreignKey: 'id_usuario', 
  as: 'workoutHistory' 
});
WorkoutHistory.belongsTo(User, { 
  foreignKey: 'id_usuario', 
  as: 'user' 
});

User.hasMany(Goal, { 
  foreignKey: 'id_usuario', 
  as: 'goals' 
});
Goal.belongsTo(User, { 
  foreignKey: 'id_usuario', 
  as: 'user' 
});

User.hasMany(UserProgram, { 
  foreignKey: 'id_usuario', 
  as: 'userPrograms' 
});
UserProgram.belongsTo(User, { 
  foreignKey: 'id_usuario', 
  as: 'user' 
});

Workout.hasMany(WorkoutExercise, { 
  foreignKey: 'id_treino', 
  as: 'workoutExercises' 
});
WorkoutExercise.belongsTo(Workout, { 
  foreignKey: 'id_treino', 
  as: 'workout' 
});

Exercise.hasMany(WorkoutExercise, { 
  foreignKey: 'id_exercicio', 
  as: 'workoutExercises' 
});
WorkoutExercise.belongsTo(Exercise, { 
  foreignKey: 'id_exercicio', 
  as: 'exercise' 
});

Workout.hasMany(WorkoutHistory, { 
  foreignKey: 'id_treino', 
  as: 'workoutHistory' 
});
WorkoutHistory.belongsTo(Workout, { 
  foreignKey: 'id_treino', 
  as: 'workout' 
});

ThematicProgram.hasMany(UserProgram, { 
  foreignKey: 'id_programa', 
  as: 'userPrograms' 
});
UserProgram.belongsTo(ThematicProgram, { 
  foreignKey: 'id_programa', 
  as: 'program' 
});

// Sync database
const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    
    // Set timezone for PostgreSQL to Brazil (UTC-3)
    await sequelize.query("SET timezone = 'America/Sao_Paulo';");
    console.log('Database connection established successfully.');
    console.log('Timezone set to America/Sao_Paulo (UTC-3)');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export {
  sequelize,
  User,
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutHistory,
  Goal,
  ThematicProgram,
  UserProgram,
  syncDatabase
};

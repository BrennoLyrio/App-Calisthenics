import sequelize from '../config/database';
import User from './User';
import Exercise from './Exercise';
import Workout from './Workout';
import WorkoutExercise from './WorkoutExercise';
import WorkoutHistory from './WorkoutHistory';
import Goal from './Goal';
import ThematicProgram from './ThematicProgram';
import UserProgram from './UserProgram';
import CustomWorkout from './CustomWorkout';
import CustomWorkoutExercise from './CustomWorkoutExercise';
import WeeklyChallenge from './WeeklyChallenge';
import CommunityPost from './CommunityPost';
import PostLike from './PostLike';
import PostComment from './PostComment';

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

// Custom Workout associations
User.hasMany(CustomWorkout, { 
  foreignKey: 'id_usuario', 
  as: 'customWorkouts' 
});
CustomWorkout.belongsTo(User, { 
  foreignKey: 'id_usuario', 
  as: 'user' 
});

CustomWorkout.hasMany(CustomWorkoutExercise, { 
  foreignKey: 'id_rotina', 
  as: 'exercises' 
});
CustomWorkoutExercise.belongsTo(CustomWorkout, { 
  foreignKey: 'id_rotina', 
  as: 'customWorkout' 
});

Exercise.hasMany(CustomWorkoutExercise, { 
  foreignKey: 'id_exercicio', 
  as: 'customWorkoutExercises' 
});
CustomWorkoutExercise.belongsTo(Exercise, { 
  foreignKey: 'id_exercicio', 
  as: 'exercise' 
});

// Community associations
User.hasMany(CommunityPost, { 
  foreignKey: 'id_usuario', 
  as: 'communityPosts' 
});
CommunityPost.belongsTo(User, { 
  foreignKey: 'id_usuario', 
  as: 'user' 
});

WeeklyChallenge.hasMany(CommunityPost, { 
  foreignKey: 'id_desafio_semanal', 
  as: 'posts' 
});
CommunityPost.belongsTo(WeeklyChallenge, { 
  foreignKey: 'id_desafio_semanal', 
  as: 'weeklyChallenge' 
});

CommunityPost.hasMany(PostLike, { 
  foreignKey: 'id_post', 
  as: 'likes' 
});
PostLike.belongsTo(CommunityPost, { 
  foreignKey: 'id_post', 
  as: 'post' 
});

User.hasMany(PostLike, { 
  foreignKey: 'id_usuario', 
  as: 'postLikes' 
});
PostLike.belongsTo(User, { 
  foreignKey: 'id_usuario', 
  as: 'user' 
});

CommunityPost.hasMany(PostComment, { 
  foreignKey: 'id_post', 
  as: 'comments' 
});
PostComment.belongsTo(CommunityPost, { 
  foreignKey: 'id_post', 
  as: 'post' 
});

User.hasMany(PostComment, { 
  foreignKey: 'id_usuario', 
  as: 'postComments' 
});
PostComment.belongsTo(User, { 
  foreignKey: 'id_usuario', 
  as: 'user' 
});

// Sync database
const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    
    // Set timezone for PostgreSQL to Brazil (UTC-3)
    await sequelize.query("SET timezone = 'America/Sao_Paulo';");
    console.log('Database connection established successfully.');
    console.log('Timezone set to America/Sao_Paulo (UTC-3)');
    
    // Sync all models (without alter to avoid issues with existing data)
    await sequelize.sync({ alter: false });
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
  CustomWorkout,
  CustomWorkoutExercise,
  WeeklyChallenge,
  CommunityPost,
  PostLike,
  PostComment,
  syncDatabase
};

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';
import { MainTabNavigator } from './MainTabNavigator';
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  OnboardingGoalScreen,
  OnboardingExperienceScreen,
  OnboardingResourcesScreen,
  OnboardingPhysicalScreen,
  ExercisesScreen,
  LibraryExercisesScreen,
  WarmupScreen,
  CooldownScreen,
  ProgressScreen,
  ExercisePreviewScreen,
  WorkoutSessionScreen,
  WorkoutCompletedScreen,
  GoalsScreen,
  CreateGoalScreen,
  GoalDetailScreen,
  CustomWorkoutScreen,
  CustomWorkoutEditorScreen,
  ChallengesScreen,
  ChallengeDetailScreen,
  ArticleListScreen,
  ArticleDetailScreen,
  VideoRecorderScreen,
  PostDetailScreen,
} from '../screens';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'MainTabs' : 'Welcome'}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Exercises" component={ExercisesScreen} />
            <Stack.Screen name="LibraryExercises" component={LibraryExercisesScreen} />
            <Stack.Screen name="Warmup" component={WarmupScreen} />
            <Stack.Screen name="Cooldown" component={CooldownScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
            <Stack.Screen name="Goals" component={GoalsScreen} />
            <Stack.Screen name="CreateGoal" component={CreateGoalScreen} />
            <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
            <Stack.Screen name="CustomWorkouts" component={CustomWorkoutScreen} />
            <Stack.Screen name="CustomWorkoutEditor" component={CustomWorkoutEditorScreen} />
            <Stack.Screen name="Challenges" component={ChallengesScreen} />
            <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
            <Stack.Screen name="ArticleList" component={ArticleListScreen} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
            <Stack.Screen name="VideoRecorder" component={VideoRecorderScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="ExercisePreview" component={ExercisePreviewScreen} />
            <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
            <Stack.Screen name="WorkoutCompleted" component={WorkoutCompletedScreen} />
          </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
            <Stack.Screen name="OnboardingExperience" component={OnboardingExperienceScreen} />
            <Stack.Screen name="OnboardingResources" component={OnboardingResourcesScreen} />
            <Stack.Screen name="OnboardingPhysical" component={OnboardingPhysicalScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

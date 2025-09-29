import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  OnboardingGoalScreen,
  OnboardingExperienceScreen,
  OnboardingResourcesScreen,
  OnboardingPhysicalScreen,
  MainScreen,
  ExercisesScreen,
  ExercisePreviewScreen,
  WorkoutSessionScreen,
  WorkoutCompletedScreen,
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
        initialRouteName={user ? 'Main' : 'Welcome'}
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
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Exercises" component={ExercisesScreen} />
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

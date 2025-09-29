import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components';
import { Colors, Typography, Spacing, BorderRadius, OnboardingGoals } from '../constants';

const { width, height } = Dimensions.get('window');

interface OnboardingGoalScreenProps {
  navigation: any;
  route: any;
}

export const OnboardingGoalScreen: React.FC<OnboardingGoalScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('');

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleContinue = () => {
    if (!selectedGoal) {
      return;
    }

    const goalData = OnboardingGoals.find(goal => goal.id === selectedGoal);
    
    // Store the selected goal and navigate to next screen
    navigation.navigate('OnboardingExperience', {
      ...route.params,
      objetivo: goalData?.text,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA726', '#FFB74D']}
        style={styles.backgroundGradient}
      />
      
      <SafeAreaView style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.surface} />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>1</Text>
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <View style={styles.questionBubble}>
              <Text style={styles.questionText}>
                Qual é o seu principal objetivo?
              </Text>
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {OnboardingGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => handleGoalSelect(goal.id)}
                style={[
                  styles.optionCard,
                  selectedGoal === goal.id && styles.selectedOptionCard,
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionLetter,
                    selectedGoal === goal.id && styles.selectedOptionLetter,
                  ]}>
                    {goal.id}.
                  </Text>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionText,
                      selectedGoal === goal.id && styles.selectedOptionText,
                    ]}>
                      {goal.text}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      selectedGoal === goal.id && styles.selectedOptionDescription,
                    ]}>
                      {goal.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Continuar"
              onPress={handleContinue}
              disabled={!selectedGoal}
              size="large"
              gradient
              style={styles.continueButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  progressContainer: {
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  progressText: {
    fontSize: Typography.h4.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  questionContainer: {
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  questionBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    maxWidth: '80%',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: Spacing.xl,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: Colors.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionLetter: {
    fontSize: Typography.h4.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
    marginRight: Spacing.md,
    minWidth: 30,
  },
  selectedOptionLetter: {
    color: Colors.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.surface,
    marginBottom: Spacing.xs,
  },
  selectedOptionText: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.surface,
    opacity: 0.8,
    lineHeight: 20,
  },
  selectedOptionDescription: {
    color: Colors.primary,
    opacity: 0.9,
  },
  buttonContainer: {
    paddingBottom: Spacing.xl,
  },
  continueButton: {
    marginTop: Spacing.lg,
  },
});

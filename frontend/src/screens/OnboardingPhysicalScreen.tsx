import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { OnboardingPhysicalFormData } from '../types';

const { width, height } = Dimensions.get('window');

const physicalSchema = yup.object().shape({
  peso: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, 'Peso deve ser um número válido')
    .test('weight-range', 'Peso deve estar entre 30 e 300 kg', (value) => {
      const weight = parseFloat(value || '0');
      return weight >= 30 && weight <= 300;
    })
    .required('Peso é obrigatório'),
  altura: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, 'Altura deve ser um número válido')
    .test('height-range', 'Altura deve estar entre 100 e 250 cm', (value) => {
      const height = parseFloat(value || '0');
      return height >= 100 && height <= 250;
    })
    .required('Altura é obrigatória'),
  idade: yup
    .string()
    .matches(/^\d+$/, 'Idade deve ser um número')
    .test('age-range', 'Idade deve estar entre 13 e 100 anos', (value) => {
      const age = parseInt(value || '0');
      return age >= 13 && age <= 100;
    })
    .required('Idade é obrigatória'),
});

interface OnboardingPhysicalScreenProps {
  navigation: any;
  route: any;
}

export const OnboardingPhysicalScreen: React.FC<OnboardingPhysicalScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { updateProfile } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingPhysicalFormData>({
    resolver: yupResolver(physicalSchema),
    defaultValues: {
      peso: '',
      altura: '',
      idade: '',
    },
  });

  const handleContinue = async (data: OnboardingPhysicalFormData) => {
    try {
      // Update user profile with physical data
      await updateProfile({
        peso: parseFloat(data.peso),
        altura: parseFloat(data.altura),
        idade: parseInt(data.idade),
      });

      // Navigation will be handled by AppNavigator based on auth state
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar dados');
    }
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
          keyboardShouldPersistTaps="handled"
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
              <Text style={styles.progressText}>4</Text>
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <View style={styles.questionBubble}>
              <Text style={styles.questionText}>
                Agora vamos personalizar seu treino com seus dados físicos
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <Controller
                control={control}
                name="peso"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Peso (kg)"
                    placeholder="70"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    leftIcon="fitness"
                    error={errors.peso?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="altura"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Altura (cm)"
                    placeholder="175"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    leftIcon="resize"
                    error={errors.altura?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="idade"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Idade"
                    placeholder="25"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    leftIcon="calendar"
                    error={errors.idade?.message}
                  />
                )}
              />
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={Colors.primary} />
              <Text style={styles.infoText}>
                Esses dados nos ajudam a calcular a intensidade ideal dos seus treinos e acompanhar seu progresso
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Finalizar Configuração"
              onPress={handleSubmit(handleContinue)}
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
  formContainer: {
    marginBottom: Spacing.lg,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.surface,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingBottom: Spacing.xl,
  },
  continueButton: {
    marginTop: Spacing.lg,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Card, Select } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { RegisterFormData } from '../types';

const { width, height } = Dimensions.get('window');

const registerSchema = yup.object().shape({
  nome: yup
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .required('Nome é obrigatório'),
  email: yup
    .string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  senha: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
  confirmarSenha: yup
    .string()
    .oneOf([yup.ref('senha')], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
  idade: yup
    .string()
    .matches(/^\d+$/, 'Idade deve ser um número')
    .test('age-range', 'Idade deve estar entre 13 e 100 anos', (value) => {
      const age = parseInt(value || '0');
      return age >= 13 && age <= 100;
    })
    .required('Idade é obrigatória'),
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
  nivel_condicionamento: yup
    .string()
    .oneOf(['iniciante', 'intermediario', 'avancado'], 'Nível inválido')
    .required('Nível de condicionamento é obrigatório'),
  foco_treino: yup
    .string()
    .oneOf(['superiores', 'inferiores', 'core', 'completo'], 'Foco inválido')
    .required('Foco de treino é obrigatório'),
});

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      idade: '',
      peso: '',
      altura: '',
      nivel_condicionamento: 'iniciante',
      foco_treino: 'completo',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const registerData = {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        idade: parseInt(data.idade),
        peso: parseFloat(data.peso),
        altura: parseFloat(data.altura),
        nivel_condicionamento: data.nivel_condicionamento,
        foco_treino: data.foco_treino,
      };

      await register(registerData);
      // Navigation will be handled by the auth context
    } catch (error: any) {
      // Error is already handled by AuthContext with toast
      console.log('Register error handled by AuthContext');
      
      // If it's a duplicate email error, navigate to login
      if (error.message && error.message.includes('email já está sendo usado')) {
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000); // Wait 2 seconds for user to read the toast
      }
    }
  };

  const handleGoogleRegister = () => {
    Alert.alert('Em breve', 'Registro com Google será implementado em breve');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay */}
        <LinearGradient
          colors={['rgba(255,107,53,0.3)', 'rgba(255,140,66,0.5)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        />
        
        <SafeAreaView style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.surface} />
              </TouchableOpacity>
            </View>

            {/* Register Form */}
            <Card style={styles.registerCard} shadow>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>
                Preencha os dados abaixo para começar sua jornada
              </Text>

              <View style={styles.form}>
                <Controller
                  control={control}
                  name="nome"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Nome completo"
                      placeholder="Seu nome completo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      leftIcon="person"
                      error={errors.nome?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email"
                      placeholder="seu@email.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      leftIcon="mail"
                      error={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="senha"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Senha"
                      placeholder="Mínimo 6 caracteres"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      leftIcon="lock-closed"
                      error={errors.senha?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmarSenha"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Confirmar senha"
                      placeholder="Digite a senha novamente"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      leftIcon="lock-closed"
                      error={errors.confirmarSenha?.message}
                    />
                  )}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
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
                  
                  <View style={styles.halfWidth}>
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
                  </View>
                </View>

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
                  name="nivel_condicionamento"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Nível de Condicionamento"
                      placeholder="Selecione seu nível"
                      value={value}
                      options={[
                        { label: 'Iniciante', value: 'iniciante' },
                        { label: 'Intermediário', value: 'intermediario' },
                        { label: 'Avançado', value: 'avancado' },
                      ]}
                      onSelect={onChange}
                      error={errors.nivel_condicionamento?.message}
                      required
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="foco_treino"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Foco do Treino"
                      placeholder="Selecione seu foco"
                      value={value}
                      options={[
                        { label: 'Membros Superiores', value: 'superiores' },
                        { label: 'Membros Inferiores', value: 'inferiores' },
                        { label: 'Core (Abdômen)', value: 'core' },
                        { label: 'Treino Completo', value: 'completo' },
                      ]}
                      onSelect={onChange}
                      error={errors.foco_treino?.message}
                      required
                    />
                  )}
                />

                <Button
                  title="Criar Conta"
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  size="large"
                  gradient
                  style={styles.registerButton}
                />

                <View style={styles.separator}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>OU</Text>
                  <View style={styles.separatorLine} />
                </View>

                <Button
                  title="Criar conta com Google"
                  onPress={handleGoogleRegister}
                  variant="secondary"
                  size="large"
                  style={styles.googleButton}
                />
              </View>
            </Card>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Já tem uma conta?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>
                  Entrar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
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
  registerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  form: {
    marginTop: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  registerButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light,
  },
  separatorText: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: Colors.error,
    marginBottom: Spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontSize: Typography.body.fontSize,
    color: Colors.surface,
  },
  loginLink: {
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
    fontWeight: '600',
  },
});

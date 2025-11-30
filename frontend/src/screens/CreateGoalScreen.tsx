import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Card } from '../components';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { CreateGoalRequest } from '../types';

const { width } = Dimensions.get('window');

const goalSchema = yup.object().shape({
  descricao: yup
    .string()
    .min(5, 'Descrição deve ter pelo menos 5 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .required('Descrição é obrigatória'),
  tipo: yup
    .string()
    .oneOf(['curto', 'medio', 'longo'], 'Tipo inválido')
    .required('Tipo é obrigatório'),
  valor_alvo: yup
    .number()
    .positive('Valor alvo deve ser positivo')
    .required('Valor alvo é obrigatório'),
  data_fim: yup
    .string()
    .required('Data de término é obrigatória')
    .test('date-format', 'Data deve estar no formato DD/MM/YYYY', (value) => {
      if (!value) return false;
      // Accept both DD/MM/YYYY and YYYY-MM-DD formats
      const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/.test(value);
      const yyyymmdd = /^\d{4}-\d{2}-\d{2}$/.test(value);
      return ddmmyyyy || yyyymmdd;
    }),
  categoria: yup
    .string()
    .oneOf(['forca', 'resistencia', 'flexibilidade', 'perda_peso', 'ganho_massa', 'outro'], 'Categoria inválida')
    .required('Categoria é obrigatória'),
  unidade_medida: yup
    .string()
    .min(1, 'Unidade de medida é obrigatória')
    .max(20, 'Unidade de medida muito longa')
    .required('Unidade de medida é obrigatória'),
  meta_semanal: yup
    .number()
    .positive('Meta semanal deve ser positiva')
    .nullable(),
  observacoes: yup
    .string()
    .max(500, 'Observações muito longas')
    .nullable(),
});

interface CreateGoalScreenProps {
  navigation: any;
}

export const CreateGoalScreen: React.FC<CreateGoalScreenProps> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateGoalRequest>({
    resolver: yupResolver(goalSchema),
    defaultValues: {
      descricao: '',
      tipo: 'medio',
      valor_alvo: 0,
      data_fim: '',
      categoria: 'forca',
      unidade_medida: '',
      meta_semanal: undefined,
      observacoes: '',
    },
  });

  const selectedCategoria = watch('categoria');

  const getUnidadeSugerida = (categoria: string): string => {
    switch (categoria) {
      case 'forca':
        return 'treinos';
      case 'resistencia':
        return 'minutos';
      case 'perda_peso':
      case 'ganho_massa':
        return 'calorias';
      case 'flexibilidade':
        return 'sessões';
      default:
        return '';
    }
  };

  const getUnidadesDisponiveis = (categoria: string): string[] => {
    switch (categoria) {
      case 'forca':
        return ['treinos', 'repetições', 'séries', 'kg'];
      case 'resistencia':
        return ['minutos', 'horas', 'km', 'treinos'];
      case 'perda_peso':
      case 'ganho_massa':
        return ['calorias', 'kg', 'treinos'];
      case 'flexibilidade':
        return ['sessões', 'minutos', 'treinos'];
      default:
        return ['treinos', 'minutos', 'calorias', 'sessões'];
    }
  };

  const onSubmit = async (data: CreateGoalRequest) => {
    try {
      setIsSubmitting(true);

      // Format data_fim properly (convert DD/MM/YYYY to ISO if needed)
      let dataFimISO = data.data_fim;
      
      // If it's in DD/MM/YYYY format, convert to ISO
      if (data.data_fim && data.data_fim.includes('/')) {
        dataFimISO = formatDateToISO(data.data_fim);
        if (!dataFimISO || !isValidDate(data.data_fim)) {
          Alert.alert('Erro', 'Data de término inválida. Use o formato DD/MM/YYYY (ex: 31/12/2024).');
          return;
        }
      }
      
      // If it's already in ISO format, validate it
      if (dataFimISO && dataFimISO.includes('-')) {
        const endDate = new Date(dataFimISO);
        if (isNaN(endDate.getTime())) {
          Alert.alert('Erro', 'Data de término inválida.');
          return;
        }
        
        if (endDate <= new Date()) {
          Alert.alert('Erro', 'Data de término deve ser no futuro.');
          return;
        }
      } else {
        Alert.alert('Erro', 'Data de término é obrigatória.');
        return;
      }

      const goalData: CreateGoalRequest = {
        ...data,
        data_fim: dataFimISO,
        data_inicio: new Date().toISOString(),
      };

      const response = await apiService.createGoal(goalData);

      if (response.success) {
        Alert.alert('Sucesso', 'Meta criada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erro', response.message || 'Erro ao criar meta');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Erro', 'Erro ao criar meta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date to DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    
    // If already in ISO format (YYYY-MM-DD)
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // If already in DD/MM/YYYY format
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Try to parse as Date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };

  // Convert DD/MM/YYYY to ISO format (YYYY-MM-DD) for backend
  const formatDateToISO = (ddmmyyyy: string): string => {
    if (!ddmmyyyy) return '';
    
    // Remove non-numeric characters except /
    const cleaned = ddmmyyyy.replace(/[^\d/]/g, '');
    const parts = cleaned.split('/');
    
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day.length === 2 && month.length === 2 && year.length === 4) {
        return `${year}-${month}-${day}`;
      }
    }
    
    return '';
  };

  // Apply date mask DD/MM/YYYY
  const applyDateMask = (text: string): string => {
    // Remove all non-numeric characters
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  // Validate DD/MM/YYYY date
  const isValidDate = (dateString: string): boolean => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < new Date().getFullYear()) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA726']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.surface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nova Meta</Text>
            <View style={styles.placeholder} />
          </View>

          <Card style={styles.formCard} shadow>
            <Controller
              control={control}
              name="descricao"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Descrição da Meta"
                  placeholder="Ex: Fazer 30 treinos este mês"
                  value={value}
                  onChangeText={onChange}
                  error={errors.descricao?.message}
                  leftIcon="flag-outline"
                  maxLength={200}
                />
              )}
            />

            <Controller
              control={control}
              name="tipo"
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Tipo de Meta</Text>
                  <View style={styles.optionsRow}>
                    {(['curto', 'medio', 'longo'] as const).map((tipo) => (
                      <TouchableOpacity
                        key={tipo}
                        onPress={() => onChange(tipo)}
                        style={[
                          styles.optionButton,
                          value === tipo && styles.optionButtonActive
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            value === tipo && styles.optionTextActive
                          ]}
                        >
                          {tipo === 'curto' ? 'Curto Prazo' : tipo === 'medio' ? 'Médio Prazo' : 'Longo Prazo'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            />

            <Controller
              control={control}
              name="categoria"
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Categoria</Text>
                  <View style={styles.optionsGrid}>
                    {([
                      { value: 'forca', label: 'Força', icon: 'barbell' },
                      { value: 'resistencia', label: 'Resistência', icon: 'flame' },
                      { value: 'flexibilidade', label: 'Flexibilidade', icon: 'body' },
                      { value: 'perda_peso', label: 'Perda de Peso', icon: 'scale' },
                      { value: 'ganho_massa', label: 'Ganho de Massa', icon: 'fitness' },
                      { value: 'outro', label: 'Outro', icon: 'ellipse' },
                    ]).map((cat) => (
                      <TouchableOpacity
                        key={cat.value}
                        onPress={() => {
                          onChange(cat.value);
                          // Suggest unit based on category
                          const suggestedUnit = getUnidadeSugerida(cat.value);
                          if (suggestedUnit) {
                            setValue('unidade_medida', suggestedUnit);
                          }
                        }}
                        style={[
                          styles.categoryButton,
                          value === cat.value && styles.categoryButtonActive
                        ]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={24}
                          color={value === cat.value ? Colors.surface : Colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.categoryText,
                            value === cat.value && styles.categoryTextActive
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.categoria && (
                    <Text style={styles.errorText}>{errors.categoria.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="valor_alvo"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Valor Alvo"
                  placeholder="Ex: 30"
                  value={value.toString()}
                  onChangeText={(text) => {
                    const num = parseFloat(text) || 0;
                    onChange(num);
                  }}
                  keyboardType="numeric"
                  error={errors.valor_alvo?.message}
                  leftIcon="target-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="unidade_medida"
              render={({ field: { onChange, value } }) => {
                const unidadesDisponiveis = getUnidadesDisponiveis(selectedCategoria);
                const unidadeSugerida = getUnidadeSugerida(selectedCategoria);
                
                return (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      Unidade de Medida
                      {unidadeSugerida && (
                        <Text style={styles.hintTextInline}> (Recomendado: {unidadeSugerida})</Text>
                      )}
                    </Text>
                    
                    {/* Quick selection buttons */}
                    <View style={styles.unitButtonsContainer}>
                      {unidadesDisponiveis.slice(0, 4).map((unidade) => (
                        <TouchableOpacity
                          key={unidade}
                          onPress={() => onChange(unidade)}
                          style={[
                            styles.unitButton,
                            value === unidade && styles.unitButtonActive
                          ]}
                        >
                          <Text
                            style={[
                              styles.unitButtonText,
                              value === unidade && styles.unitButtonTextActive
                            ]}
                          >
                            {unidade}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    {/* Manual input field */}
                    <Input
                      placeholder={`Ex: ${unidadeSugerida || 'treinos, minutos, calorias'}`}
                      value={value}
                      onChangeText={onChange}
                      error={errors.unidade_medida?.message}
                      leftIcon="ruler-outline"
                      maxLength={20}
                    />
                    
                    <Text style={styles.hintText}>
                      Exemplos: {unidadesDisponiveis.join(', ')}
                    </Text>
                  </View>
                );
              }}
            />

            <Controller
              control={control}
              name="data_fim"
              render={({ field: { onChange, value } }) => {
                // Convert stored ISO to DD/MM/YYYY for display
                const displayValue = value && value.includes('-') 
                  ? formatDateToDDMMYYYY(value) 
                  : (value || '');
                
                return (
                  <View>
                    <Input
                      label="Data de Término"
                      placeholder="DD/MM/YYYY"
                      value={displayValue}
                      onChangeText={(text) => {
                        // Apply date mask
                        const masked = applyDateMask(text);
                        
                        // Convert to ISO format when complete (10 characters = DD/MM/YYYY)
                        if (masked.length === 10 && isValidDate(masked)) {
                          const isoDate = formatDateToISO(masked);
                          if (isoDate) {
                            onChange(isoDate);
                          }
                        } else {
                          // Keep the masked value while typing (will validate on submit)
                          onChange(masked);
                        }
                      }}
                      keyboardType="numeric"
                      error={errors.data_fim?.message}
                      leftIcon="calendar-outline"
                      maxLength={10}
                    />
                    <Text style={styles.hintText}>
                      Formato: DD/MM/YYYY (ex: 31/12/2024)
                    </Text>
                  </View>
                );
              }}
            />

            <Controller
              control={control}
              name="meta_semanal"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Meta Semanal (Opcional)"
                  placeholder="Ex: 3"
                  value={value ? value.toString() : ''}
                  onChangeText={(text) => {
                    if (text === '') {
                      onChange(undefined);
                    } else {
                      const num = parseFloat(text) || 0;
                      onChange(num);
                    }
                  }}
                  keyboardType="numeric"
                  error={errors.meta_semanal?.message}
                  leftIcon="repeat-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="observacoes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Observações (Opcional)"
                  placeholder="Adicione notas sobre esta meta..."
                  value={value || ''}
                  onChangeText={onChange}
                  error={errors.observacoes?.message}
                  leftIcon="document-text-outline"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              )}
            />

            <Button
              title={isSubmitting ? "Criando..." : "Criar Meta"}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={styles.submitButton}
            />
          </Card>
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight as any,
    color: Colors.surface,
    textAlign: 'center',
    marginLeft: -40,
  },
  placeholder: {
    width: 40,
  },
  formCard: {
    padding: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light,
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: Colors.surface,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    width: (width - Spacing.md * 4) / 3,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light,
    gap: Spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: Colors.surface,
    fontWeight: '600',
  },
  hintText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  hintTextInline: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  unitButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  unitButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  unitButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitButtonText: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  unitButtonTextActive: {
    color: Colors.surface,
    fontWeight: '600',
  },
  errorText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});


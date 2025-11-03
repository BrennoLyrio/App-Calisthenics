import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';

interface MainScreenProps {
  navigation: any;
}

export const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation will be handled by AppNavigator based on auth state
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
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Olá,</Text>
              <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={Colors.surface} />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Card style={styles.welcomeCard} shadow>
              <View style={styles.welcomeContent}>
                <Ionicons name="fitness" size={48} color={Colors.primary} />
                <Text style={styles.welcomeTitle}>
                  Bem-vindo ao Calisthenics App!
                </Text>
                <Text style={styles.welcomeDescription}>
                  Sua jornada de transformação começa agora. Explore exercícios, 
                  crie treinos personalizados e acompanhe seu progresso.
                </Text>
              </View>
            </Card>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Ações Rápidas</Text>
              
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Exercises')}
                >
                  <Ionicons name="barbell" size={32} color={Colors.primary} />
                  <Text style={styles.actionTitle}>Exercícios</Text>
                  <Text style={styles.actionDescription}>
                    Seu treino personalizado
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('LibraryExercises')}
                >
                  <Ionicons name="library" size={32} color={Colors.primary} />
                  <Text style={styles.actionTitle}>Biblioteca</Text>
                  <Text style={styles.actionDescription}>
                    Todos os exercícios
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <Ionicons name="play-circle" size={32} color={Colors.primary} />
                  <Text style={styles.actionTitle}>Treinos</Text>
                  <Text style={styles.actionDescription}>
                    Crie seus treinos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Progress')}
                >
                  <Ionicons name="stats-chart" size={32} color={Colors.primary} />
                  <Text style={styles.actionTitle}>Progresso</Text>
                  <Text style={styles.actionDescription}>
                    Acompanhe evolução
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <Ionicons name="person" size={32} color={Colors.primary} />
                  <Text style={styles.actionTitle}>Perfil</Text>
                  <Text style={styles.actionDescription}>
                    Gerencie sua conta
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* User Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Seus Dados</Text>
              
              <Card style={styles.statsCard} shadow>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.idade || '--'}</Text>
                    <Text style={styles.statLabel}>Anos</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.peso || '--'}</Text>
                    <Text style={styles.statLabel}>kg</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.altura || '--'}</Text>
                    <Text style={styles.statLabel}>cm</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {user?.nivel_condicionamento || '--'}
                    </Text>
                    <Text style={styles.statLabel}>Nível</Text>
                  </View>
                </View>
              </Card>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: Typography.body.fontSize,
    color: Colors.surface,
    opacity: 0.9,
  },
  userName: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  logoutButton: {
    padding: Spacing.sm,
  },
  mainContent: {
    flex: 1,
  },
  welcomeCard: {
    marginBottom: Spacing.xl,
  },
  welcomeContent: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  welcomeDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  quickActions: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '48%',
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  actionDescription: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: Spacing.xl,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});

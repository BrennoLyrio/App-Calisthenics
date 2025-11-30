import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { RankTab } from '../components/community/RankTab';
import { HelpTab } from '../components/community/HelpTab';

const { width } = Dimensions.get('window');

interface CommunityScreenProps {
  navigation: any;
}

type TabType = 'rank' | 'help';

export const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('rank');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA726']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="people" size={28} color={Colors.surface} />
            <Text style={styles.headerTitle}>Comunidade</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rank' && styles.tabActive]}
            onPress={() => setActiveTab('rank')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="trophy" 
              size={20} 
              color={activeTab === 'rank' ? Colors.primary : Colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'rank' && styles.tabTextActive]}>
              Rank
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'help' && styles.tabActive]}
            onPress={() => setActiveTab('help')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="help-circle" 
              size={20} 
              color={activeTab === 'help' ? Colors.primary : Colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'help' && styles.tabTextActive]}>
              Ajuda
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'rank' ? (
            <RankTab navigation={navigation} />
          ) : (
            <HelpTab navigation={navigation} />
          )}
        </View>
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light + '40',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface + '20',
  },
  tabActive: {
    backgroundColor: Colors.surface,
  },
  tabText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
});

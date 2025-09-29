import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components';
import { Colors, Typography, Spacing, Gradients } from '../constants';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay */}
        <LinearGradient
          colors={['rgba(255,107,53,0.4)', 'rgba(255,140,66,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        />
        
        <SafeAreaView style={styles.content}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.title}>SUA</Text>
            <Text style={styles.title}>TRANSFORMAÇÃO</Text>
            <Text style={styles.title}>COMEÇA AQUI</Text>
            
            <Text style={styles.subtitle}>
              Descubra o poder da calistenia e transforme seu corpo usando apenas o peso do seu corpo
            </Text>
          </View>
          
          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <Button
              title="Começar Agora"
              onPress={handleGetStarted}
              size="large"
              gradient
              style={styles.primaryButton}
            />
            
            <Button
              title="Já tenho uma conta"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              size="large"
              style={styles.secondaryButton}
            />
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.surface,
    textAlign: 'center',
    lineHeight: 42,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.surface,
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    lineHeight: 24,
    opacity: 0.9,
  },
  bottomActions: {
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
    marginBottom: Spacing.md,
  },
  secondaryButton: {
    borderColor: Colors.surface,
  },
});

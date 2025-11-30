import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';

interface VideoRecorderScreenProps {
  navigation: any;
  route: {
    params: {
      tipo: 'rank' | 'help';
      id_desafio_semanal?: number;
    };
  };
}

export const VideoRecorderScreen: React.FC<VideoRecorderScreenProps> = ({ navigation, route }) => {
  const { tipo, id_desafio_semanal } = route.params;
  const { user } = useAuth();
  
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duvida, setDuvida] = useState('');
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // Request camera permission (only camera, no microphone needed)
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
  }, [cameraPermission]);

  const startRecording = async () => {
    if (!cameraRef.current) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Câmera não disponível',
      });
      return;
    }

    // Verify permissions before recording
    if (!cameraPermission?.granted) {
      Toast.show({
        type: 'error',
        text1: 'Permissão Necessária',
        text2: 'Permissão de câmera não concedida',
      });
      const result = await requestCameraPermission();
      if (!result?.granted) {
        // Open app settings if permission denied
        Alert.alert(
          'Permissão Negada',
          'Por favor, conceda permissão de câmera nas configurações do aplicativo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
          ]
        );
      }
      return;
    }
    
    // For Android, we need RECORD_AUDIO permission even with mute: true
    // Check if permission is granted by attempting to record
    setIsRecording(true);
    
    try {
      // Record video without audio - mute: true = sem áudio
      const video = await cameraRef.current.recordAsync({
        maxDuration: 120, // 60 seconds max
        quality: '720p',
        mute: true, // SEM ÁUDIO - mas Android ainda precisa da permissão RECORD_AUDIO
        videoBitrate: 8000000,
      });
      
      setRecordedVideo(video.uri);
      setIsRecording(false);
    } catch (error: any) {
      console.error('❌ Error recording video:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      
      setIsRecording(false);
      
      // Check if it's a permission error
      if (error?.message?.includes('RECORD_AUDIO') || error?.message?.includes('RECORD_AUDIO') || error?.code === 'PERMISSION_DENIED') {
        // Audio permission error - Android requires RECORD_AUDIO permission even with mute: true
        Alert.alert(
          '⚠️ Permissão de Microfone Necessária',
          'Mesmo que você já tenha concedido a permissão, o Expo Go pode não estar reconhecendo.\n\nTente:\n\n1. Fechar completamente o Expo Go (force close)\n2. Reabrir o Expo Go\n3. Reconectar ao servidor\n4. Tentar gravar novamente\n\nOU abra as configurações para verificar se a permissão está realmente ativada.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Abrir Configurações', 
              onPress: () => {
                Linking.openSettings();
              }
            },
            {
              text: 'Recarregar App',
              onPress: () => {
                // Force reload by navigating back and telling user to reload
                Alert.alert(
                  'Recarregar App',
                  'Por favor:\n1. Feche completamente o Expo Go\n2. Abra novamente\n3. Reconecte ao servidor\n4. Tente novamente',
                  [{ text: 'OK' }]
                );
              }
            }
          ]
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao gravar vídeo',
          text2: error.message || 'Tente novamente',
        });
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const retakeVideo = () => {
    setRecordedVideo(null);
    setTitulo('');
    setDescricao('');
    setDuvida('');
  };

  const handleUpload = async () => {
    if (!recordedVideo) {
      Alert.alert('Erro', 'Por favor, grave um vídeo primeiro');
      return;
    }

    if (tipo === 'help' && !titulo && !duvida) {
      Alert.alert('Erro', 'Por favor, preencha o título ou a dúvida');
      return;
    }

    try {
      setIsUploading(true);

      // Prepare post data
      const postData: any = {
        tipo,
      };

      if (tipo === 'rank') {
        if (id_desafio_semanal) {
          postData.id_desafio_semanal = id_desafio_semanal;
        }
        if (descricao.trim()) {
          postData.descricao = descricao.trim();
        }
      } else {
        if (titulo.trim()) {
          postData.titulo = titulo.trim();
        }
        if (duvida.trim()) {
          postData.duvida = duvida.trim();
        }
        if (descricao.trim()) {
          postData.descricao = descricao.trim();
        }
      }

      // Upload video and create post
      await apiService.createPost(postData, recordedVideo);

      Toast.show({
        type: 'success',
        text1: 'Post criado com sucesso!',
        text2: 'Seu vídeo foi publicado na comunidade',
      });

      navigation.goBack();
    } catch (error: any) {
      console.error('Error uploading video:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar post',
        text2: error.response?.data?.message || error.message || 'Tente novamente',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.content}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color={Colors.primary} />
            <Text style={styles.permissionTitle}>Permissão Necessária</Text>
            <Text style={styles.permissionText}>
              Precisamos de acesso à câmera para gravar vídeos{'\n'}
              (Os vídeos serão gravados sem áudio)
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestCameraPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {tipo === 'rank' ? 'Participar do Desafio' : 'Fazer Pergunta'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Camera/Video Preview */}
            <View style={styles.cameraContainer}>
              {!recordedVideo ? (
                <View style={styles.cameraWrapper}>
                  <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="front"
                  />
                  <View style={styles.cameraOverlay}>
                    <View style={styles.recordingControls}>
                      {!isRecording ? (
                        <TouchableOpacity
                          style={styles.recordButton}
                          onPress={startRecording}
                          activeOpacity={0.8}
                        >
                          <View style={styles.recordButtonInner} />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.stopButton}
                          onPress={stopRecording}
                          activeOpacity={0.8}
                        >
                          <View style={styles.stopButtonInner} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.videoContainer}>
                  <Video
                    ref={videoRef}
                    source={{ uri: recordedVideo }}
                    style={styles.video}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                  />
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={retakeVideo}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh" size={20} color={Colors.surface} />
                    <Text style={styles.retakeButtonText}>Regravar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Form */}
            {recordedVideo && (
              <View style={styles.formContainer}>
                {tipo === 'help' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Título da Dúvida *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Estou fazendo flexão corretamente?"
                      placeholderTextColor={Colors.textSecondary}
                      value={titulo}
                      onChangeText={setTitulo}
                      maxLength={200}
                    />
                  </View>
                )}

                {tipo === 'help' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descreva sua Dúvida *</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Descreva sua dúvida em detalhes..."
                      placeholderTextColor={Colors.textSecondary}
                      value={duvida}
                      onChangeText={setDuvida}
                      multiline
                      numberOfLines={4}
                      maxLength={1000}
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {tipo === 'rank' ? 'Descrição (opcional)' : 'Descrição Adicional (opcional)'}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Adicione uma descrição..."
                    placeholderTextColor={Colors.textSecondary}
                    value={descricao}
                    onChangeText={setDescricao}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                  onPress={handleUpload}
                  disabled={isUploading}
                  activeOpacity={0.8}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color={Colors.surface} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color={Colors.surface} />
                      <Text style={styles.uploadButtonText}>Publicar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  cameraContainer: {
    width: '100%',
    height: 300,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.dark,
  },
  cameraWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  recordButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.error,
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  stopButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  retakeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.error,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retakeButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.surface,
  },
  formContainer: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.surface,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  permissionTitle: {
    ...Typography.h2,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  permissionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  permissionSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  permissionButtonText: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.surface,
  },
});


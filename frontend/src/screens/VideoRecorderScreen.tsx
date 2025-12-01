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
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import Toast from 'react-native-toast-message';
import * as FileSystemLegacy from 'expo-file-system/legacy';

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
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [canStopRecording, setCanStopRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duvida, setDuvida] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<Video>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const recordingPromiseRef = useRef<Promise<{ uri: string }> | null>(null);
  const isRecordingStartedRef = useRef<boolean>(false);

  useEffect(() => {
    // Request camera and microphone permissions
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    if (Platform.OS === 'android' && !microphonePermission?.granted) {
      requestMicrophonePermission();
    }
  }, [cameraPermission, microphonePermission]);

  const startRecording = async () => {
    if (!cameraRef.current) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Câmera não disponível',
      });
      return;
    }

    if (!isCameraReady) {
      Toast.show({
        type: 'info',
        text1: 'Aguarde...',
        text2: 'Câmera ainda está preparando a gravação',
      });
      return;
    }

    // Verificar permissões de câmera
    if (!cameraPermission?.granted) {
      Toast.show({
        type: 'error',
        text1: 'Permissão Necessária',
        text2: 'Permissão de câmera não concedida',
      });
      const result = await requestCameraPermission();
      if (!result?.granted) {
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

    // Verificar permissão de microfone (Android)
    if (Platform.OS === 'android' && !microphonePermission?.granted) {
      Toast.show({
        type: 'error',
        text1: 'Permissão de Microfone Necessária',
        text2: 'Android precisa de permissão de microfone para gravar vídeos',
      });
      const result = await requestMicrophonePermission();
      if (!result?.granted) {
        Alert.alert(
          '⚠️ Permissão de Microfone Necessária',
          'O Android requer permissão de microfone para gravar vídeos, mesmo sem áudio.\n\nPor favor:\n1. Vá em Configurações do App\n2. Ative a permissão de Microfone\n3. Tente novamente',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Abrir Configurações', 
              onPress: () => Linking.openSettings()
            },
          ]
        );
      }
      return;
    }
    
    setIsRecording(true);
    setCanStopRecording(false);
    isRecordingStartedRef.current = false;
    
    try {
      // IMPORTANTE: Aguardar mais tempo para garantir que a câmera está pronta
      // Android precisa de tempo suficiente para inicializar
      await new Promise(resolve => setTimeout(resolve, Platform.OS === 'android' ? 1500 : 800));
      
      if (!cameraRef.current) {
        throw new Error('Câmera não disponível');
      }
      
      console.log('🎥 Iniciando gravação...');
      
      // Iniciar a gravação
      const recordingPromise = cameraRef.current.recordAsync({
        maxDuration: 120,
      });
      
      recordingPromiseRef.current = recordingPromise;
      recordingStartTimeRef.current = Date.now();
      
      // Aguardar tempo MÍNIMO antes de permitir parar
      // Android precisa de pelo menos 3-4 segundos para realmente começar a gravar
      const minimumRecordingDelay = Platform.OS === 'android' ? 4000 : 2000;
      
      await new Promise(resolve => setTimeout(resolve, minimumRecordingDelay));
      
      // Marcar que a gravação iniciou de fato
      isRecordingStartedRef.current = true;
      setCanStopRecording(true);
      
      console.log('✅ Gravação iniciada com sucesso');
      
      // Aguardar o fim da gravação (quando usuário parar ou atingir maxDuration)
      const video = await recordingPromise;
      
      console.log('📹 Gravação finalizada:', video?.uri);
      
      if (video && video.uri) {
        // Verificar se o arquivo existe e tem tamanho válido
        // Usando a API legada até migrar completamente para o novo filesystem
        const fileInfo = await FileSystemLegacy.getInfoAsync(video.uri);
        
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
          console.log('✅ Vídeo válido - Tamanho:', fileInfo.size, 'bytes');
          setRecordedVideo(video.uri);
        } else {
          throw new Error('Vídeo gravado está vazio ou corrompido');
        }
      } else {
        throw new Error('Vídeo não foi gravado corretamente');
      }
      
    } catch (error: any) {
      console.error('❌ Error recording video:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      
      // Verificar se é erro de "stopped before any data"
      if (error?.message?.includes('stopped before any data') || 
          error?.message?.includes('Recording was stopped') ||
          error?.code === 'ERR_VIDEO_RECORDING_FAILED') {
        
        Alert.alert(
          '⚠️ Gravação Muito Curta',
          'A gravação precisa durar pelo menos 3-4 segundos.\n\nDica: Após apertar GRAVAR, aguarde alguns segundos antes de PARAR.',
          [{ text: 'Entendi', style: 'default' }]
        );
        
      } else if (error?.message?.includes('RECORD_AUDIO') || 
                 error?.message?.includes('permission') || 
                 error?.code === 'PERMISSION_DENIED') {
        
        Alert.alert(
          '⚠️ Permissão de Microfone Necessária',
          'O Android requer permissão de microfone para gravar vídeos, mesmo sem áudio.\n\nPor favor:\n1. Vá em Configurações do App\n2. Ative a permissão de Microfone\n3. Tente novamente',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Abrir Configurações', 
              onPress: () => Linking.openSettings()
            },
          ]
        );
        
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao gravar vídeo',
          text2: error.message || 'Tente novamente',
        });
      }
    } finally {
      // Resetar estado
      setIsRecording(false);
      setCanStopRecording(false);
      recordingStartTimeRef.current = null;
      recordingPromiseRef.current = null;
      isRecordingStartedRef.current = false;
    }
  };

  const stopRecording = async () => {
    console.log('🛑 Tentando parar gravação...');
    console.log('canStopRecording:', canStopRecording);
    console.log('isRecordingStartedRef:', isRecordingStartedRef.current);
    
    // Verificar se pode parar
    if (!canStopRecording || !isRecordingStartedRef.current) {
      Toast.show({
        type: 'info',
        text1: 'Aguarde...',
        text2: 'A gravação ainda está iniciando. Aguarde alguns segundos.',
      });
      return;
    }
    
    if (!cameraRef.current || !isRecording) {
      console.log('⚠️ Não está gravando ou câmera não disponível');
      return;
    }
    
    try {
      // Calcular tempo de gravação
      if (recordingStartTimeRef.current) {
        const elapsed = Date.now() - recordingStartTimeRef.current;
        console.log('⏱️ Tempo de gravação:', elapsed, 'ms');
        
        // Garantir tempo mínimo de gravação (3 segundos)
        const minRecordingTime = 3000;
        
        if (elapsed < minRecordingTime) {
          const remainingTime = minRecordingTime - elapsed;
          console.log('⏳ Aguardando tempo mínimo...', remainingTime, 'ms');
          
          Toast.show({
            type: 'info',
            text1: 'Aguarde...',
            text2: `Gravando por mais ${Math.ceil(remainingTime / 1000)} segundos`,
          });
          
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
      }
      
      console.log('✋ Parando gravação agora...');
      
      // Desabilitar botão de parar
      setCanStopRecording(false);
      
      // Parar a gravação
      if (cameraRef.current) {
        await cameraRef.current.stopRecording();
        console.log('✅ Comando de parar enviado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao parar gravação:', error);
      
      // Mesmo com erro, resetar estados
      setIsRecording(false);
      setCanStopRecording(false);
      recordingStartTimeRef.current = null;
      recordingPromiseRef.current = null;
      isRecordingStartedRef.current = false;
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao parar gravação',
        text2: 'Tente gravar novamente',
      });
    }
  };

  const retakeVideo = () => {
    setRecordedVideo(null);
    setTitulo('');
    setDescricao('');
    setDuvida('');
    setIsCameraReady(false);
    setCanStopRecording(false);
    recordingStartTimeRef.current = null;
    recordingPromiseRef.current = null;
    isRecordingStartedRef.current = false;
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

  if (!cameraPermission || !microphonePermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!cameraPermission.granted || (Platform.OS === 'android' && !microphonePermission.granted)) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.content}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color={Colors.primary} />
            <Text style={styles.permissionTitle}>Permissões Necessárias</Text>
            <Text style={styles.permissionText}>
              Precisamos de acesso à câmera{Platform.OS === 'android' ? ' e ao microfone' : ''} para gravar vídeos
              {'\n\n'}
              {Platform.OS === 'android' && '⚠️ Android requer permissão de microfone mesmo para vídeos sem áudio'}
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={async () => {
                await requestCameraPermission();
                if (Platform.OS === 'android') {
                  await requestMicrophonePermission();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionButtonText}>Conceder Permissões</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: Colors.textSecondary, marginTop: Spacing.sm }]}
              onPress={() => Linking.openSettings()}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionButtonText}>Abrir Configurações</Text>
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
                    mode="video"
                    videoQuality={Platform.OS === 'android' ? '480p' : '720p'}
                    videoBitrate={Platform.OS === 'android' ? 3000000 : 8000000}
                    mute={false}
                    onCameraReady={() => setIsCameraReady(true)}
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
                          style={[styles.stopButton, !canStopRecording && styles.stopButtonDisabled]}
                          onPress={stopRecording}
                          disabled={!canStopRecording}
                          activeOpacity={canStopRecording ? 0.8 : 1}
                        >
                          <View style={styles.stopButtonInner} />
                          {!canStopRecording && (
                            <View style={styles.recordingIndicator}>
                              <ActivityIndicator size="small" color={Colors.surface} />
                            </View>
                          )}
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
  stopButtonDisabled: {
    opacity: 0.6,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
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

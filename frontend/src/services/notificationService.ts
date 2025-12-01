import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ==========================================
// CONFIGURAÇÃO DO INTERVALO DE NOTIFICAÇÕES
// ==========================================
const NOTIFICATIONS_ENABLED = true; // true = ativado | false = desativado
const NOTIFICATION_INTERVAL_SECONDS = 120; // Tempo em segundos (mínimo 60s para Android/iOS)
const NOTIFICATION_INTERVAL_MS = NOTIFICATION_INTERVAL_SECONDS * 1000;
// Intervalo mínimo suportado para repetição (iOS/Android)
const MIN_REPEAT_SECONDS = 60;
// ==========================================

// Configurar comportamento quando notificação é recebida
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Mensagens motivacionais variadas
const motivationalMessages = [
  '💪 Está na hora de treinar! Sua força está te esperando!',
  '🔥 Não deixe seus objetivos para depois. Vamos treinar agora!',
  '⚡ Cada treino te aproxima do seu melhor. Vamos lá!',
  '💥 Você é capaz de muito mais! Hora de mostrar seu potencial!',
  '🏆 A disciplina é o caminho para a excelência. Vamos treinar!',
  '💪 Seu corpo aguarda por você. Não o decepcione!',
  '🔥 O sucesso começa com um passo. Comece agora!',
  '⚡ Transforme sua vontade em ação. Hora do treino!',
  '💥 Você está mais próximo do que imagina. Continue!',
  '🏆 Cada esforço conta. Não pare agora!',
  '💪 A consistência vence sempre. Vamos treinar!',
  '🔥 Sua jornada de transformação continua. Vamos lá!',
  '⚡ Não é sobre ser perfeito, é sobre começar. Agora!',
  '💥 Você tem o poder de mudar. Use-o hoje!',
  '🏆 Grandes conquistas começam com pequenos passos. Vamos!',
  '💪 Seu futuro self agradece cada treino. Vamos lá!',
  '🔥 Não espere estar pronto. Comece e melhore no caminho!',
  '⚡ A motivação vem e vai. A disciplina fica. Vamos!',
  '💥 Você não está apenas treinando o corpo, está treinando a mente!',
  '🏆 A diferença entre sonhar e realizar é o trabalho. Vamos!',
];

class NotificationService {
  private notificationInterval: NodeJS.Timeout | null = null;
  private recheckIntervalId: NodeJS.Timeout | null = null; // Para reagendamento automático
  private initialized = false;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private isActive: boolean = false;

  /**
   * Solicita permissão para enviar notificações
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Permissão de notificações negada');
        return false;
      }

      // Configurar canal de notificação para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Treinos e Lembretes',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      console.log('✅ Permissão de notificações concedida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão de notificações:', error);
      return false;
    }
  }

  /**
   * Obtém uma mensagem motivacional aleatória
   */
  private getRandomMessage(): string {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return motivationalMessages[randomIndex];
  }

  /**
   * Agenda múltiplas notificações com mensagens diferentes
   * Isso resolve o problema de `repeats: true` ter sempre a mesma mensagem
   */
  private async scheduleMultipleNotifications(count: number = 20): Promise<void> {
    const repeatSeconds = Math.max(NOTIFICATION_INTERVAL_SECONDS, MIN_REPEAT_SECONDS);
    
    for (let i = 0; i < count; i++) {
      const triggerSeconds = repeatSeconds * (i + 1);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Hora de Treinar!',
          body: this.getRandomMessage(), // Cada notificação tem uma mensagem diferente!
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          data: {
            type: 'motivational',
            screen: 'Exercises',
            timestamp: Date.now() + (triggerSeconds * 1000),
          },
        },
        trigger: {
          seconds: triggerSeconds,
          channelId: 'default',
        },
      });
    }
    
    console.log(`✅ ${count} notificações agendadas (${Math.floor(count * repeatSeconds / 60)} minutos de cobertura)`);
  }

  /**
   * Sistema de reagendamento automático
   * Verifica a cada X minutos se as notificações estão acabando e reagenda automaticamente
   */
  private startAutoReschedule(): void {
    // Limpa qualquer intervalo anterior
    if (this.recheckIntervalId) {
      clearInterval(this.recheckIntervalId);
    }

    const repeatSeconds = Math.max(NOTIFICATION_INTERVAL_SECONDS, MIN_REPEAT_SECONDS);
    const recheckIntervalMs = repeatSeconds * 1000 * 10; // Verifica a cada 10 notificações

    console.log(`🔄 Sistema de reagendamento automático ativado (verifica a cada ${recheckIntervalMs / 60000} minutos)`);

    this.recheckIntervalId = setInterval(async () => {
      try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const remainingCount = scheduled.length;

        console.log(`📊 Notificações restantes: ${remainingCount}`);

        // Se restarem menos de 5 notificações, reagenda mais 30
        if (remainingCount < 5) {
          console.log('⚠️ Poucas notificações restantes, reagendando...');
          await this.scheduleMultipleNotifications(30);
          console.log('✅ Notificações reagendadas automaticamente!');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar notificações:', error);
      }
    }, recheckIntervalMs);
  }

  /**
   * Para o sistema de reagendamento automático
   */
  private stopAutoReschedule(): void {
    if (this.recheckIntervalId) {
      clearInterval(this.recheckIntervalId);
      this.recheckIntervalId = null;
      console.log('🛑 Sistema de reagendamento automático parado');
    }
  }

  /**
   * Verifica se está rodando no Expo Go
   */
  private isExpoGo(): boolean {
    return Constants.executionEnvironment === Constants.ExecutionEnvironment.StoreClient;
  }

  /**
   * Envia uma notificação imediata
   */
  private async sendNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Hora de Treinar!',
          body: this.getRandomMessage(),
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          data: {
            type: 'motivational',
            screen: 'Exercises',
          },
        },
        trigger: null, // null = notificação imediata
      });
      console.log('📬 Notificação enviada');
    } catch (error: any) {
      console.error('❌ Erro ao enviar notificação:', error?.message || error);
    }
  }

  /**
   * Inicia o sistema de notificações
   */
  async startMotivationalNotifications(): Promise<void> {
    if (!NOTIFICATIONS_ENABLED) {
      console.log('🔕 Notificações desabilitadas nas configurações');
      return;
    }

    if (this.isActive) {
      console.log('⚠️ Notificações já estão ativas');
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('❌ Sem permissão para notificações');
      return;
    }

    this.isActive = true;
    const isExpoGo = this.isExpoGo();

    // Cancela todas as notificações anteriores
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Envia notificação imediata ao iniciar
    await this.sendNotification();

    if (isExpoGo) {
      // ============================================
      // MODO EXPO GO (apenas foreground)
      // ============================================
      console.log('📱 Expo Go detectado - notificações funcionarão apenas com app aberto');
      console.log(`⏰ Intervalo: ${NOTIFICATION_INTERVAL_SECONDS} segundos`);
      
      this.notificationInterval = setInterval(async () => {
        if (this.isActive && NOTIFICATIONS_ENABLED) {
          await this.sendNotification();
        }
      }, NOTIFICATION_INTERVAL_MS);

    } else {
      // ============================================
      // MODO BUILD NATIVO (funciona em background)
      // ============================================
      const repeatSeconds = Math.max(NOTIFICATION_INTERVAL_SECONDS, MIN_REPEAT_SECONDS);

      console.log('📦 Build nativo detectado - notificações funcionarão em background');
      console.log(`⏰ Intervalo: ${repeatSeconds} segundos (${repeatSeconds / 60} minutos)`);

      // Agenda múltiplas notificações com mensagens DIFERENTES
      // Isso resolve o problema de repeats: true ter sempre a mesma mensagem
      await this.scheduleMultipleNotifications(30); // 30 notificações = 60 minutos (se intervalo = 120s)

      // Inicia sistema de reagendamento automático
      this.startAutoReschedule();

      console.log('✅ Notificações agendadas com sucesso');
    }

    console.log(`✅ Sistema de notificações iniciado`);
  }

  /**
   * Para o sistema de notificações
   */
  async stopMotivationalNotifications(): Promise<void> {
    console.log('🛑 Parando notificações...');
    this.isActive = false;

    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }

    // Para o sistema de reagendamento automático
    this.stopAutoReschedule();

    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Notificações paradas');
  }

  /**
   * Verifica se as notificações estão ativas
   */
  isNotificationsActive(): boolean {
    return this.isActive;
  }

  /**
   * Lista todas as notificações agendadas (debug)
   */
  async listScheduledNotifications(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📋 Notificações agendadas: ${scheduled.length}`);
    scheduled.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.identifier}`);
    });
  }
}

export const notificationService = new NotificationService();

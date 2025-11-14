export interface WaterAlarm {
  id: string;
  time: string;
  enabled: boolean;
  message: string;
}

export class WaterNotificationService {
  private static instance: WaterNotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): WaterNotificationService {
    if (!WaterNotificationService.instance) {
      WaterNotificationService.instance = new WaterNotificationService();
    }
    return WaterNotificationService.instance;
  }

  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.error('Service Workers não suportados neste navegador');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('Service Worker registrado com sucesso para notificações de água');

      await navigator.serviceWorker.ready;
      console.log('Service Worker pronto para notificações de água');

      return true;
    } catch (error) {
      console.error('Erro ao registrar Service Worker para água:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('Notificações não suportadas');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async scheduleWaterAlarms(alarms: WaterAlarm[]): Promise<void> {
    if (!this.registration) {
      await this.init();
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Permissão de notificação negada');
    }

    const enabledAlarms = alarms.filter(alarm => alarm.enabled);
    const notifications = enabledAlarms.map(alarm => this.createAlarmData(alarm));

    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'SCHEDULE_WATER_ALARMS',
        alarms: notifications
      });
    }

    console.log(`${notifications.length} alarmes de água agendados`);
  }

  private createAlarmData(alarm: WaterAlarm) {
    const scheduledTime = this.calculateScheduledTime(alarm.time);

    return {
      title: '💧 Hora de Beber Água!',
      body: alarm.message,
      tag: `water-alarm-${alarm.id}`,
      scheduledTime,
      recurring: true,
      data: {
        alarmId: alarm.id,
        alarmTime: alarm.time,
        message: alarm.message
      }
    };
  }

  private calculateScheduledTime(alarmTime: string): number {
    const now = new Date();
    const [hours, minutes] = alarmTime.split(':').map(Number);

    let notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);

    if (notificationDate <= now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    return notificationDate.getTime();
  }

  async sendTestNotification(): Promise<void> {
    if (!this.registration) {
      await this.init();
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Permissão de notificação negada');
    }

    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'TEST_WATER_NOTIFICATION'
      });
    }
  }

  async clearAllAlarms(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CLEAR_WATER_ALARMS'
      });
    }
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window;
  }
}

export const waterNotificationService = WaterNotificationService.getInstance();
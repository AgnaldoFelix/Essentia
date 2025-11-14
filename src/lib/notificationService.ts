export interface MealNotificationData {
  id: string;
  mealId: string;
  mealName: string;
  mealTime: string;
  mealEmoji: string;
  type: '30min_before' | 'exact_time';
  planName: string;
}

export interface WaterAlarm {
  id: string;
  time: string;
  enabled: boolean;
  message: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
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

      console.log('Service Worker registrado com sucesso');

      await navigator.serviceWorker.ready;
      console.log('Service Worker pronto');

      return true;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
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

  // Métodos para notificações de refeições
  async scheduleMealNotifications(meals: any[], planName: string): Promise<void> {
    if (!this.registration) {
      await this.init();
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Permissão de notificação negada');
    }

    const notifications: any[] = [];

    meals.forEach(meal => {
      const notification30Min = this.createMealNotificationData(meal, '30min_before', planName);
      const notificationExact = this.createMealNotificationData(meal, 'exact_time', planName);

      notifications.push(notification30Min, notificationExact);
    });

    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'SCHEDULE_MEAL_NOTIFICATIONS',
        notifications
      });
    }

    console.log(`${notifications.length} notificações de refeições agendadas`);
  }

  private createMealNotificationData(meal: any, type: '30min_before' | 'exact_time', planName: string) {
    const scheduledTime = this.calculateScheduledTime(meal.time, type);

    let title, body;
    if (type === '30min_before') {
      title = `⏰ ${meal.emoji} Refeição em 30 minutos!`;
      body = `Prepare-se para: ${meal.name} às ${meal.time}`;
    } else {
      title = `🍽️ ${meal.emoji} Hora da Refeição!`;
      body = `${meal.name} - ${meal.time}\n${meal.description || ''}`;
    }

    return {
      title,
      body: `${body}\nPlano: ${planName}`,
      tag: `meal-${meal.id}-${type}`,
      scheduledTime,
      recurring: true,
      data: {
        mealId: meal.id,
        mealName: meal.name,
        mealTime: meal.time,
        type,
        planName
      }
    };
  }

  // Métodos para notificações de água
  async scheduleWaterAlarms(alarms: WaterAlarm[]): Promise<void> {
    if (!this.registration) {
      await this.init();
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Permissão de notificação negada');
    }

    const enabledAlarms = alarms.filter(alarm => alarm.enabled);
    const notifications = enabledAlarms.map(alarm => this.createWaterAlarmData(alarm));

    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'SCHEDULE_WATER_ALARMS',
        alarms: notifications
      });
    }

    console.log(`${notifications.length} alarmes de água agendados`);
  }

  private createWaterAlarmData(alarm: WaterAlarm) {
    const scheduledTime = this.calculateScheduledTime(alarm.time, 'exact_time');

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

  private calculateScheduledTime(eventTime: string, type: '30min_before' | 'exact_time'): number {
    const now = new Date();
    const [hours, minutes] = eventTime.split(':').map(Number);

    let notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);

    if (type === '30min_before') {
      notificationDate.setMinutes(notificationDate.getMinutes() - 30);
    }

    if (notificationDate <= now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    return notificationDate.getTime();
  }

  async sendMealTestNotification(meal: any): Promise<void> {
    if (!this.registration) {
      await this.init();
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Permissão de notificação negada');
    }

    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'TEST_MEAL_NOTIFICATION',
        notification: {
          title: `🍽️ ${meal.emoji} Teste de Refeição!`,
          body: `Teste: ${meal.name} - ${meal.time}\n${meal.description || ''}`
        }
      });
    }
  }

  async sendWaterTestNotification(): Promise<void> {
    if (!this.registration) {
      await this.init();
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Permissão de notificação negada');
    }

    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'TEST_WATER_NOTIFICATION',
        notification: {
          title: '💧 Teste de Notificação de Água!',
          body: 'Esta é uma notificação de teste para lembrete de água! 💧'
        }
      });
    }
  }

  async clearAllMealNotifications(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CLEAR_MEAL_NOTIFICATIONS'
      });
    }
  }

  async clearAllWaterAlarms(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CLEAR_WATER_ALARMS'
      });
    }
  }

  async clearAllNotifications(): Promise<void> {
    await this.clearAllMealNotifications();
    await this.clearAllWaterAlarms();
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window;
  }
}

export const notificationService = NotificationService.getInstance();
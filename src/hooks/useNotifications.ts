import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/lib/notificationService';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supported = notificationService.isSupported();
      setIsSupported(supported);

      if (supported) {
        await notificationService.init();
        setPermission(notificationService.getPermissionStatus());
        setIsInitialized(true);

        const enabled = localStorage.getItem('notifications_enabled') === 'true';
        setIsEnabled(enabled);
      }
    };

    init();
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const granted = await notificationService.requestPermission();
      setPermission(notificationService.getPermissionStatus());
      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }, []);

  const scheduleNotifications = useCallback(async (meals: any[], planName: string) => {
    if (!isEnabled || permission !== 'granted') {
      return false;
    }

    try {
      await notificationService.scheduleNotifications(meals, planName);
      return true;
    } catch (error) {
      console.error('Erro ao agendar notificações:', error);
      return false;
    }
  }, [isEnabled, permission]);

  const sendTestNotification = useCallback(async (meal: any) => {
    try {
      await notificationService.sendTestNotification(meal);
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      return false;
    }
  }, []);

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        return false;
      }
    }

    setIsEnabled(enabled);
    localStorage.setItem('notifications_enabled', enabled.toString());

    if (!enabled) {
      await notificationService.clearAllNotifications();
    }

    return true;
  }, [permission, requestPermission]);

  const clearAllNotifications = useCallback(async () => {
    await notificationService.clearAllNotifications();
  }, []);

  return {
    isSupported,
    permission,
    isEnabled,
    isInitialized,
    requestPermission,
    scheduleNotifications,
    sendTestNotification,
    toggleNotifications,
    clearAllNotifications
  };
};
// hooks/useNotifications.ts
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
      await notificationService.scheduleMealNotifications(meals, planName);
      return true;
    } catch (error) {
      console.error('Erro ao agendar notificações:', error);
      return false;
    }
  }, [isEnabled, permission]);

  const sendTestNotification = useCallback(async (meal: any) => {
    try {
      console.log('🔔 Iniciando teste de notificação...');
      console.log('📊 Status da permissão:', permission);
      console.log('🔄 Service Worker inicializado:', isInitialized);
      
      // Se não está inicializado, inicializa
      if (!isInitialized) {
        console.log('🔄 Inicializando Service Worker...');
        await notificationService.init();
      }

      // Verifica permissão atual
      const currentPermission = notificationService.getPermissionStatus();
      console.log('🎯 Permissão atual:', currentPermission);

      if (currentPermission !== 'granted') {
        console.log('❌ Permissão não concedida, solicitando...');
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Permissão de notificação negada pelo usuário');
        }
      }

      console.log('✅ Permissão concedida, enviando notificação...');
      await notificationService.sendMealTestNotification(meal);
      console.log('🎉 Notificação de teste enviada com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
      
      // Se o erro for específico de permissão, mostra alerta
      if (error instanceof Error && error.message.includes('Permissão')) {
        return false;
      }
      
      // Para outros erros, tenta uma abordagem alternativa
      console.log('🔄 Tentando abordagem alternativa...');
      try {
        // Tenta usar a API de notificações diretamente como fallback
        if (Notification.permission === 'granted') {
          new Notification('🍽️ Teste de Notificação', {
            body: `Teste: ${meal.name} - ${meal.time}`,
            icon: '/icons/icon-192x192.png',
            requireInteraction: true
          });
          return true;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
      }
      
      return false;
    }
  }, [permission, isInitialized, requestPermission]);

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
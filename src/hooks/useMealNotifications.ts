// hooks/useMealNotifications.ts
import { useEffect, useRef, useCallback } from 'react';
import { Meal } from '@/types/nutrition';

interface MealNotification {
  id: string;
  mealId: string;
  type: '30min_before' | 'exact_time';
  scheduledTime: number;
  timeoutId?: NodeJS.Timeout;
}

export const useMealNotifications = (meals: Meal[], selectedPlanName: string) => {
  const notificationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const scheduledNotifications = useRef<MealNotification[]>([]);

  // Função para solicitar permissão de notificações
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  // Função para enviar notificação
  const sendNotification = (meal: Meal, type: '30min_before' | 'exact_time') => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      let title, body;

      if (type === '30min_before') {
        title = '⏰ Refeição em 30 minutos!';
        body = `Prepare-se para: ${meal.name} - ${meal.time}`;
      } else {
        title = '🍽️ Hora da Refeição!';
        body = `${meal.name} - ${meal.time}\n${meal.description || ''}`;
      }

      new Notification(title, {
        body: `${body}\nPlano: ${selectedPlanName}`,
        icon: '/meal-icon.png',
        badge: '/meal-badge.png',
        tag: `meal-reminder-${meal.id}`,
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    }
  };

  // Função para calcular o tempo até a notificação
  const calculateNotificationTime = (mealTime: string, type: '30min_before' | 'exact_time'): number => {
    const now = new Date();
    const [hours, minutes] = mealTime.split(':').map(Number);
    
    let notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);

    // Se for notificação 30 minutos antes, subtrai 30 minutos
    if (type === '30min_before') {
      notificationDate.setMinutes(notificationDate.getMinutes() - 30);
    }

    // Se o horário já passou hoje, agenda para amanhã
    if (notificationDate <= now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }
    
    return notificationDate.getTime() - now.getTime();
  };

  // Função para agendar uma notificação
  const scheduleMealNotification = useCallback((meal: Meal, type: '30min_before' | 'exact_time') => {
    const timeUntilNotification = calculateNotificationTime(meal.time, type);
    
    const notificationId = `meal-${meal.id}-${type}`;
    
    // Cancela notificação existente se houver
    const existingTimeout = notificationTimeouts.current.get(notificationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      notificationTimeouts.current.delete(notificationId);
    }

    const timeoutId = setTimeout(() => {
      sendNotification(meal, type);
      // Agenda a próxima notificação (diária)
      scheduleMealNotification(meal, type);
    }, timeUntilNotification);

    notificationTimeouts.current.set(notificationId, timeoutId);

    // Armazena a notificação agendada
    scheduledNotifications.current = scheduledNotifications.current.filter(
      n => n.id !== notificationId
    );

    scheduledNotifications.current.push({
      id: notificationId,
      mealId: meal.id,
      type,
      scheduledTime: Date.now() + timeUntilNotification,
      timeoutId
    });
  }, [selectedPlanName]);

  // Função para agendar todas as notificações de uma refeição
  const scheduleMealNotifications = useCallback((meal: Meal) => {
    // Agenda notificação 30 minutos antes
    scheduleMealNotification(meal, '30min_before');
    // Agenda notificação no horário exato
    scheduleMealNotification(meal, 'exact_time');
  }, [scheduleMealNotification]);

  // Função para cancelar todas as notificações de uma refeição
  const cancelMealNotifications = (mealId: string) => {
    const notificationsToCancel = [
      `meal-${mealId}-30min_before`,
      `meal-${mealId}-exact_time`
    ];

    notificationsToCancel.forEach(notificationId => {
      const timeoutId = notificationTimeouts.current.get(notificationId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        notificationTimeouts.current.delete(notificationId);
      }
    });

    scheduledNotifications.current = scheduledNotifications.current.filter(
      n => n.mealId !== mealId
    );
  };

  // Efeito principal para gerenciar notificações das refeições
  useEffect(() => {
    // Solicitar permissão quando o hook for montado
    requestNotificationPermission();

    // Cancelar todas as notificações antigas
    notificationTimeouts.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    notificationTimeouts.current.clear();
    scheduledNotifications.current = [];

    // Agendar notificações para cada refeição
    meals.forEach(meal => {
      scheduleMealNotifications(meal);
    });

    // Cleanup
    return () => {
      notificationTimeouts.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      notificationTimeouts.current.clear();
      scheduledNotifications.current = [];
    };
  }, [meals, scheduleMealNotifications]);

  return {
    requestNotificationPermission,
    scheduleMealNotifications,
    cancelMealNotifications,
    getScheduledNotifications: () => scheduledNotifications.current,
    sendTestNotification: (meal: Meal) => {
      const testMeal: Meal = {
        ...meal,
        name: 'Refeição de Teste'
      };
      sendNotification(testMeal, 'exact_time');
    }
  };
};
// hooks/useWaterNotifications.ts
import { useEffect, useRef } from 'react';

interface WaterAlarm {
  id: string;
  time: string;
  enabled: boolean;
  message: string;
}

export const useWaterNotifications = (alarms: WaterAlarm[]) => {
  const notificationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
  const sendNotification = (alarm: WaterAlarm) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('💧 Hora de Beber Água!', {
        body: alarm.message,
        icon: '/water-icon.png',
        badge: '/water-badge.png',
        tag: 'water-reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    }
  };

  // Função para calcular o tempo até o próximo alarme
  const getTimeUntilAlarm = (alarmTime: string): number => {
    const now = new Date();
    const [hours, minutes] = alarmTime.split(':').map(Number);
    
    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, agenda para amanhã
    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }
    
    return alarmDate.getTime() - now.getTime();
  };

  // Função para agendar um alarme
  const scheduleAlarm = (alarm: WaterAlarm) => {
    if (!alarm.enabled) return;

    const timeUntilAlarm = getTimeUntilAlarm(alarm.time);
    
    const timeoutId = setTimeout(() => {
      sendNotification(alarm);
      // Agenda o próximo alarme (diário)
      scheduleAlarm(alarm);
    }, timeUntilAlarm);

    notificationTimeouts.current.set(alarm.id, timeoutId);
  };

  // Função para cancelar um alarme
  const cancelAlarm = (alarmId: string) => {
    const timeoutId = notificationTimeouts.current.get(alarmId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      notificationTimeouts.current.delete(alarmId);
    }
  };

  // Efeito principal para gerenciar alarmes
  useEffect(() => {
    // Solicitar permissão quando o hook for montado
    requestNotificationPermission();

    // Cancelar todos os alarmes antigos
    notificationTimeouts.current.forEach((timeout, alarmId) => {
      clearTimeout(timeout);
      notificationTimeouts.current.delete(alarmId);
    });

    // Agendar novos alarmes
    alarms.forEach(alarm => {
      if (alarm.enabled) {
        scheduleAlarm(alarm);
      }
    });

    // Cleanup
    return () => {
      notificationTimeouts.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      notificationTimeouts.current.clear();
    };
  }, [alarms]);

  return {
    requestNotificationPermission,
    sendTestNotification: () => {
      const testAlarm: WaterAlarm = {
        id: 'test',
        time: '00:00',
        enabled: true,
        message: 'Esta é uma notificação de teste! 💧'
      };
      sendNotification(testAlarm);
    }
  };
};
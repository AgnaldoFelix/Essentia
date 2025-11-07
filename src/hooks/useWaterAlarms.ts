// hooks/useWaterAlarms.ts
import { useEffect, useRef } from 'react';

interface WaterAlarm {
  id: string;
  time: string;
  enabled: boolean;
  message: string;
}

export const useWaterAlarms = (alarms: WaterAlarm[]) => {
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];

    if ('Notification' in window) {
      Notification.requestPermission();
    }

    alarms.forEach(alarm => {
      if (!alarm.enabled) return;

      const now = new Date();
      const [hours, minutes] = alarm.time.split(':').map(Number);
      const alarmTime = new Date();
      alarmTime.setHours(hours, minutes, 0, 0);

      // Se o horário já passou hoje, não agenda (ou agenda para o próximo dia, se desejar)
      if (alarmTime < now) {
        return;
      }

      const timeUntilAlarm = alarmTime.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Hora de beber água! 💧', {
            body: alarm.message,
            icon: '/water-icon.png',
          });
        }
      }, timeUntilAlarm);

      timeoutsRef.current.push(timeout);
    });

    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [alarms]);
};
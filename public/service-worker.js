const CACHE_NAME = 'meal-reminder-v1';
const NOTIFICATION_ICON = '/meal-icon.png';
const NOTIFICATION_BADGE = '/meal-badge.png';
const WATER_ICON = '/water-icon.png';
const WATER_BADGE = '/water-badge.png';


// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Recebimento de mensagens da aplicação
self.addEventListener('message', (event) => {
  const { type, notifications, alarms, notification, body } = event.data;

  if (type === 'SCHEDULE_MEAL_NOTIFICATIONS') {
    event.waitUntil(scheduleMealNotifications(notifications));
  } else if (type === 'SCHEDULE_WATER_ALARMS') {
    event.waitUntil(scheduleWaterAlarms(alarms));
  } else if (type === 'TEST_MEAL_NOTIFICATION') {
    event.waitUntil(sendTestMealNotification(notification));
  } else if (type === 'TEST_WATER_NOTIFICATION') {
    event.waitUntil(sendTestWaterNotification(notification));
  } else if (type === 'CLEAR_MEAL_NOTIFICATIONS') {
    event.waitUntil(clearMealNotifications());
  } else if (type === 'CLEAR_WATER_ALARMS') {
    event.waitUntil(clearWaterAlarms());
  } else if (type === 'CLEAR_NOTIFICATIONS') {
    event.waitUntil(clearAllNotifications());
  }
});

// Agendar notificações
async function scheduleNotifications(notifications) {
  // Primeiro, cancelamos todas as notificações existentes
  const allRegistrations = await self.registration.getNotifications();
  for (let registration of allRegistrations) {
    registration.close();
  }

// Agendar notificações de refeições (existente)
async function scheduleMealNotifications(notifications) {
  // Primeiro, cancelamos todas as notificações de refeições existentes
  const allRegistrations = await self.registration.getNotifications();
  const mealNotifications = allRegistrations.filter(notification => 
    notification.tag && notification.tag.startsWith('meal-')
  );
  
  for (let notification of mealNotifications) {
    notification.close();
  }

  // Agendamos as novas notificações
  for (let notificationData of notifications) {
    const { title, body, tag, scheduledTime, recurring, data } = notificationData;
    const now = Date.now();
    const delay = scheduledTime - now;

    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: NOTIFICATION_ICON,
          badge: NOTIFICATION_BADGE,
          tag,
          data,
          requireInteraction: true,
          vibrate: [200, 100, 200]
        });

        // Se for recorrente, agendamos novamente para o próximo dia
        if (recurring) {
          const nextDay = scheduledTime + 24 * 60 * 60 * 1000;
          const nextNotificationData = {
            ...notificationData,
            scheduledTime: nextDay
          };
          // Reagendar para o próximo dia
          scheduleMealNotifications([nextNotificationData]);
        }
      }, delay);
    }
  }
}
}

// Agendar alarmes de água (novo)
async function scheduleWaterAlarms(alarms) {
  // Primeiro, cancelamos todas as notificações de água existentes
  const allRegistrations = await self.registration.getNotifications();
  const waterNotifications = allRegistrations.filter(notification => 
    notification.tag && notification.tag.startsWith('water-alarm-')
  );
  
  for (let notification of waterNotifications) {
    notification.close();
  }

  // Agendamos as novas notificações
  for (let alarmData of alarms) {
    const { title, body, tag, scheduledTime, recurring, data } = alarmData;
    const now = Date.now();
    const delay = scheduledTime - now;

    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: WATER_ICON,
          badge: WATER_BADGE,
          tag,
          data,
          requireInteraction: true,
          vibrate: [200, 100, 200]
        });

        // Se for recorrente, agendamos novamente para o próximo dia
        if (recurring) {
          const nextDay = scheduledTime + 24 * 60 * 60 * 1000;
          const nextAlarmData = {
            ...alarmData,
            scheduledTime: nextDay
          };
          // Reagendar para o próximo dia
          scheduleWaterAlarms([nextAlarmData]);
        }
      }, delay);
    }
  }
}

// Enviar notificação de teste de refeição
async function sendTestMealNotification(notificationData) {
  await self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    requireInteraction: true,
    vibrate: [200, 100, 200]
  });
}

// Enviar notificação de teste de água
async function sendTestWaterNotification(notificationData) {
  await self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: WATER_ICON,
    badge: WATER_BADGE,
    requireInteraction: true,
    vibrate: [200, 100, 200]
  });
}

// Limpar notificações de refeições
async function clearMealNotifications() {
  const allRegistrations = await self.registration.getNotifications();
  const mealNotifications = allRegistrations.filter(notification => 
    notification.tag && notification.tag.startsWith('meal-')
  );
  
  for (let notification of mealNotifications) {
    notification.close();
  }
}

// Limpar alarmes de água
async function clearWaterAlarms() {
  const allRegistrations = await self.registration.getNotifications();
  const waterNotifications = allRegistrations.filter(notification => 
    notification.tag && notification.tag.startsWith('water-alarm-')
  );
  
  for (let notification of waterNotifications) {
    notification.close();
  }
}

// Limpar todas as notificações
async function clearAllNotifications() {
  const allRegistrations = await self.registration.getNotifications();
  for (let notification of allRegistrations) {
    notification.close();
  }
}

// Lidar com clique em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
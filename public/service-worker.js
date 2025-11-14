// public/service-worker.js
const CACHE_NAME = 'essentia-nutrition-v1.0.0';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🛠️ Service Worker instalado');
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Recebimento de mensagens da aplicação
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker recebeu mensagem:', event.data);
  
  const { type, notifications, alarms, notification } = event.data;

  if (type === 'SCHEDULE_MEAL_NOTIFICATIONS') {
    event.waitUntil(scheduleMealNotifications(notifications));
  } else if (type === 'SCHEDULE_WATER_ALARMS') {
    event.waitUntil(scheduleWaterAlarms(alarms));
  } else if (type === 'TEST_MEAL_NOTIFICATION') {
    event.waitUntil(sendTestMealNotification(notification));
  } else if (type === 'TEST_WATER_NOTIFICATION') {
    event.waitUntil(sendTestWaterNotification());
  } else if (type === 'CLEAR_MEAL_NOTIFICATIONS') {
    event.waitUntil(clearMealNotifications());
  } else if (type === 'CLEAR_WATER_ALARMS') {
    event.waitUntil(clearWaterAlarms());
  }
});

// Agendar notificações de refeições (Cross-browser)
async function scheduleMealNotifications(notifications) {
  console.log('🍽️ Agendando notificações de refeições:', notifications);
  
  // Primeiro, cancelamos todas as notificações de refeições existentes
  const allRegistrations = await self.registration.getNotifications();
  const mealNotifications = allRegistrations.filter(n => 
    n.tag && n.tag.startsWith('meal-')
  );
  
  for (let notification of mealNotifications) {
    notification.close();
  }

  // Agendamos as novas notificações
  for (let notificationData of notifications) {
    const { title, body, tag, scheduledTime, recurring, data } = notificationData;
    const now = Date.now();
    const delay = scheduledTime - now;

    console.log(`⏰ Agendando notificação: ${title} em ${delay}ms`);

    if (delay > 0) {
      setTimeout(async () => {
        try {
          console.log('🔔 Disparando notificação:', title);
          
          // Configuração cross-browser para notificações
          const notificationOptions = {
            body,
            icon: '/Essentia.png', // Ícone do app - Essentia.png
            badge: '/Essentia.png', // Badge para mobile - Essentia.png
            tag,
            data,
            requireInteraction: true,
            // Vibrate só funciona em alguns browsers
            ...(navigator.vibrate && { vibrate: [200, 100, 200] }),
            actions: [
              {
                action: 'open',
                title: 'Abrir App'
              }
            ]
          };

          // Remove opções não suportadas no Safari
          if (isSafari()) {
            delete notificationOptions.badge;
            delete notificationOptions.actions;
          }

          await self.registration.showNotification(title, notificationOptions);

          // Se for recorrente, agendamos novamente para o próximo dia
          if (recurring) {
            const nextDay = scheduledTime + 24 * 60 * 60 * 1000;
            const nextNotificationData = {
              ...notificationData,
              scheduledTime: nextDay
            };
            scheduleMealNotifications([nextNotificationData]);
          }
        } catch (error) {
          console.error('❌ Erro ao mostrar notificação:', error);
        }
      }, delay);
    }
  }
}

// Agendar alarmes de água
async function scheduleWaterAlarms(alarms) {
  console.log('💧 Agendando alarmes de água:', alarms);
  
  const allRegistrations = await self.registration.getNotifications();
  const waterNotifications = allRegistrations.filter(n => 
    n.tag && n.tag.startsWith('water-alarm-')
  );
  
  for (let notification of waterNotifications) {
    notification.close();
  }

  for (let alarmData of alarms) {
    const { title, body, tag, scheduledTime, recurring, data } = alarmData;
    const now = Date.now();
    const delay = scheduledTime - now;

    console.log(`⏰ Agendando alarme de água: ${title} em ${delay}ms`);

    if (delay > 0) {
      setTimeout(async () => {
        try {
          console.log('🔔 Disparando alarme de água:', title);
          
          const notificationOptions = {
            body,
            icon: '/Essentia.png', // Ícone do app - Essentia.png
            badge: '/Essentia.png', // Badge para mobile - Essentia.png
            tag,
            data,
            requireInteraction: true,
            ...(navigator.vibrate && { vibrate: [200, 100, 200] }),
            actions: [
              {
                action: 'open',
                title: 'Abrir App'
              }
            ]
          };

          if (isSafari()) {
            delete notificationOptions.badge;
            delete notificationOptions.actions;
          }

          await self.registration.showNotification(title, notificationOptions);

          if (recurring) {
            const nextDay = scheduledTime + 24 * 60 * 60 * 1000;
            const nextAlarmData = {
              ...alarmData,
              scheduledTime: nextDay
            };
            scheduleWaterAlarms([nextAlarmData]);
          }
        } catch (error) {
          console.error('❌ Erro ao mostrar notificação de água:', error);
        }
      }, delay);
    }
  }
}

// Enviar notificação de teste de refeição
async function sendTestMealNotification(notificationData) {
  console.log('🧪 [SW] Enviando notificação de teste de refeição:', notificationData);
  
  try {
    const title = notificationData.title || '🍽️ Teste de Notificação';
    const body = notificationData.body || 'Esta é uma notificação de teste!';
    
    const notificationOptions = {
      body: body,
      icon: '/Essentia.png', // Ícone do app - Essentia.png
      badge: '/Essentia.png', // Badge para mobile - Essentia.png
      tag: 'test-notification',
      requireInteraction: true,
      ...(navigator.vibrate && { vibrate: [200, 100, 200] }),
      actions: [
        {
          action: 'open',
          title: 'Abrir App'
        }
      ],
      data: {
        type: 'test',
        mealId: notificationData.mealId,
        timestamp: Date.now()
      }
    };

    if (isSafari()) {
      delete notificationOptions.badge;
      delete notificationOptions.actions;
    }

    await self.registration.showNotification(title, notificationOptions);
    
    console.log('✅ [SW] Notificação de teste exibida com sucesso!');
  } catch (error) {
    console.error('❌ [SW] Erro ao exibir notificação de teste:', error);
  }
}

// Enviar notificação de teste de água
async function sendTestWaterNotification() {
  console.log('🧪 Enviando notificação de teste de água');
  
  const notificationOptions = {
    body: 'Esta é uma notificação de teste do Essentia! Se você está vendo isso, as notificações estão funcionando! 🎉',
    icon: '/Essentia.png', // Ícone do app - Essentia.png
    badge: '/Essentia.png', // Badge para mobile - Essentia.png
    requireInteraction: true,
    ...(navigator.vibrate && { vibrate: [200, 100, 200] })
  };

  if (isSafari()) {
    delete notificationOptions.badge;
  }

  await self.registration.showNotification('💧 Teste de Notificação de Água', notificationOptions);
}

// Limpar notificações
async function clearMealNotifications() {
  const allRegistrations = await self.registration.getNotifications();
  const mealNotifications = allRegistrations.filter(n => 
    n.tag && n.tag.startsWith('meal-')
  );
  
  for (let notification of mealNotifications) {
    notification.close();
  }
}

async function clearWaterAlarms() {
  const allRegistrations = await self.registration.getNotifications();
  const waterNotifications = allRegistrations.filter(n => 
    n.tag && n.tag.startsWith('water-alarm-')
  );
  
  for (let notification of waterNotifications) {
    notification.close();
  }
}

// Detectar Safari
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Lidar com clique em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificação clicada:', event.notification.tag);
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focar em uma janela existente se possível
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Abrir nova janela se não houver uma aberta
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Cache para funcionamento offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http') && 
      (event.request.url.includes('/Essentia.png') || 
       event.request.url.includes('/manifest.json'))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
const CACHE_NAME = 'essentia-v3.0.0';

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

// Agendar notificações de refeições
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
      setTimeout(() => {
        console.log('🔔 Disparando notificação:', title);
        self.registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag,
          data,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          actions: [
            {
              action: 'open',
              title: 'Abrir App'
            }
          ]
        });

        // Se for recorrente, agendamos novamente para o próximo dia
        if (recurring) {
          const nextDay = scheduledTime + 24 * 60 * 60 * 1000;
          const nextNotificationData = {
            ...notificationData,
            scheduledTime: nextDay
          };
          scheduleMealNotifications([nextNotificationData]);
        }
      }, delay);
    }
  }
}

// Agendar alarmes de água
async function scheduleWaterAlarms(alarms) {
  console.log('💧 Agendando alarmes de água:', alarms);
  
  // Primeiro, cancelamos todas as notificações de água existentes
  const allRegistrations = await self.registration.getNotifications();
  const waterNotifications = allRegistrations.filter(n => 
    n.tag && n.tag.startsWith('water-alarm-')
  );
  
  for (let notification of waterNotifications) {
    notification.close();
  }

  // Agendamos as novas notificações
  for (let alarmData of alarms) {
    const { title, body, tag, scheduledTime, recurring, data } = alarmData;
    const now = Date.now();
    const delay = scheduledTime - now;

    console.log(`⏰ Agendando alarme de água: ${title} em ${delay}ms`);

    if (delay > 0) {
      setTimeout(() => {
        console.log('🔔 Disparando alarme de água:', title);
        self.registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag,
          data,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          actions: [
            {
              action: 'open',
              title: 'Abrir App'
            }
          ]
        });

        // Se for recorrente, agendamos novamente para o próximo dia
        if (recurring) {
          const nextDay = scheduledTime + 24 * 60 * 60 * 1000;
          const nextAlarmData = {
            ...alarmData,
            scheduledTime: nextDay
          };
          scheduleWaterAlarms([nextAlarmData]);
        }
      }, delay);
    }
  }
}

// Enviar notificação de teste de refeição
// Enviar notificação de teste de refeição (CORRIGIDO)
async function sendTestMealNotification(notificationData) {
  console.log('🧪 [SW] Enviando notificação de teste de refeição:', notificationData);
  
  try {
    const title = notificationData.title || '🍽️ Teste de Notificação';
    const body = notificationData.body || 'Esta é uma notificação de teste!';
    
    await self.registration.showNotification(title, {
      body: body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'test-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200],
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
    });
    
    console.log('✅ [SW] Notificação de teste exibida com sucesso!');
  } catch (error) {
    console.error('❌ [SW] Erro ao exibir notificação de teste:', error);
    
    // Fallback: tenta mostrar notificação mesmo com erro
    try {
      await self.registration.showNotification('🍽️ Teste de Notificação', {
        body: 'Notificação de teste do Essentia!',
        icon: '/icons/icon-192x192.png'
      });
    } catch (fallbackError) {
      console.error('❌ [SW] Fallback também falhou:', fallbackError);
    }
  }
}

// Enviar notificação de teste de água
async function sendTestWaterNotification() {
  console.log('🧪 Enviando notificação de teste de água');
  
  await self.registration.showNotification('💧 Teste de Notificação de Água', {
    body: 'Esta é uma notificação de teste do Essentia! Se você está vendo isso, as notificações estão funcionando! 🎉',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    requireInteraction: true,
    vibrate: [200, 100, 200]
  });
}

// Limpar notificações de refeições
async function clearMealNotifications() {
  const allRegistrations = await self.registration.getNotifications();
  const mealNotifications = allRegistrations.filter(n => 
    n.tag && n.tag.startsWith('meal-')
  );
  
  for (let notification of mealNotifications) {
    notification.close();
  }
}

// Limpar alarmes de água
async function clearWaterAlarms() {
  const allRegistrations = await self.registration.getNotifications();
  const waterNotifications = allRegistrations.filter(n => 
    n.tag && n.tag.startsWith('water-alarm-')
  );
  
  for (let notification of waterNotifications) {
    notification.close();
  }
}

// Lidar com clique em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificação clicada:', event.notification.tag);
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

  const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Instalação - Cache de recursos essenciais
self.addEventListener('install', (event) => {
  console.log('🛠️ Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Recursos em cache');
        return self.skipWaiting();
      })
  );
});

// Ativação - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requests - estratégia Cache First
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Retorna do cache se encontrado, senão faz fetch
          return response || fetch(event.request);
        })
    );
  }
});
});
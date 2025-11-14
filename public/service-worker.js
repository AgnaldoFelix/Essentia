const CACHE_NAME = 'essentia-v2.0.0';
const STATIC_CACHE = 'essentia-static-v2.0.0';
const DYNAMIC_CACHE = 'essentia-dynamic-v2.0.0';
const NOTIFICATION_ICON = '/meal-icon.png';
const NOTIFICATION_BADGE = '/meal-badge.png';
const WATER_ICON = '/water-icon.png';
const WATER_BADGE = '/water-badge.png';


const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/meal-icon.png',
  '/meal-badge.png',
  '/water-icon.png',
  '/water-badge.png'
];


// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Cache estático pré-carregado');
        return cache.addAll(STATIC_FILES);
      })
  );
  
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  event.waitUntil(self.clients.claim());
});


// Estratégia: Cache First, fallback para network
self.addEventListener('fetch', (event) => {
  // Ignora requisições não GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retorna do cache se disponível
        if (cachedResponse) {
          return cachedResponse;
        }

        // Busca da rede e armazena no cache dinâmico
        return fetch(event.request)
          .then(networkResponse => {
            // Só cacheamos respostas válidas
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Fallback para página offline se necessário
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
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
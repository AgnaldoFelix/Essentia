// public/service-worker.js
const CACHE_NAME = 'essentia-nutrition-v2.0.0';

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

// Sons de notificação (usando Web Audio API)
function playNotificationSound(type = 'meal') {
  try {
    const audioContext = new (self.AudioContext || self.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Sons diferentes para tipos diferentes de notificação
    if (type === 'meal') {
      // Som suave para refeições - tom ascendente
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.type = 'sine';
    } else if (type === 'water') {
      // Som refrescante para água - como gotas
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.type = 'sine';
    } else if (type === 'test') {
      // Som divertido para teste - mais animado
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.type = 'triangle';
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

  } catch (error) {
    console.log('🔇 Não foi possível reproduzir som:', error);
  }
}

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
      setTimeout(async () => {
        try {
          console.log('🔔 Disparando notificação:', title);
          
          // Tocar som da notificação
          playNotificationSound('meal');
          
          const notificationOptions = {
            body,
            icon: '/Essentia.png',
            badge: '/Essentia.png',
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
          
          // Tocar som da notificação de água
          playNotificationSound('water');
          
          const notificationOptions = {
            body,
            icon: '/Essentia.png',
            badge: '/Essentia.png',
            tag,
            data,
            requireInteraction: true,
            vibrate: [100, 50, 100],
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
    
    // Tocar som de teste
    playNotificationSound('test');
    
    const notificationOptions = {
      body: body,
      icon: '/Essentia.png',
      badge: '/Essentia.png',
      tag: 'test-notification',
      requireInteraction: true,
      vibrate: [300, 200, 300],
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
  
  // Tocar som de água
  playNotificationSound('water');
  
  const notificationOptions = {
    body: 'Esta é uma notificação de teste do Essentia! Se você está vendo isso, as notificações estão funcionando! 🎉',
    icon: '/Essentia.png',
    badge: '/Essentia.png',
    requireInteraction: true,
    vibrate: [100, 50, 100]
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
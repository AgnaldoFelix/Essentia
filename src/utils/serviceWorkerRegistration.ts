export const registerServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Worker não suportado neste navegador');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registrado com sucesso:', registration);

    // Aguarda o service worker estar pronto
    await navigator.serviceWorker.ready;
    console.log('✅ Service Worker pronto');

    return true;
  } catch (error) {
    console.error('❌ Falha ao registrar Service Worker:', error);
    return false;
  }
};

// Verifica se está rodando como PWA
export const isRunningAsPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};
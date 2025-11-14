// hooks/usePWAInstall.ts
import { useState, useEffect, useMemo, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Mover a detecção para fora do useEffect para evitar re-renders
  const checkIfInstalled = useCallback(() => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  }, []);

  useEffect(() => {
    console.log('🔧 usePWAInstall: Iniciando hook');

    // Detectar iOS uma vez
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Verificar instalação inicial
    const installed = checkIfInstalled();
    setIsInstalled(installed);
    
    if (installed) {
      console.log('✅ usePWAInstall: Já instalado');
      return; // Se já está instalado, não precisa dos event listeners
    }

    // Handler para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('🎯 usePWAInstall: beforeinstallprompt recebido');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Handler para appinstalled
    const handleAppInstalled = () => {
      console.log('🎉 usePWAInstall: App instalado');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    // Handler para mudanças no display mode
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      console.log('🔄 usePWAInstall: Display mode mudou para', e.matches);
      setIsInstalled(e.matches);
      if (e.matches) {
        setCanInstall(false);
      }
    };

    // Adicionar event listeners APENAS se não estiver instalado
    if (!installed) {
      if (!iOS) {
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        console.log('📱 usePWAInstall: Event listener para beforeinstallprompt adicionado');
      }

      window.addEventListener('appinstalled', handleAppInstalled);
      
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      mediaQuery.addEventListener('change', handleDisplayModeChange);

      console.log('📡 usePWAInstall: Todos os event listeners registrados');
    }

    return () => {
      console.log('🧹 usePWAInstall: Limpando event listeners');
      if (!iOS) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
      
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, [checkIfInstalled]); // Dependência estável

  // Memoizar as funções para evitar re-renders desnecessários
  const installPWA = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('❌ usePWAInstall: Nenhum deferredPrompt disponível');
      return false;
    }

    try {
      console.log('🚀 usePWAInstall: Iniciando instalação');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('📝 usePWAInstall: Resultado da instalação:', outcome);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setCanInstall(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ usePWAInstall: Erro na instalação:', error);
      return false;
    }
  }, [deferredPrompt]);

  const getInstallInstructions = useCallback((): string => {
    if (isIOS) {
      return `📱 PARA INSTALAR NO iPHONE/iPAD:

1. Toque no botão "Compartilhar" 📤 
   (ícone de caixa com flecha na parte inferior)

2. Role para baixo no menu e toque em 
   "Adicionar à Tela de Início" 

3. Toque em "Adicionar" no canto superior direito

💡 Use o Safari para esta funcionalidade!

✨ Após instalar, o Essentia aparecerá na sua tela inicial!`;
    } else {
      return `📱 PARA INSTALAR NO ANDROID/CHROME:

1. Toque no menu (⋯) no canto superior direito
2. Selecione "Adicionar à tela inicial" 
3. Toque em "Adicionar" para instalar

💻 NO COMPUTADOR:
Procure o ícone de instalação (📥) na barra de endereço

✨ Após instalar, o Essentia funcionará como app nativo!`;
    }
  }, [isIOS]);

  // Memoizar o objeto retornado para estabilidade
  const returnValue = useMemo(() => ({
    canInstall,
    isInstalled,
    isIOS,
    installPWA,
    getInstallInstructions,
    deferredPrompt
  }), [canInstall, isInstalled, isIOS, installPWA, getInstallInstructions, deferredPrompt]);

  console.log('🔄 usePWAInstall: Retornando valores', {
    canInstall,
    isInstalled,
    isIOS,
    hasDeferredPrompt: !!deferredPrompt
  });

  return returnValue;
};
// hooks/usePWAInstall.ts
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log('🔧 Inicializando hook usePWAInstall...');

    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    console.log('📱 iOS detectado:', iOS);

    // Verificar se já está instalado como PWA
    const checkIfInstalled = () => {
      // Múltiplas formas de detectar PWA
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isIOSStandalone = (window.navigator as any).standalone;
      
      const installed = isStandaloneMode || isFullscreen || isMinimalUI || isIOSStandalone;
      
      console.log('🏠 Verificando instalação PWA:', {
        isStandaloneMode,
        isFullscreen,
        isMinimalUI,
        isIOSStandalone,
        installed
      });
      
      setIsStandalone(installed);
      setIsInstalled(installed);
      return installed;
    };

    const installed = checkIfInstalled();
    console.log('✅ App instalado:', installed);

    // Handler para o evento beforeinstallprompt (Chrome/Android)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('🎯 Evento beforeinstallprompt disparado! PWA pode ser instalado.');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Handler para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('🎉 App instalado via PWA!');
      setIsInstalled(true);
      setCanInstall(false);
      setIsStandalone(true);
    };

    // Monitorar mudanças no display mode
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      console.log('🔄 Mudança no display mode:', e.matches);
      setIsInstalled(e.matches);
      setIsStandalone(e.matches);
    };

    // Adicionar event listeners
    console.log('📡 Registrando event listeners para PWA...');
    
    // Chrome/Android: evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    
    // Eventos universais
    window.addEventListener('appinstalled', handleAppInstalled);
    
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    standaloneMediaQuery.addEventListener('change', handleDisplayModeChange);

    // Para iOS, sempre podemos "instalar" via "Adicionar à Tela Inicial"
    if (iOS && !installed) {
      console.log('📱 iOS detectado e não instalado - habilitando instalação');
      setCanInstall(true);
    }

    // Debug do estado inicial
    console.log('📊 Estado inicial do PWA:', {
      isIOS,
      canInstall,
      isInstalled: installed,
      hasDeferredPrompt: !!deferredPrompt
    });

    return () => {
      console.log('🧹 Limpando event listeners do PWA');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    console.log('🚀 Iniciando instalação do PWA...');
    
    if (deferredPrompt) {
      try {
        console.log('📱 Chrome/Android: mostrando prompt de instalação nativo');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('📝 Resultado da instalação:', outcome);
        
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setCanInstall(false);
          setIsInstalled(true);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ Erro ao instalar PWA:', error);
        return false;
      }
    } else {
      console.log('📱 iOS ou navegador sem suporte nativo - mostrando instruções');
      return false;
    }
  };

  const getInstallInstructions = (): string => {
    if (isIOS) {
      return `📱 PARA INSTALAR NO iPHONE/iPAD:

1. Toque no botão "Compartilhar" 📤 
   (ícone de caixa com flecha na parte inferior)

2. Role para baixo no menu e toque em 
   "Adicionar à Tela de Início" 

3. Toque em "Adicionar" no canto superior direito

💡 DICA: Use o Safari para esta funcionalidade!

✨ Após instalar, o Essentia aparecerá como um app nativo na sua tela inicial! 🎉`;
    } else {
      return `📱 PARA INSTALAR NO ANDROID/CHROME:

1. Toque no menu (⋯) no canto superior direito
2. Selecione "Adicionar à tela inicial" 
3. Toque em "Adicionar" para instalar

💻 NO COMPUTADOR:
Procure o ícone de instalação (📥) na barra de endereço do Chrome

✨ Após instalar, o Essentia funcionará como um app nativo!`;
    }
  };

  return {
    canInstall,
    isInstalled,
    isStandalone,
    isIOS,
    installPWA,
    getInstallInstructions,
    deferredPrompt
  };
};
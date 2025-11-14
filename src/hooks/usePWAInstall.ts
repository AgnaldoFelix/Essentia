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
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Verificar se já está instalado como PWA
    const checkIfInstalled = () => {
      // Método 1: display-mode standalone
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      // Método 2: navigator.standalone (iOS)
      const isIOSStandalone = (window.navigator as any).standalone;
      // Método 3: Verificar se está rodando em contexto de PWA
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                                (window.navigator as any).standalone ||
                                window.location.search.includes('source=pwa');
      
      console.log('📱 Verificando instalação PWA:');
      console.log('- display-mode standalone:', isStandaloneMode);
      console.log('- navigator.standalone:', isIOSStandalone);
      console.log('- Modo standalone detectado:', isInStandaloneMode);
      
      setIsStandalone(isInStandaloneMode);
      return isInStandaloneMode;
    };

    const installed = checkIfInstalled();
    setIsInstalled(installed);

    // Handler para o evento beforeinstallprompt (Chrome/Android)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('🎯 Evento beforeinstallprompt disparado');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Handler para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('✅ App instalado via PWA');
      setIsInstalled(true);
      setCanInstall(false);
    };

    // Monitorar mudanças no display mode
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      console.log('🔄 Mudança no display mode:', e.matches);
      setIsInstalled(e.matches);
      setIsStandalone(e.matches);
    };

    // Adicionar event listeners
    if (!isIOS) {
      // Chrome/Android: evento beforeinstallprompt
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      console.log('📱 Registrado evento beforeinstallprompt para Chrome/Android');
    }

    // Eventos universais
    window.addEventListener('appinstalled', handleAppInstalled);
    
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    standaloneMediaQuery.addEventListener('change', handleDisplayModeChange);

    // Para iOS, podemos instalar via "Adicionar à Tela Inicial"
    if (isIOS && !installed) {
      console.log('📱 iOS detectado - habilitando instalação via banner');
      setCanInstall(true);
    }

    // Debug: log do estado inicial
    console.log('🔧 Estado inicial do PWA:');
    console.log('- iOS:', isIOS);
    console.log('- Pode instalar:', canInstall);
    console.log('- Já instalado:', installed);
    console.log('- DeferredPrompt:', !!deferredPrompt);

    return () => {
      if (!isIOS) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    console.log('🚀 Iniciando instalação do PWA...');
    
    if (deferredPrompt) {
      try {
        console.log('📱 Chrome/Android: mostrando prompt de instalação');
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
      console.log('📱 iOS ou navegador sem suporte nativo');
      // Para iOS, retornamos false para mostrar instruções manuais
      return false;
    }
  };

  const getInstallInstructions = (): string => {
    if (isIOS) {
      return `📱 Para instalar no iPhone/iPad:

1. Toque no botão "Compartilhar" 📤 
   (ícone de caixa com flecha na parte inferior)

2. Role para baixo no menu e toque em 
   "Adicionar à Tela de Início" 

3. Toque em "Adicionar" no canto superior direito

✨ Dica: Use o Safari para esta funcionalidade!

Após instalar, o Essentia aparecerá como um app nativo na sua tela inicial! 🎉`;
    } else {
      return `📱 Para instalar no Android/Chrome:

1. Toque no menu (⋯) no canto superior direito
2. Selecione "Adicionar à tela inicial" 
3. Toque em "Adicionar" para instalar

💻 No computador:
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
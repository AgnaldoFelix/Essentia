// components/PWAInstallBanner.tsx
import { useState, useEffect } from 'react';
import { Card, Button, Chip } from "@heroui/react";
import { Download, X, Smartphone, Rocket } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator as any).standalone === true;
    };

    setIsInstalled(checkIfInstalled());

    // Handler para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar banner apenas se não estiver instalado e usuário não tiver descartado recentemente
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed && !checkIfInstalled()) {
        setTimeout(() => setShowBanner(true), 3000); // Mostrar após 3 segundos
      }
    };

    // Verificar mudanças no display mode (quando instala/desinstala)
    const handleDisplayModeChange = () => {
      const installed = checkIfInstalled();
      setIsInstalled(installed);
      if (installed) {
        setShowBanner(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleDisplayModeChange);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleDisplayModeChange);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação do PWA');
        setShowBanner(false);
        localStorage.removeItem('pwa-banner-dismissed');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Salvar no localStorage que o usuário descartou (expira em 7 dias)
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleManualInstallInfo = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      alert(`📱 Para instalar no iPhone/iPad:
1. Toque no botão "Compartilhar" 📤
2. Role para baixo e toque em "Adicionar à Tela de Início" 
3. Toque em "Adicionar" no canto superior direito`);
    } else if (isAndroid) {
      alert(`📱 Para instalar no Android:
1. Toque no menu (⋯) no canto superior direito
2. Selecione "Adicionar à tela inicial" 
3. Toque em "Adicionar" para instalar`);
    } else {
      alert(`💻 Para instalar no computador:
1. Clique no ícone de instalação (📥) na barra de endereço
2. Ou no menu (⋯) → "Instalar Essentia..."`);
    }
  };

  // Não mostrar se já estiver instalado ou se não tiver suporte
  if (isInstalled || !showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <Card className="w-full bg-gradient-to-r from-purple-500 to-blue-600 shadow-2xl border-0">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-white/20 rounded-lg mt-1">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-lg">
                    Instalar App Essentia
                  </h3>
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    className="bg-white/20 text-white border-0"
                  >
                    <Rocket className="h-3 w-3 mr-1" />
                    PWA
                  </Chip>
                </div>
                
                <p className="text-white/90 text-sm mb-3">
                  Instale nosso app para uma experiência completa! 
                  Acesso offline, notificações e performance máxima. 
                  É grátis e leva apenas 10 segundos! 🚀
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={handleInstallClick}
                    className="bg-white text-purple-600 font-bold shadow-lg hover:scale-105 transition-transform"
                    startContent={<Download className="h-4 w-4" />}
                  >
                    Instalar Agora
                  </Button>
                  
                  <Button
                    color="default"
                    variant="flat"
                    onPress={handleManualInstallInfo}
                    className="text-white border-white/20"
                    startContent={<Smartphone className="h-4 w-4" />}
                  >
                    Como Instalar
                  </Button>
                </div>
              </div>
            </div>

            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={handleDismiss}
              className="text-white hover:bg-white/20 min-w-8 h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
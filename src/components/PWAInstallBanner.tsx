// components/PWAInstallBanner.tsx
import { useState, useEffect } from 'react';
import { Card, Button, Chip, Image } from "@heroui/react";
import { Download, X, Smartphone, Rocket } from "lucide-react";
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallBanner = () => {
  const { canInstall, isInstalled, installPWA, getInstallInstructions, isIOS } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    console.log('🎪 Estado do Banner PWA:', { canInstall, isInstalled, isIOS });

    // Não mostrar se já estiver instalado
    if (isInstalled) {
      console.log('✅ App já instalado - ocultando banner');
      setShowBanner(false);
      return;
    }

    // Verificar se o usuário já descartou o banner recentemente
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 semana em milliseconds

    // Se foi descartado há menos de 1 semana, não mostrar
    if (dismissedTime && (now - dismissedTime) < oneWeek) {
      console.log('⏰ Banner descartado recentemente - não mostrar');
      return;
    }

    // Mostrar banner se pode instalar (tem deferredPrompt) ou é iOS
    if (canInstall) {
      console.log('🚀 Mostrando banner em 3 segundos...');
      const timer = setTimeout(() => {
        console.log('🎪 Banner PWA sendo exibido');
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, isIOS]);

  const handleInstallClick = async () => {
    console.log('🖱️ Banner - Botão de instalação clicado');
    
    if (isIOS) {
      // iOS: mostrar instruções
      handleManualInstallInfo();
    } else {
      // Chrome/Android: tentar instalação nativa
      const success = await installPWA();
      if (success) {
        setShowBanner(false);
        localStorage.removeItem('pwa-banner-dismissed');
      }
    }
  };

  const handleDismiss = () => {
    console.log('❌ Banner descartado pelo usuário');
    setShowBanner(false);
    // Salvar no localStorage que o usuário descartou
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleManualInstallInfo = () => {
    const instructions = getInstallInstructions();
    alert(instructions);
  };

  // Não mostrar se já estiver instalado ou se não deve mostrar o banner
  if (isInstalled || !showBanner) {
    return null;
  }

  console.log('🎪 Renderizando banner PWA');

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <Card className="w-full bg-gradient-to-r from-purple-500 to-blue-600 shadow-2xl border-0">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Mostrar o ícone do app */}
              <div className="p-2 bg-white/20 rounded-lg mt-1">
                <Image
                  src="/Essentia.png"
                  alt="Essentia"
                  className="w-6 h-6 object-contain"
                />
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
                  {isIOS 
                    ? "Instale nosso app para acesso rápido pela tela inicial! Experiência nativa como um app verdadeiro. 🚀"
                    : "Instale nosso app para uma experiência completa! Acesso rápido, notificações e performance máxima. 🚀"
                  }
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={handleInstallClick}
                    className="bg-white text-purple-600 font-bold shadow-lg hover:scale-105 transition-transform"
                    startContent={<Download className="h-4 w-4" />}
                  >
                    {isIOS ? "Como Instalar" : "Instalar Agora"}
                  </Button>
                  
                  <Button
                    color="default"
                    variant="flat"
                    onPress={handleManualInstallInfo}
                    className="text-white border-white/20"
                    startContent={<Smartphone className="h-4 w-4" />}
                  >
                    Instruções
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
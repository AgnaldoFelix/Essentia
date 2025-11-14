// components/PWAInstallBanner.tsx
import { useState, useEffect } from 'react';
import { Card, Button, Chip, Image } from "@heroui/react";
import { Download, X, Smartphone, Rocket, Star } from "lucide-react";
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallBanner = () => {
  const { canInstall, isInstalled, installPWA, getInstallInstructions, isIOS } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    console.log('🎪 Verificando se deve mostrar banner PWA:', {
      canInstall,
      isInstalled,
      isIOS,
      bannerDismissed
    });

    // Não mostrar se já estiver instalado
    if (isInstalled) {
      console.log('✅ App já instalado - ocultando banner');
      setShowBanner(false);
      return;
    }

    // Verificar se o usuário já descartou o banner
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 1 dia em milliseconds

      // Se foi descartado há menos de 1 dia, não mostrar
      if (now - dismissedTime < oneDay) {
        console.log('⏰ Banner descartado recentemente - não mostrar');
        setBannerDismissed(true);
        return;
      }
    }

    // Mostrar banner se pode instalar (tem deferredPrompt) ou é iOS
    if (canInstall && !bannerDismissed) {
      console.log('🚀 Condições atendidas - mostrando banner em 2 segundos');
      const timer = setTimeout(() => {
        console.log('🎪 Exibindo banner PWA');
        setShowBanner(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, isIOS, bannerDismissed]);

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
      } else {
        // Se a instalação nativa falhar, mostrar instruções
        handleManualInstallInfo();
      }
    }
  };

  const handleDismiss = () => {
    console.log('❌ Banner descartado pelo usuário');
    setShowBanner(false);
    setBannerDismissed(true);
    // Salvar no localStorage que o usuário descartou
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleManualInstallInfo = () => {
    const instructions = getInstallInstructions();
    
    // Criar um modal mais bonito em vez de alert
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 24px;
        border-radius: 16px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">
          Como Instalar o Essentia
        </h3>
        <div style="text-align: left; margin-bottom: 24px; color: #4b5563; line-height: 1.6; font-size: 14px; white-space: pre-line;">
          ${instructions}
        </div>
        <button onclick="this.closest('div[style]').remove()" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          width: 100%;
        ">
          Entendi! 👍
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  };

  // Não mostrar se já estiver instalado ou se não deve mostrar o banner
  if (isInstalled || !showBanner) {
    return null;
  }

  console.log('🎪 Renderizando banner PWA');

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
      <Card className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 shadow-2xl border-0 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Ícone do app com animação */}
              <div className="p-2 bg-white/20 rounded-xl mt-1 animate-pulse">
                <Image
                  src="/Essentia.png"
                  alt="Essentia"
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-300" />
                    Instalar App Essentia
                  </h3>
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    className="bg-white/20 text-white border-0 font-semibold"
                  >
                    <Rocket className="h-3 w-3 mr-1" />
                    PWA
                  </Chip>
                </div>
                
                <p className="text-white/95 text-sm mb-4 leading-relaxed">
                  {isIOS 
                    ? "📲 Tenha o Essentia na sua tela inicial! Acesso instantâneo, experiência nativa e notificações personalizadas. É grátis! 🚀"
                    : "⚡ Instale o Essentia como app nativo! Funciona offline, notificações inteligentes e performance máxima. Totalmente gratuito! 🎯"
                  }
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={handleInstallClick}
                    className="bg-white text-blue-600 font-bold shadow-lg hover:scale-105 transition-all duration-200 hover:shadow-xl"
                    startContent={<Download className="h-4 w-4" />}
                    size="md"
                  >
                    {isIOS ? "📱 Como Instalar" : "🚀 Instalar Agora"}
                  </Button>
                  
                  <Button
                    color="default"
                    variant="flat"
                    onPress={handleManualInstallInfo}
                    className="text-white border-white/30 bg-white/10 hover:bg-white/20 transition-all"
                    startContent={<Smartphone className="h-4 w-4" />}
                    size="md"
                  >
                    Ver Instruções
                  </Button>
                </div>
              </div>
            </div>

            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={handleDismiss}
              className="text-white hover:bg-white/20 min-w-8 h-8 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se o app já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Detecta se o app foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação do PWA');
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDeferredPrompt(null);
    // Salva no localStorage para não mostrar novamente por um tempo
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !isVisible) return null;

  return (
    <Modal 
      isOpen={isVisible} 
      onClose={handleDismiss}
      size="md"
      classNames={{
        base: "border-0 bg-gradient-to-br from-blue-50 to-purple-50",
        header: "border-b-0",
        footer: "border-t-0"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-2 pt-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <Download className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Instalar Essentia
          </h2>
        </ModalHeader>
        <ModalBody className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-4xl animate-bounce">📱</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>⚡</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎯</div>
          </div>
          
          <p className="text-lg font-semibold text-default-700 mb-2">
            Instale o Essentia no seu celular!
          </p>
          
          <div className="space-y-3 text-sm text-default-600 text-left bg-white/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Acesso rápido direto da tela inicial</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Funciona offline</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Experiência de app nativo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Notificações de refeições e água</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex-col gap-3">
          <Button
            color="primary"
            onPress={handleInstall}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-6 text-lg"
            startContent={<Smartphone className="h-5 w-5" />}
          >
            Instalar Agora
          </Button>
          <Button
            variant="light"
            onPress={handleDismiss}
            className="w-full"
          >
            Agora Não
          </Button>
          
          <p className="text-xs text-default-500 text-center">
            Toque em "Instalar Agora" e depois em "Adicionar à Tela Inicial" 📲
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
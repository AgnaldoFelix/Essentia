// components/PWAInstallButton.tsx
import { Button, Tooltip } from "@heroui/react";
import { Download, Smartphone, Check } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export const PWAInstallButton = () => {
  const { canInstall, isInstalled, installPWA, getInstallInstructions, isIOS } = usePWAInstall();

  console.log('🔘 Estado do botão PWA:', { canInstall, isInstalled, isIOS });

  if (isInstalled) {
    return (
      <Tooltip content="App instalado com sucesso! 🎉">
        <Button
          color="success"
          variant="flat"
          isIconOnly
          className="text-success-600"
        >
          <Check className="h-4 w-4" />
        </Button>
      </Tooltip>
    );
  }

  // Mostrar botão se pode instalar (tem deferredPrompt) ou é iOS
  if (!canInstall) {
    console.log('❌ Botão não mostrado: canInstall é false');
    return null;
  }

  const handleInstallClick = async () => {
    console.log('🖱️ Botão de instalação clicado');
    const success = await installPWA();
    
    if (!success && isIOS) {
      // Para iOS, mostrar instruções já que não há instalação automática
      alert(getInstallInstructions());
    }
  };

  return (
    <div className="flex gap-2">
      <Tooltip content={isIOS ? "Como instalar no iPhone/iPad" : "Instalar App (PWA)"}>
        <Button
          color="primary"
          variant="flat"
          onPress={handleInstallClick}
          isIconOnly
          className="text-primary-600 animate-pulse"
        >
          <Download className="h-4 w-4" />
        </Button>
      </Tooltip>
      
      <Tooltip content="Instruções de instalação">
        <Button
          color="default"
          variant="flat"
          onPress={() => alert(getInstallInstructions())}
          isIconOnly
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  );
};
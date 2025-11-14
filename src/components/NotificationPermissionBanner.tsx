import { Bell, X } from 'lucide-react';
import { useState } from 'react';

interface NotificationPermissionBannerProps {
  onRequestPermission: () => void;
  onDismiss: () => void;
}

export const NotificationPermissionBanner = ({
  onRequestPermission,
  onDismiss
}: NotificationPermissionBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const handleRequest = () => {
    onRequestPermission();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Bell className="h-6 w-6" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              Ativar Notificações
            </h3>
            <p className="text-sm text-white/90 mb-3">
              Receba lembretes automáticos para suas refeições, mesmo com o app em segundo plano!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRequest}
                className="flex-1 bg-white text-orange-600 font-semibold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Ativar Agora
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
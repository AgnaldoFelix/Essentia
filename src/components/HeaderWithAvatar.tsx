// components/HeaderWithAvatar.tsx
import React from 'react';
import { Button } from '@heroui/react';
import { Menu, User } from 'lucide-react';

interface HeaderWithAvatarProps {
  onAvatarClick: () => void;
  avatarSvg?: string;
  userName: string;
  onMenuClick: () => void;
}

export const HeaderWithAvatar: React.FC<HeaderWithAvatarProps> = ({
  onAvatarClick,
  avatarSvg,
  userName,
  onMenuClick
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Avatar ao lado da Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="relative cursor-pointer group"
              onClick={onAvatarClick}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-105 transition-transform">
                {avatarSvg ? (
                  <div 
                    className="w-8 h-8"
                    dangerouslySetInnerHTML={{ __html: avatarSvg }}
                  />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background shadow-sm"></div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Essentia
              </h1>
              <p className="text-xs text-default-500">
                Olá, {userName}!
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="lg" 
          className="md:hidden"
          onPress={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
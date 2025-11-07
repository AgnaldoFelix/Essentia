// components/AvatarCreator.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody
} from '@heroui/react';
import { RefreshCw, User } from 'lucide-react';
import { AvatarService } from '@/services/avatarService';

interface AvatarCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarSvg: string) => void;
  userName?: string;
}

export const AvatarCreator: React.FC<AvatarCreatorProps> = ({
  isOpen,
  onClose,
  onSave,
  userName = 'Usuário'
}) => {
  const [avatarSvg, setAvatarSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Gerar avatar inicial automaticamente
  useEffect(() => {
    if (isOpen) {
      generateInitialAvatar();
    }
  }, [isOpen]);

  const generateInitialAvatar = async () => {
    setIsLoading(true);
    try {
      // Primeiro tentamos a API
      const svg = await AvatarService.generateSimpleAvatar(userName);
      setAvatarSvg(svg);
    } catch (error) {
      console.error('Erro ao gerar avatar da API, usando fallback:', error);
      // Se falhar, usamos o fallback com iniciais
      const fallbackSvg = AvatarService.generateInitialsAvatar(userName);
      setAvatarSvg(fallbackSvg);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomAvatar = async () => {
    setIsLoading(true);
    try {
      const randomSeed = Math.random().toString(36).substring(7);
      const svg = await AvatarService.generateAvatarSvg(randomSeed);
      setAvatarSvg(svg);
    } catch (error) {
      console.error('Erro ao gerar avatar aleatório, usando fallback:', error);
      const randomName = 'User' + Math.floor(Math.random() * 1000);
      const fallbackSvg = AvatarService.generateInitialsAvatar(randomName);
      setAvatarSvg(fallbackSvg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    onSave(avatarSvg);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Escolher Avatar</h2>
          <p className="text-default-500 text-sm">Seu avatar aparecerá no perfil</p>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-4">
            {/* Preview do Avatar */}
            <Card className="w-full max-w-xs">
              <CardBody className="flex flex-col items-center justify-center p-6">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border-4 border-default-200 shadow-lg"
                    dangerouslySetInnerHTML={{ 
                      __html: avatarSvg || 
                        '<div class="w-full h-full bg-primary rounded-full flex items-center justify-center text-white"><User className="h-12 w-12" /></div>'
                    }}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                      <RefreshCw className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <p className="text-default-600 text-sm mt-4 text-center">
                  {userName}
                </p>
              </CardBody>
            </Card>

            {/* Botão para gerar novo avatar */}
            <Button
              color="primary"
              variant="flat"
              onPress={generateRandomAvatar}
              startContent={<RefreshCw className="h-4 w-4" />}
              isDisabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Gerando...' : 'Gerar Novo Avatar'}
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSave}>
            Usar Este Avatar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
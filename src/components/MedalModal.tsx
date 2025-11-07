// components/MedalModal.tsx
import React from 'react';
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
import { MedalSystem } from '@/utils/medals';
import { Confetti } from './Confetti';

interface MedalModalProps {
  isOpen: boolean;
  onClose: () => void;
  medalType: 'gold' | 'silver' | 'bronze';
  message: string;
  percentage: number;
  category: 'protein' | 'calories';
}

export const MedalModal: React.FC<MedalModalProps> = ({
  isOpen,
  onClose,
  medalType,
  message,
  percentage,
  category
}) => {
  const categoryLabels = {
    protein: 'Proteína',
    calories: 'Calorias'
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      classNames={{
        base: "border-0 bg-gradient-to-br from-purple-50 to-blue-50",
        header: "border-b-0",
        footer: "border-t-0"
      }}
    >
      <ModalContent>
        <Confetti active={isOpen} />
        <ModalHeader className="flex flex-col items-center gap-1 pt-8">
          <div className="text-6xl">
            {MedalSystem.getMedalIcon(medalType)}
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Medalha Conquistada!
          </h2>
        </ModalHeader>
        <ModalBody className="text-center">
          <p className="text-lg font-semibold text-default-700">
            {message}
          </p>
          <p className="text-default-600">
            Você atingiu <strong>{percentage}%</strong> da sua meta de {categoryLabels[category]}!
          </p>
          <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border">
            <div className={`text-4xl ${MedalSystem.getMedalColor(medalType)}`}>
              {MedalSystem.getMedalIcon(medalType)}
            </div>
            <p className={`font-bold mt-2 ${MedalSystem.getMedalColor(medalType)}`}>
              Medalha de {medalType === 'gold' ? 'Ouro' : medalType === 'silver' ? 'Prata' : 'Bronze'}
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button 
            color="primary" 
            onPress={onClose}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold"
          >
            Continuar a Jornada!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
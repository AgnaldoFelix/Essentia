// components/WaterTracker.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Chip,
  useDisclosure,
  Divider,
  Checkbox,
  Switch
} from '@heroui/react';
import { 
  Plus, 
  Minus, 
  Edit, 
  Bell, 
  Droplets, 
  Trophy,
  CloudRain,
  Waves,
  Fish,
  Cloud,
  Sun,
  TestTube
} from 'lucide-react';
import { MedalSystem } from '@/utils/medals';
import { Confetti } from '@/components/Confetti';
import { useWaterNotifications } from '@/hooks/useWaterNotifications';
import { AdvancedWaterWaveAnimation } from './AdvancedWaterWaveAnimation';
import { WaterWaveAnimation } from './WaterWaveAnimation';
import ProfessionalWaterWaveAnimation from './ProfessionalWaterWaveAnimation';

interface WaterTrackerProps {
  onMedalEarned?: (medal: any) => void;
}

interface WaterAlarm {
  id: string;
  time: string;
  enabled: boolean;
  message: string;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ onMedalEarned }) => {
  // Estados
  const [waterGoal, setWaterGoal] = useState<number>(2000);
  const [waterConsumed, setWaterConsumed] = useState<number>(0);
  const [alarms, setAlarms] = useState<WaterAlarm[]>([
    { id: '1', time: '08:00', enabled: true, message: 'Hora de começar o dia hidratado! 💧' },
    { id: '2', time: '12:00', enabled: true, message: 'Água no almoço é essencial! 🥗' },
    { id: '3', time: '16:00', enabled: true, message: 'Hora do lanche e da água! 🍎' },
    { id: '4', time: '20:00', enabled: true, message: 'Última água do dia! 🌙' }
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState<string>('08:00');
  const [currentMedal, setCurrentMedal] = useState<any>(null);
  const [shownMedals, setShownMedals] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  // Hook de notificações
  const { requestNotificationPermission, sendTestNotification } = useWaterNotifications(alarms);

  // Modais
  const { isOpen: isMedalOpen, onOpen: onMedalOpen, onClose: onMedalClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAlarmsOpen, onOpen: onAlarmsOpen, onClose: onAlarmsClose } = useDisclosure();

  // Calcular porcentagem
  const waterPercentage = Math.min((waterConsumed / waterGoal) * 100, 100);

  // Efeito para medalhas
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const waterMedal = MedalSystem.calculateMedal(waterPercentage);
    
    if (waterMedal.type && waterPercentage > 0) {
      const medalKey = `water-${today}-${waterMedal.type}`;
      
      if (!shownMedals.has(medalKey)) {
        const medalData = {
          type: waterMedal.type,
          message: waterMedal.message,
          percentage: waterPercentage,
          category: 'water',
          date: today
        };
        
        setCurrentMedal(medalData);
        onMedalOpen();
        setShownMedals(prev => new Set(prev).add(medalKey));
        
        if (onMedalEarned) {
          onMedalEarned({
            id: `medal-${Date.now()}`,
            type: waterMedal.type,
            date: today,
            category: 'water',
            percentage: waterPercentage
          });
        }
      }
    }
  }, [waterPercentage, onMedalEarned, onMedalOpen, shownMedals]);

  // Funções de água com animação
  const addWater = (amount: number) => {
    setIsAnimating(true);
    setWaterConsumed(prev => prev + amount);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const removeWater = (amount: number) => {
    setIsAnimating(true);
    setWaterConsumed(prev => Math.max(0, prev - amount));
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Funções de alarme
  const addAlarm = () => {
    if (newAlarmTime) {
      const newAlarm: WaterAlarm = {
        id: `alarm-${Date.now()}`,
        time: newAlarmTime,
        enabled: true,
        message: 'Hora de beber água! 💧'
      };
      setAlarms(prev => [...prev, newAlarm]);
      setNewAlarmTime('08:00');
    }
  };

  const removeAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  // Função para testar notificações
  const handleTestNotification = async () => {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      sendTestNotification();
    } else {
      alert('Por favor, permita notificações para receber lembretes de água! 🔔');
    }
  };

  // Função para obter a cor da barra de progresso
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'primary';
    if (percentage >= 50) return 'warning';
    return 'default';
  };

  // Função para obter a medalha atual
  const getCurrentMedal = () => {
    const medal = MedalSystem.calculateMedal(waterPercentage);
    if (!medal.type) return null;
    
    return (
      <span className={`text-2xl ${MedalSystem.getMedalColor(medal.type)} animate-bounce`}>
        {MedalSystem.getMedalIcon(medal.type)}
      </span>
    );
  };

  // Componente da garrafa de água animada
  const WaterBottle = () => (
    <div className="relative w-32 h-48 mx-auto mb-6">
      {/* Garrafa */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-50 border-4 border-blue-200 rounded-2xl rounded-b-none shadow-lg">
        {/* Água dentro da garrafa */}
        <div 
          className={`absolute bottom-0 left-1 right-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg rounded-b-none transition-all duration-1000 ease-in-out ${
            isAnimating ? 'animate-splash' : ''
          }`}
          style={{ height: `${Math.min(waterPercentage, 100)}%` }}
        >
          {/* Bolhas */}
          {waterPercentage > 0 && (
            <>
              <div className="absolute top-2 left-4 w-2 h-2 bg-blue-200 rounded-full animate-float"></div>
              <div className="absolute top-6 right-3 w-1 h-1 bg-blue-200 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-10 left-6 w-1.5 h-1.5 bg-blue-200 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-16 right-5 w-1 h-1 bg-blue-200 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
            </>
          )}
        </div>
        
        {/* Tampinha */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-blue-300 rounded-full shadow-md"></div>
        {/* Alça */}
        <div className="absolute top-2 -right-2 w-6 h-10 bg-blue-200 rounded-full"></div>
      </div>
      
      {/* Decoracoes fofas */}
      <div className="absolute -top-2 -left-2 text-2xl animate-float">💧</div>
      <div className="absolute -top-4 -right-2 text-xl animate-float" style={{ animationDelay: '1s' }}>🐠</div>
      <div className="absolute -bottom-2 left-2 text-lg animate-bounce">🌊</div>
    </div>
  );

  // Modal de medalha
  const MedalModal = () => (
    <Modal 
      isOpen={isMedalOpen} 
      onClose={onMedalClose}
      size="md"
      classNames={{
        base: "border-0 bg-gradient-to-br from-blue-50 to-cyan-50",
        header: "border-b-0",
        footer: "border-t-0"
      }}
    >
      <ModalContent>
        <Confetti active={isMedalOpen} />
        <ModalHeader className="flex flex-col items-center gap-1 pt-8">
          <div className="text-6xl animate-pulse">
            {currentMedal && MedalSystem.getMedalIcon(currentMedal.type)}
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Medalha da Água! 🎉
          </h2>
        </ModalHeader>
        <ModalBody className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-4xl animate-bounce">💧</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌟</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>💧</div>
          </div>
          <p className="text-lg font-semibold text-default-700">
            {currentMedal?.message}
          </p>
          <p className="text-default-600">
            Você atingiu <strong>{currentMedal?.percentage.toFixed(1)}%</strong> da sua meta de água!
          </p>
          <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-default-200">
            <div className={`text-4xl ${currentMedal ? MedalSystem.getMedalColor(currentMedal.type) : ''}`}>
              {currentMedal && MedalSystem.getMedalIcon(currentMedal.type)}
            </div>
            <p className={`font-bold mt-2 ${currentMedal ? MedalSystem.getMedalColor(currentMedal.type) : ''}`}>
              Medalha de {currentMedal?.type === 'gold' ? 'Ouro' : currentMedal?.type === 'silver' ? 'Prata' : 'Bronze'}
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button 
            color="primary" 
            onPress={onMedalClose}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-8 shadow-lg"
          >
            Continuar Hidratando! 💪
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  // Modal de edição de meta
  const EditModal = () => (
    <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Edit className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-800">Configurar Meta de Água</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-2">💧</div>
              <p className="text-default-600">Quantos ml de água você quer beber hoje?</p>
            </div>
            
            <Input
              label="Meta diária de água"
              type="number"
              value={waterGoal.toString()}
              onValueChange={(value) => setWaterGoal(Number(value))}
              endContent={<span className="text-default-500">ml</span>}
              size="lg"
              classNames={{
                label: "text-blue-700 font-semibold",
                input: "text-lg text-center"
              }}
            />
            
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Sun className="h-4 w-4" />
                <span className="font-semibold">Dica Saudável</span>
              </div>
              <p className="text-sm text-blue-600">
                A recomendação geral é de 35ml por kg de peso corporal. 
                Se você pesa 70kg, sua meta seria cerca de 2450ml por dia! 🏃‍♂️
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onEditClose}>
            Cancelar
          </Button>
          <Button 
            color="primary" 
            onPress={onEditClose}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            Salvar Meta
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  // Modal de alarmes
  const AlarmsModal = () => (
    <Modal isOpen={isAlarmsOpen} onClose={onAlarmsClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-orange-800">Lembretes de Água</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">⏰💧</div>
              <p className="text-default-600">
                Configure lembretes para não esquecer de se hidratar!
              </p>
            </div>

            {/* Botão de teste de notificação */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-yellow-800">Testar Notificações</p>
                  <p className="text-sm text-yellow-600">
                    Verifique se as notificações estão funcionando
                  </p>
                </div>
                <Button
                  color="warning"
                  variant="flat"
                  onPress={handleTestNotification}
                  className="gap-2"
                  startContent={<TestTube className="h-4 w-4" />}
                >
                  Testar
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {alarms.map(alarm => (
                <div key={alarm.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <Switch 
                    isSelected={alarm.enabled}
                    onValueChange={() => toggleAlarm(alarm.id)}
                    color="warning"
                  />
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={alarm.time}
                      onValueChange={(value) => {
                        setAlarms(prev => prev.map(a => 
                          a.id === alarm.id ? { ...a, time: value } : a
                        ));
                      }}
                      size="sm"
                      classNames={{
                        input: "text-center"
                      }}
                    />
                    <p className="text-xs text-orange-600 mt-1">{alarm.message}</p>
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    color="danger"
                    size="sm"
                    onPress={() => removeAlarm(alarm.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Divider />
            
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={newAlarmTime}
                onValueChange={setNewAlarmTime}
                size="sm"
                placeholder="HH:MM"
                classNames={{
                  input: "text-center"
                }}
              />
              <Button
                variant="flat"
                color="warning"
                onPress={addAlarm}
                className="gap-1 flex-1"
              >
                <Plus className="h-4 w-4" />
                Adicionar Lembrete
              </Button>
            </div>

            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-sm text-green-700 text-center">
                💡 <strong>Dica:</strong> As notificações funcionam mesmo quando o app está fechado!
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onAlarmsClose}>
            Fechar
          </Button>
          <Button 
            color="warning" 
            onPress={onAlarmsClose}
            className="bg-gradient-to-r from-orange-500 to-yellow-500"
          >
            Salvar Lembretes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <Card className="w-full border-2 border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader className="flex gap-3 border-b border-blue-200 p-4 bg-white/80 rounded-t-2xl">
        <div className="p-2 bg-blue-100 rounded-xl shadow-sm">
          <Droplets className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex flex-col">
          <p className="text-md font-bold text-blue-800">Contador de Água</p>
          <p className="text-small text-blue-600">
            Mantenha-se hidratado! 💧
          </p>
        </div>
        {waterPercentage >= 100 && (
          <Chip 
            color="success" 
            variant="shadow" 
            className="ml-auto animate-pulse shadow-lg"
            startContent={<Trophy className="h-3 w-3 mr-1" />}
          >
            Meta Atingida!
          </Chip>
        )}
      </CardHeader>
      
      <CardBody className="p-6 space-y-6">
        {/* Garrafa de água animada */}
         <WaterWaveAnimation
    waterPercentage={waterPercentage}
    isAnimating={isAnimating}
  />

        {/* Progresso e estatísticas */}
        <div className="text-center space-y-4">
          <div className="flex justify-between items-center bg-white/80 rounded-2xl p-4 shadow-sm border border-blue-200">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-blue-700 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {waterConsumed}ml
              </p>
              <p className="text-xs text-blue-600 font-medium">Bebidos</p>
            </div>
            <div className="text-center flex-1 border-x border-blue-200">
              <p className="text-2xl font-bold text-cyan-700">{waterGoal}ml</p>
              <p className="text-xs text-cyan-600 font-medium">Meta</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-green-700">{Math.max(0, waterGoal - waterConsumed)}ml</p>
              <p className="text-xs text-green-600 font-medium">Faltam</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-3">
            <Progress
              aria-label="Progresso de água"
              className="w-full"
              color={getProgressColor(waterPercentage)}
              showValueLabel={true}
              size="lg"
              value={waterPercentage}
              classNames={{
                track: "shadow-inner bg-blue-100",
                indicator: "shadow-lg bg-gradient-to-r from-blue-400 to-cyan-400",
                value: "text-blue-700 font-bold"
              }}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-600 font-medium">
                {waterPercentage.toFixed(1)}% da meta
              </p>
              {getCurrentMedal()}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            color="primary" 
            variant="shadow"
            onPress={() => addWater(200)}
            className="gap-2 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg hover:shadow-xl transition-all"
            startContent={<Plus className="h-4 w-4" />}
          >
            +200ml
          </Button>
          <Button 
            color="primary" 
            variant="shadow"
            onPress={() => addWater(500)}
            className="gap-2 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg hover:shadow-xl transition-all"
            startContent={<Plus className="h-4 w-4" />}
          >
            +500ml
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            color="warning" 
            variant="flat"
            onPress={() => removeWater(200)}
            className="gap-2 h-10 border border-orange-200"
            startContent={<Minus className="h-4 w-4" />}
          >
            -200ml
          </Button>
          <Button 
            color="warning" 
            variant="flat"
            onPress={() => removeWater(500)}
            className="gap-2 h-10 border border-orange-200"
            startContent={<Minus className="h-4 w-4" />}
          >
            -500ml
          </Button>
        </div>

        {/* Botões de configuração */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            color="secondary" 
            variant="solid" 
            onPress={onEditOpen}
            className="gap-2 h-12 bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
            startContent={<Edit className="h-4 w-4" />}
          >
            Editar Meta
          </Button>
          <Button 
            color="warning" 
            variant="solid" 
            onPress={onAlarmsOpen}
            className="gap-2 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 shadow-lg"
            startContent={<Bell className="h-4 w-4" />}
          >
            Lembretes
          </Button>
        </div>

        {/* Mensagem motivacional */}
        {waterPercentage < 50 && (
          <div className="text-center p-3 bg-yellow-50 rounded-xl border border-yellow-200 animate-pulse">
            <p className="text-sm text-yellow-700 font-medium">
              💧 Vamos começar! Cada gota conta! 🌟
            </p>
          </div>
        )}
        {waterPercentage >= 50 && waterPercentage < 100 && (
          <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">
              🌊 Você está indo bem! Continue assim! 💪
            </p>
          </div>
        )}
        {waterPercentage >= 100 && (
          <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200 animate-bounce">
            <p className="text-sm text-green-700 font-medium">
              🎉 Parabéns! Você atingiu a meta hoje! 🌈
            </p>
          </div>
        )}
      </CardBody>

      {/* Rodapé com decoracoes */}
      <div className="p-3 bg-white/50 rounded-b-2xl border-t border-blue-200">
        <div className="flex justify-between items-center text-lg">
          <span className="animate-bounce">🐟</span>
          <span className="animate-float">💦</span>
          <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🌊</span>
          <span className="animate-float" style={{ animationDelay: '0.6s' }}>💧</span>
          <span className="animate-bounce" style={{ animationDelay: '0.9s' }}>🐠</span>
        </div>
      </div>

      {/* Modais */}
      <MedalModal />
      <EditModal />
      <AlarmsModal />
    </Card>
  );
};
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Progress,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Tooltip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Switch,
} from "@heroui/react";
import {
  Beef,
  Flame,
  Clock,
  Target,
  Award,
  Star,
  Bell,
  TestTube,
} from "lucide-react";
import { Meal, DailyPlan } from "@/types/nutrition";
import { MedalSystem } from "@/utils/medals";
import { Confetti } from "@/components/Confetti";
import { Medal } from "@/types/gamification";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { ChatRoom } from '@/components/ChatRoom';
import { MessageCircle } from 'lucide-react';
import { useOnlineUsers } from "@/hooks/useOnlineUsers";

interface DashboardStatsProProps {
  currentProtein: number;
  currentCalories: number;
  meals: Meal[];
  selectedPlan: DailyPlan | null;
  onMedalEarned?: (medal: Medal) => void;
}

interface MedalData {
  type: "gold" | "silver" | "bronze";
  message: string;
  percentage: number;
  category: "protein" | "calories";
  date: string;
}

export const DashboardStatsPro = ({
  currentProtein,
  currentCalories,
  meals,
  selectedPlan,
  onMedalEarned,
}: DashboardStatsProProps) => {
  // SEMPRE usar as metas do plano selecionado - ESSENCIAL!
  const proteinGoal = useMemo(() => selectedPlan?.proteinGoal || 150, [selectedPlan]);
  const caloriesGoal = useMemo(() => selectedPlan?.caloriesGoal || 2000, [selectedPlan]);

  const proteinPercentage = useMemo(() => Math.min((currentProtein / proteinGoal) * 100, 100), [currentProtein, proteinGoal]);
  const caloriesPercentage = useMemo(() => Math.min((currentCalories / caloriesGoal) * 100, 100), [currentCalories, caloriesGoal]);

  const proteinRemaining = useMemo(() => Math.max(proteinGoal - currentProtein, 0), [proteinGoal, currentProtein]);
  const caloriesRemaining = useMemo(() => Math.max(caloriesGoal - currentCalories, 0), [caloriesGoal, currentCalories]);

  const {
    isOpen: isMedalOpen,
    onOpen: onMedalOpen,
    onClose: onMedalClose,
  } = useDisclosure();
  const {
    isOpen: isNotificationsOpen,
    onOpen: onNotificationsOpen,
    onClose: onNotificationsClose,
  } = useDisclosure();

  const [currentMedal, setCurrentMedal] = useState<MedalData | null>(null);
  const [shownMedals, setShownMedals] = useState<Set<string>>(new Set());
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  // Hook de notificações com service worker
  const {
    isSupported: notificationsSupported,
    permission: notificationPermission,
    isEnabled: notificationsEnabled,
    isInitialized: notificationsInitialized,
    requestPermission: requestNotificationPermission,
    scheduleNotifications: scheduleMealNotifications,
    sendTestNotification,
    toggleNotifications: toggleNotificationSetting,
  } = useNotifications();

  // Ordenar refeições por horário
  const sortedMeals = useMemo(() => {
    return [...meals].sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
      return timeA - timeB;
    });
  }, [meals]);

  // Efeito para agendar notificações quando as refeições ou o plano mudam
  useEffect(() => {
    if (notificationsInitialized && notificationsEnabled && notificationPermission === "granted") {
      scheduleMealNotifications(meals, selectedPlan?.name || "Plano Atual");
    }
  }, [meals, selectedPlan, notificationsInitialized, notificationsEnabled, notificationPermission, scheduleMealNotifications]);

  // Efeito para mostrar o banner de permissão
  useEffect(() => {
    if (notificationsInitialized && !notificationsEnabled && notificationPermission === "default") {
      setShowPermissionBanner(true);
    }
  }, [notificationsInitialized, notificationsEnabled, notificationPermission]);

  // CORREÇÃO: Verificar e mostrar medalhas
  const checkMedals = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];

    // Verificar medalha de proteína
    const proteinMedal = MedalSystem.calculateMedal(proteinPercentage);
    if (proteinMedal.type && proteinPercentage > 0) {
      const medalKey = `protein-${today}-${proteinMedal.type}`;

      if (!shownMedals.has(medalKey)) {
        const medalData: MedalData = {
          type: proteinMedal.type,
          message: proteinMedal.message,
          percentage: proteinPercentage,
          category: "protein",
          date: today,
        };

        setCurrentMedal(medalData);
        onMedalOpen();
        setShownMedals((prev) => new Set(prev).add(medalKey));

        if (onMedalEarned && typeof onMedalEarned === "function") {
          onMedalEarned({
            id: `medal-${Date.now()}`,
            type: proteinMedal.type,
            date: today,
            category: "protein",
            percentage: proteinPercentage,
          });
        }
      }
    }

    // Verificar medalha de calorias
    const caloriesMedal = MedalSystem.calculateMedal(caloriesPercentage);
    if (caloriesMedal.type && caloriesPercentage > 0) {
      const medalKey = `calories-${today}-${caloriesMedal.type}`;

      if (!shownMedals.has(medalKey)) {
        const medalData: MedalData = {
          type: caloriesMedal.type,
          message: caloriesMedal.message,
          percentage: caloriesPercentage,
          category: "calories",
          date: today,
        };

        setCurrentMedal(medalData);
        onMedalOpen();
        setShownMedals((prev) => new Set(prev).add(medalKey));

        if (onMedalEarned && typeof onMedalEarned === "function") {
          onMedalEarned({
            id: `medal-${Date.now() + 1}`,
            type: caloriesMedal.type,
            date: today,
            category: "calories",
            percentage: caloriesPercentage,
          });
        }
      }
    }
  }, [proteinPercentage, caloriesPercentage, onMedalEarned, onMedalOpen, shownMedals]);

  useEffect(() => {
    checkMedals();
  }, [checkMedals]);

  // Função para lidar com a ativação de notificações
  const handleEnableNotifications = useCallback(async () => {
    const success = await toggleNotificationSetting(true);
    if (success) {
      setShowPermissionBanner(false);
    }
  }, [toggleNotificationSetting]);

  const handleTestNotification = useCallback(async () => {
    console.log('🔔 Botão de teste clicado');
    
    if (meals.length === 0) {
      alert('Adicione pelo menos uma refeição para testar as notificações!');
      return;
    }

    try {
      console.log('📊 Status antes do teste:');
      console.log('- Notificações habilitadas:', notificationsEnabled);
      console.log('- Service Worker suportado:', notificationsSupported);
      console.log('- Permissão:', notificationPermission);
      console.log('- Inicializado:', notificationsInitialized);

      const success = await sendTestNotification(meals[0]);
      
      if (success) {
        console.log('🎉 Teste de notificação bem-sucedido!');
      } else {
        console.log('❌ Teste de notificação falhou');
        alert('Por favor, permita notificações para receber lembretes de refeições! 🔔');
      }
    } catch (error) {
      console.error('💥 Erro inesperado no teste:', error);
      alert('Erro ao testar notificação. Verifique o console para detalhes.');
    }
  }, [meals, notificationsEnabled, notificationsSupported, notificationPermission, notificationsInitialized, sendTestNotification]);

  const getProgressColor = useCallback((percentage: number) => {
    if (percentage >= 100) return "success";
    if (percentage >= 75) return "primary";
    if (percentage >= 50) return "warning";
    return "default";
  }, []);

  const getMedalForPercentage = useCallback((percentage: number) => {
    const medal = MedalSystem.calculateMedal(percentage);
    if (!medal.type) return null;

    return (
      <Tooltip content={`${medal.message} (${percentage.toFixed(1)}%)`}>
        <span
          className={`text-2xl ${MedalSystem.getMedalColor(
            medal.type
          )} animate-bounce`}
        >
          {MedalSystem.getMedalIcon(medal.type)}
        </span>
      </Tooltip>
    );
  }, []);

  // Modal de configuração de notificações
  const NotificationsModal = useMemo(() => (
    <Modal
      isOpen={isNotificationsOpen}
      onClose={onNotificationsClose}
      size="lg"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-orange-800">
            Lembretes de Refeições
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6 overflow-y-auto max-h-[60vh]">
            <div className="text-center">
              <div className="text-4xl mb-2">🍽️⏰</div>
              <p className="text-default-600">
                Receba lembretes automáticos para suas refeições, mesmo com o app fechado!
              </p>
            </div>

            {/* Status do Service Worker */}
            <div className={`p-4 rounded-xl border ${
              notificationsSupported 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  notificationsSupported ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Bell className={`h-5 w-5 ${
                    notificationsSupported ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className={`font-semibold ${
                    notificationsSupported ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notificationsSupported 
                      ? 'Notificações Ativas em Segundo Plano' 
                      : 'Navegador Não Compatível'}
                  </p>
                  <p className={`text-sm ${
                    notificationsSupported ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {notificationsSupported 
                      ? 'Você receberá notificações mesmo com o app fechado'
                      : 'Seu navegador não suporta notificações em segundo plano'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Switch de ativação */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div>
                <p className="font-semibold text-orange-800">
                  Notificações de Refeições
                </p>
                <p className="text-sm text-orange-600">
                  Receba alertas 30 minutos antes e na hora de cada refeição
                </p>
              </div>
              <Switch
                isSelected={notificationsEnabled}
                onValueChange={toggleNotificationSetting}
                color="warning"
                size="lg"
                isDisabled={!notificationsSupported}
              />
            </div>

            {/* Status da Permissão */}
            <div className={`p-4 rounded-xl border ${
              notificationPermission === 'granted' 
                ? 'bg-green-50 border-green-200' 
                : notificationPermission === 'denied'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-semibold ${
                    notificationPermission === 'granted' 
                      ? 'text-green-800' 
                      : notificationPermission === 'denied'
                      ? 'text-red-800'
                      : 'text-yellow-800'
                  }`}>
                    Permissão: {
                      notificationPermission === 'granted' ? 'Concedida' :
                      notificationPermission === 'denied' ? 'Negada' :
                      'Pendente'
                    }
                  </p>
                  <p className={`text-sm ${
                    notificationPermission === 'granted' 
                      ? 'text-green-600' 
                      : notificationPermission === 'denied'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {notificationPermission === 'granted' 
                      ? 'Você receberá notificações de refeições'
                      : notificationPermission === 'denied'
                      ? 'Você precisa permitir notificações nas configurações do navegador'
                      : 'Clique em "Ativar Notificações" para permitir'
                    }
                  </p>
                </div>
                {notificationPermission !== 'granted' && (
                  <Button
                    color="warning"
                    variant="flat"
                    size="sm"
                    onPress={requestNotificationPermission}
                  >
                    Solicitar Permissão
                  </Button>
                )}
              </div>
            </div>

            {/* Botão de teste */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-yellow-800">
                    Testar Notificações
                  </p>
                  <p className="text-sm text-yellow-600">
                    Verifique se as notificações estão funcionando
                  </p>
                </div>
                <Button
                  color="warning"
                  variant="flat"
                  onPress={handleTestNotification}
                  className="gap-2"
                  isDisabled={!notificationsEnabled || meals.length === 0 || !notificationsSupported}
                  startContent={<TestTube className="h-4 w-4" />}
                >
                  Testar
                </Button>
              </div>
            </div>

            {/* Lista de refeições agendadas */}
            <div className="space-y-4 overflow-y-auto max-h-64">
              <h4 className="font-semibold text-default-800">
                Refeições Programadas
              </h4>
              {meals.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-default-500">
                    Nenhuma refeição cadastrada
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center gap-3 p-3 bg-default-100 rounded-lg"
                    >
                      <div className="text-2xl">{meal.emoji}</div>
                      <div className="flex-1">
                        <p className="font-medium text-default-800">
                          {meal.name}
                        </p>
                        <p className="text-sm text-default-600">{meal.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-default-700">
                          Notificações:
                        </p>
                        <p className="text-xs text-default-500">
                          30min antes + horário
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-700 text-center">
                💡 <strong>Funcionalidade Premium:</strong> Com o Service Worker ativo, você receberá notificações mesmo com o app fechado! Perfeito para não esquecer das refeições! 🚀
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onNotificationsClose}>
            Fechar
          </Button>
          <Button
            color="warning"
            onPress={onNotificationsClose}
            className="bg-gradient-to-r from-orange-500 to-yellow-500"
          >
            Salvar Configurações
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ), [isNotificationsOpen, notificationsSupported, notificationsEnabled, notificationPermission, toggleNotificationSetting, requestNotificationPermission, handleTestNotification, meals.length, sortedMeals, onNotificationsClose]);

  const MedalModal = useMemo(() => (
    <Modal
      isOpen={isMedalOpen}
      onClose={onMedalClose}
      size="md"
      classNames={{
        base: "border-0 bg-gradient-to-br from-purple-50 to-blue-50",
        header: "border-b-0",
        footer: "border-t-0",
      }}
    >
      <ModalContent>
        <Confetti active={isMedalOpen} />
        <ModalHeader className="flex flex-col items-center gap-1 pt-8">
          <div className="text-6xl animate-pulse">
            {currentMedal && MedalSystem.getMedalIcon(currentMedal.type)}
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Medalha Conquistada!
          </h2>
        </ModalHeader>
        <ModalBody className="text-center">
          <p className="text-lg font-semibold text-default-700">
            {currentMedal?.message}
          </p>
          <p className="text-default-600">
            Você atingiu <strong>{currentMedal?.percentage.toFixed(1)}%</strong>{" "}
            da sua meta de{" "}
            {currentMedal?.category === "protein" ? "proteína" : "calorias"}!
          </p>
          <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-default-200">
            <div
              className={`text-4xl ${
                currentMedal ? MedalSystem.getMedalColor(currentMedal.type) : ""
              }`}
            >
              {currentMedal && MedalSystem.getMedalIcon(currentMedal.type)}
            </div>
            <p
              className={`font-bold mt-2 ${
                currentMedal ? MedalSystem.getMedalColor(currentMedal.type) : ""
              }`}
            >
              Medalha de{" "}
              {currentMedal?.type === "gold"
                ? "Ouro"
                : currentMedal?.type === "silver"
                ? "Prata"
                : "Bronze"}
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            color="primary"
            onPress={onMedalClose}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-8"
          >
            Continuar a Jornada!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ), [isMedalOpen, currentMedal, onMedalClose]);

  // Comunidade de usuários online
  const { onlineUsers } = useOnlineUsers();
  const onlineUsersCount = useMemo(() => 
    onlineUsers.filter(user => user.isOnline && user.profileEnabled).length, 
    [onlineUsers]
  );

  // Cabeçalho com medalhas memoizado
  const proteinMedalIcon = useMemo(() => getMedalForPercentage(proteinPercentage), [proteinPercentage, getMedalForPercentage]);
  const caloriesMedalIcon = useMemo(() => getMedalForPercentage(caloriesPercentage), [caloriesPercentage, getMedalForPercentage]);

  // Totais do dia memoizados
  const totalRow = useMemo(() => (
    <TableRow className="bg-default-100 border-t-2 border-default-300">
      <TableCell colSpan={3} className="text-right font-bold py-4">
        <div className="flex items-center justify-end gap-2">
          <span>Total do Dia</span>
          <Progress
            size="sm"
            value={proteinPercentage}
            className="max-w-24"
            color="primary"
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <Chip
            color="primary"
            variant="solid"
            startContent={<span className="text-xs">📊</span>}
            className="font-bold shadow-md"
          >
            {currentProtein}g
          </Chip>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <Chip
            color="warning"
            variant="solid"
            startContent={<span className="text-xs">📊</span>}
            className="font-bold shadow-md"
          >
            {currentCalories}
          </Chip>
        </div>
      </TableCell>
    </TableRow>
  ), [proteinPercentage, currentProtein, currentCalories]);

  // Footer dos cards memoizado
  const proteinFooterMessage = useMemo(() => {
    if (proteinPercentage >= 100) return "Excelente! Meta superada!";
    if (proteinPercentage >= 90) return "Incrível! Quase lá!";
    if (proteinPercentage >= 75) return "Bom trabalho! Continue assim!";
    return null;
  }, [proteinPercentage]);

  const caloriesFooterMessage = useMemo(() => {
    if (caloriesPercentage >= 100) return "Excelente! Meta superada!";
    if (caloriesPercentage >= 90) return "Incrível! Quase lá!";
    if (caloriesPercentage >= 75) return "Bom trabalho! Continue assim!";
    return null;
  }, [caloriesPercentage]);

  // Total do dia mobile memoizado
  const mobileTotalSection = useMemo(() => (
    <div className="bg-default-100 rounded-xl p-4 border border-default-200 mt-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-default-800">Total do Dia</span>
        <div className="flex gap-2">
          <Chip
            color="primary"
            variant="solid"
            size="sm"
            startContent={<span className="text-xs">📊</span>}
            className="font-bold"
          >
            {currentProtein}g
          </Chip>
          <Chip
            color="warning"
            variant="solid"
            size="sm"
            startContent={<span className="text-xs">📊</span>}
            className="font-bold"
          >
            {currentCalories}
          </Chip>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-default-600">Progresso de Proteína</span>
          <span className="font-medium">{currentProtein}/{proteinGoal}g</span>
        </div>
        <Progress
          size="sm"
          value={proteinPercentage}
          color={getProgressColor(proteinPercentage)}
          className="w-full"
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-default-600">Progresso de Calorias</span>
          <span className="font-medium">{currentCalories}/{caloriesGoal}</span>
        </div>
        <Progress
          size="sm"
          value={caloriesPercentage}
          color={getProgressColor(caloriesPercentage)}
          className="w-full"
        />
      </div>
    </div>
  ), [currentProtein, proteinGoal, proteinPercentage, currentCalories, caloriesGoal, caloriesPercentage, getProgressColor]);

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        {/* Header com botão de notificações */}
        <div className="flex justify-between items-center">
          {/* Botão de configurações de notificação */}
          <Button
            color="warning"
            variant="flat"
            onPress={onNotificationsOpen}
            className="flex flex-start gap-2"
            startContent={<Bell className="h-4 w-4" />}
          >
            Lembretes
          </Button>
          <PWAInstallButton />
        </div>

        {/* Conteúdo das Tabs */}
        <Tabs aria-label="Metas Nutricionais" className="relative">
          <Tab
            key="proteina"
            title={
              <div className="flex items-center gap-2">
                <Beef className="h-4 w-4" />
                <span>Proteína</span>
                {proteinMedalIcon}
              </div>
            }
          >
            <Card className="w-full border-2 border-default-200/50 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex gap-3 border-b p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Beef className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-semibold">Meta de Proteína</p>
                  <p className="text-small text-default-500">
                    {proteinPercentage >= 100
                      ? "Meta atingida! 🎉"
                      : `Faltam ${proteinRemaining}g`}
                  </p>
                </div>
                {proteinPercentage >= 100 && (
                  <Chip
                    color="success"
                    variant="shadow"
                    className="ml-auto animate-pulse"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    Completo
                  </Chip>
                )}
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                <div className="flex justify-between items-baseline">
                  <div className="space-y-1">
                    <p className="text-4xl font-bold text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {currentProtein}g
                    </p>
                    <p className="text-small text-default-500">consumido</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Target className="h-4 w-4 text-primary" />
                      <p className="text-xl font-semibold">{proteinGoal}g</p>
                    </div>
                    <p className="text-small text-default-500">meta diária</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress
                    aria-label="Progresso de proteína"
                    className="w-full"
                    color={getProgressColor(proteinPercentage)}
                    showValueLabel={true}
                    size="lg"
                    value={proteinPercentage}
                    classNames={{
                      track: "shadow-inner",
                      indicator: "shadow-sm",
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-small text-default-500">
                      {proteinPercentage.toFixed(1)}% da meta diária
                    </p>
                    {proteinMedalIcon}
                  </div>
                </div>
              </CardBody>
              {proteinFooterMessage && (
                <CardFooter className="bg-success-50 border-t border-success-200">
                  <div className="flex items-center gap-2 text-success-700">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">{proteinFooterMessage}</span>
                  </div>
                </CardFooter>
              )}
            </Card>
          </Tab>

          <Tab
            key="calorias"
            title={
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <span>Calorias</span>
                {caloriesMedalIcon}
              </div>
            }
          >
            <Card className="w-full border-2 border-default-200/50 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex gap-3 border-b p-4 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Flame className="h-6 w-6 text-warning" />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-semibold">Meta de Calorias</p>
                  <p className="text-small text-default-500">
                    {caloriesPercentage >= 100
                      ? "Meta atingida! 🎉"
                      : `Faltam ${caloriesRemaining} kcal`}
                  </p>
                </div>
                {caloriesPercentage >= 100 && (
                  <Chip
                    color="success"
                    variant="shadow"
                    className="ml-auto animate-pulse"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    Completo
                  </Chip>
                )}
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                <div className="flex justify-between items-baseline">
                  <div className="space-y-1">
                    <p className="text-4xl font-bold text-warning bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {currentCalories}
                    </p>
                    <p className="text-small text-default-500">consumido</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Target className="h-4 w-4 text-warning" />
                      <p className="text-xl font-semibold">
                        {caloriesGoal} kcal
                      </p>
                    </div>
                    <p className="text-small text-default-500">meta diária</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress
                    aria-label="Progresso de calorias"
                    className="w-full"
                    color={getProgressColor(caloriesPercentage)}
                    showValueLabel={true}
                    size="lg"
                    value={caloriesPercentage}
                    classNames={{
                      track: "shadow-inner",
                      indicator: "shadow-sm",
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-small text-default-500">
                      {caloriesPercentage.toFixed(1)}% da meta diária
                    </p>
                    {caloriesMedalIcon}
                  </div>
                </div>
              </CardBody>
              {caloriesFooterMessage && (
                <CardFooter className="bg-success-50 border-t border-success-200">
                  <div className="flex items-center gap-2 text-success-700">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">{caloriesFooterMessage}</span>
                  </div>
                </CardFooter>
              )}
            </Card>
          </Tab>

          {/* <Tab
            key="comunidade"
            title={
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Comunidade</span>
                {onlineUsersCount > 0 && (
                  <Chip color="primary" variant="flat" size="sm">
                    {onlineUsersCount}
                  </Chip>
                )}
              </div>
            }
          >
            <ChatRoom />
          </Tab> */}

          <Tab
            key="refeicoes"
            title={
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Refeições</span>
                {meals.length > 0 && (
                  <Chip color="primary" variant="flat" size="sm">
                    {meals.length}
                  </Chip>
                )}
              </div>
            }
          >
            <Card className="w-full border-2 border-default-200/50 shadow-lg">
              <CardHeader className="flex gap-3 border-b p-4 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-semibold">Refeições do Dia</p>
                  <p className="text-small text-default-500">
                    {selectedPlan?.name || "Plano atual"}
                  </p>
                </div>
                <Chip color="primary" variant="shadow" className="ml-auto">
                  {meals.length} refeições
                </Chip>
              </CardHeader>
              <CardBody className="p-0">
                <div className="w-full">
                  {/* Header Mobile */}
                  <div className="block md:hidden bg-default-100 p-4 rounded-t-2xl border-b border-default-200">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-default-800">
                        Plano Alimentar
                      </h2>
                      <Chip color="primary" variant="flat" size="sm">
                        {new Date().toLocaleDateString("pt-BR")}
                      </Chip>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-default-600">
                        {sortedMeals.length} refeições
                      </span>
                      <div className="flex gap-2">
                        <Chip
                          color="primary"
                          variant="flat"
                          size="sm"
                          startContent={<span className="text-xs">🎯</span>}
                        >
                          {proteinGoal}g
                        </Chip>
                        <Chip
                          color="warning"
                          variant="flat"
                          size="sm"
                          startContent={<span className="text-xs">🎯</span>}
                        >
                          {caloriesGoal}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  {/* Table - Desktop */}
                  <div className="hidden md:block">
                    <Table
                      aria-label="Plano alimentar diário"
                      isStriped
                      isHeaderSticky
                      selectionMode="none"
                      className="min-w-full"
                      classNames={{
                        base: "shadow-lg rounded-2xl border border-default-200",
                        table: "min-w-full",
                        thead: "[&>tr]:first:rounded-lg",
                        th: "bg-default-100 text-default-700 font-bold text-sm py-4",
                        td: "py-3 border-b border-default-100",
                        tr: "hover:bg-default-50 transition-colors",
                      }}
                      topContent={
                        <div className="flex justify-between items-center p-4">
                          <h2 className="text-xl font-bold text-default-800">
                            Plano Alimentar -{" "}
                            {selectedPlan?.name || "Plano atual"}
                          </h2>
                          <Chip color="primary" variant="flat" size="sm">
                            {new Date().toLocaleDateString("pt-BR")}
                          </Chip>
                        </div>
                      }
                      bottomContent={
                        <div className="p-4 bg-default-50 border-t border-default-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-default-600">
                              {sortedMeals.length} refeições programadas
                            </span>
                            <div className="flex gap-3">
                              <Tooltip
                                content={`Meta de proteína diária: ${proteinGoal}g`}
                              >
                                <Chip
                                  color="primary"
                                  variant="flat"
                                  startContent={<span className="text-xs">🎯</span>}
                                >
                                  Meta: {proteinGoal}g
                                </Chip>
                              </Tooltip>
                              <Tooltip
                                content={`Meta calórica diária: ${caloriesGoal} kcal`}
                              >
                                <Chip
                                  color="warning"
                                  variant="flat"
                                  startContent={<span className="text-xs">🎯</span>}
                                >
                                  Meta: {caloriesGoal} kcal
                                </Chip>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <TableHeader>
                        <TableColumn className="w-24 text-center">
                          HORÁRIO
                        </TableColumn>
                        <TableColumn className="min-w-32">REFEIÇÃO</TableColumn>
                        <TableColumn className="min-w-48">
                          ALIMENTOS
                        </TableColumn>
                        <TableColumn className="w-28 text-center">
                          PROTEÍNA
                        </TableColumn>
                        <TableColumn className="w-28 text-center">
                          CALORIAS
                        </TableColumn>
                      </TableHeader>
                      <TableBody
                        emptyContent={
                          <div className="text-center py-8">
                            <div className="text-4xl mb-2">🍽️</div>
                            <p className="text-default-500">
                              Nenhuma refeição cadastrada
                            </p>
                          </div>
                        }
                      >
                        {sortedMeals.map((meal, index) => (
                          <React.Fragment key={meal.id}>
                            <TableRow key={meal.id} className="group">
                              <TableCell>
                                <div className="flex flex-col items-center">
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color="secondary"
                                    className="font-mono text-xs"
                                  >
                                    {meal.time}
                                  </Chip>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-default-100 rounded-lg flex items-center justify-center">
                                    <span className="text-sm">
                                      {meal.emoji}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-default-800">
                                      {meal.name}
                                    </span>
                                    {meal.description && (
                                      <span className="text-xs text-default-500">
                                        {meal.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                  {meal.foods.map(
                                    (
                                      food: { name: string; amount?: string },
                                      index
                                    ) => (
                                      <Tooltip
                                        key={index}
                                        content={`${food.name}${
                                          food.amount ? ` - ${food.amount}` : ""
                                        }`}
                                      >
                                        <Chip
                                          size="sm"
                                          variant="flat"
                                          color="default"
                                          className="max-w-32 truncate transition-all hover:scale-105"
                                        >
                                          {food.amount
                                            ? `${food.name} (${food.amount})`
                                            : food.name}
                                        </Chip>
                                      </Tooltip>
                                    )
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  <Chip
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    startContent={
                                      <span className="text-xs">🥩</span>
                                    }
                                    className="font-semibold"
                                  >
                                    {meal.protein}g
                                  </Chip>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  <Chip
                                    color="warning"
                                    variant="flat"
                                    size="sm"
                                    startContent={
                                      <span className="text-xs">🔥</span>
                                    }
                                    className="font-semibold"
                                  >
                                    {meal.calories}
                                  </Chip>
                                </div>
                              </TableCell>
                            </TableRow>
                            {index === sortedMeals.length - 1 && totalRow}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="block md:hidden space-y-3 p-4 bg-white rounded-b-2xl shadow-lg border border-t-0 border-default-200">
                    {sortedMeals.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🍽️</div>
                        <p className="text-default-500">
                          Nenhuma refeição cadastrada
                        </p>
                      </div>
                    ) : (
                      <>
                        {sortedMeals.map((meal) => (
                          <div
                            key={meal.id}
                            className="bg-white rounded-xl border border-default-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* Header do Card */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-default-100 rounded-lg flex items-center justify-center">
                                  <span className="text-base">
                                    {meal.emoji}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-default-800">
                                    {meal.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color="secondary"
                                      className="font-mono text-xs"
                                    >
                                      {meal.time}
                                    </Chip>
                                    {meal.description && (
                                      <span className="text-xs text-default-500">
                                        {meal.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Alimentos */}
                            <div className="mb-3">
                              <p className="text-xs font-medium text-default-600 mb-2">
                                ALIMENTOS:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {meal.foods.map(
                                  (
                                    food: { name: string; amount?: string },
                                    index
                                  ) => (
                                    <Chip
                                      key={index}
                                      size="sm"
                                      variant="flat"
                                      color="default"
                                      className="text-xs max-w-28 truncate"
                                    >
                                      {food.amount
                                        ? `${food.name} (${food.amount})`
                                        : food.name}
                                    </Chip>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Métricas */}
                            <div className="flex justify-between items-center pt-2 border-t border-default-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-xs text-default-600">
                                  Proteína
                                </span>
                                <Chip
                                  color="primary"
                                  variant="flat"
                                  size="sm"
                                  className="font-semibold text-xs"
                                >
                                  {meal.protein}g
                                </Chip>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-warning rounded-full"></div>
                                <span className="text-xs text-default-600">
                                  Calorias
                                </span>
                                <Chip
                                  color="warning"
                                  variant="flat"
                                  size="sm"
                                  className="font-semibold text-xs"
                                >
                                  {meal.calories}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        ))}
                        {mobileTotalSection}
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      <PWAInstallBanner />

      {MedalModal}
      {NotificationsModal}

      {showPermissionBanner && (
        <NotificationPermissionBanner
          onRequestPermission={handleEnableNotifications}
          onDismiss={() => setShowPermissionBanner(false)}
        />
      )}
    </>
  );
};
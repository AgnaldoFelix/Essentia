// components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Progress,
  Tabs,
  Tab,
  Chip,
  Divider
} from '@heroui/react';
import {
  User,
  Target,
  Scale,
  Ruler,
  Activity,
  Trophy,
  Award,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { UserProfile } from '@/types/gamification';
import { AvatarCreator } from '@/components/AvatarCreator';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';


interface ProfilePageProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  medals: any[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onProfileUpdate,
  medals
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isAvatarCreatorOpen, setIsAvatarCreatorOpen] = useState(false);
  
  // Usar o hook para acessar as funções do contexto
  const { updateUserProfile, initializeUser, currentUser } = useOnlineUsers();

  // Calcular IMC automaticamente
  useEffect(() => {
    if (formData.height && formData.height > 0 && formData.weight && formData.weight > 0) {
      const heightInMeters = formData.height / 100;
      const bmi = formData.weight / (heightInMeters * heightInMeters);
      setFormData(prev => ({ ...prev, bmi: Number(bmi.toFixed(1)) }));
    }
  }, [formData.height, formData.weight]);

  // Função auxiliar para gerar ID de usuário
  const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSave = async () => {
    // Salvar localmente
    onProfileUpdate(formData);
    
    // Criar/atualizar usuário no Supabase
    if (currentUser) {
      await updateUserProfile(formData);
    } else {
      // Se não há usuário atual, criar um novo
      const userId = generateUserId();
      await initializeUser({
        id: userId,
        username: formData.nickname || formData.name || 'Usuário',
        age: formData.age || 25,
        avatar: formData.avatar,
      });
    }
    
    setIsEditing(false);
  };

  const handleAvatarSave = (avatarSvg: string) => {
    const updatedProfile = { ...formData, avatar: avatarSvg };
    setFormData(updatedProfile);
    onProfileUpdate(updatedProfile);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'warning' as const };
    if (bmi < 25) return { category: 'Peso normal', color: 'success' as const };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'warning' as const };
    return { category: 'Obesidade', color: 'danger' as const };
  };

  const bmiInfo = formData.bmi ? getBMICategory(formData.bmi) : null;

  // Função segura para obter valores numéricos
  const getSafeNumber = (value: any, defaultValue: number = 0): string => {
    if (value === undefined || value === null) return defaultValue.toString();
    return value.toString();
  };

  // Função segura para obter valores de texto
  const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === undefined || value === null) return defaultValue;
    return value;
  };

  // Configuração comum para os inputs
  const inputClassNames = {
    base: "w-full",
    label: "text-default-700 font-semibold text-sm mb-8",
    input: "text-base",
    inputWrapper: "data-[hover=true]:bg-default-100 group-data-[focus=true]:bg-default-100",
    description: "text-default-500 text-xs"
  };

  const selectClassNames = {
    ...inputClassNames,
    trigger: "bg-default-50 border-1 border-default-200",
    value: "text-default-900",
    popoverContent: "bg-white border-1 border-default-200"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-default-50 to-default-100 p-4 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-default-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-default-800 truncate">
              Perfil
            </h2>
            <p className="text-default-500 text-sm sm:text-base mt-1">
              Gerencie suas informações e metas
            </p>
          </div>
          <Button
            color={isEditing ? "success" : "primary"}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            className="w-full sm:w-auto min-w-[140px]"
            size="lg"
          >
            {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="xl:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader className="flex items-center gap-3 pb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-default-800">Informações Pessoais</h3>
              </CardHeader>
              <CardBody className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Nome Completo"
                    value={getSafeString(formData.name, 'Usuário')}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="Digite seu nome completo"
                  />
                  <Input
                    label="Apelido"
                    value={getSafeString(formData.nickname, 'usuário')}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, nickname: value }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="Como prefere ser chamado"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <Input
                    type="number"
                    label="Idade"
                    value={getSafeNumber(formData.age, 25)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, age: Number(value) }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="Sua idade"
                    min={1}
                    max={120}
                  />
                  <Select
                    label="Gênero"
                    selectedKeys={[getSafeString(formData.gender, 'other')]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setFormData(prev => ({ ...prev, gender: key as any }));
                    }}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={selectClassNames}
                    placeholder="Selecione o gênero"
                  >
                    <SelectItem key="male">Masculino</SelectItem>
                    <SelectItem key="female">Feminino</SelectItem>
                    <SelectItem key="other">Outro</SelectItem>
                  </Select>
                  <Input
                    type="number"
                    label="Circunferência Abdominal"
                    value={getSafeNumber(formData.abdominalCircumference)}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      abdominalCircumference: value ? Number(value) : undefined 
                    }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="cm"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">cm</span>
                      </div>
                    }
                  />
                </div>
              </CardBody>
            </Card>

            {/* Goals Card */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader className="flex items-center gap-3 pb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-default-800">Metas e Objetivos</h3>
              </CardHeader>
              <CardBody className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Select
                    label="Objetivo Principal"
                    selectedKeys={[getSafeString(formData.objective, 'maintain')]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setFormData(prev => ({ ...prev, objective: key as any }));
                    }}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={selectClassNames}
                    placeholder="Selecione seu objetivo"
                  >
                    <SelectItem key="gain_muscle">Ganhar Massa Muscular</SelectItem>
                    <SelectItem key="lose_fat">Perder Gordura</SelectItem>
                    <SelectItem key="maintain">Manter Peso</SelectItem>
                  </Select>
                  
                  <Select
                    label="Nível de Atividade"
                    selectedKeys={[getSafeString(formData.activityLevel, 'moderate')]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setFormData(prev => ({ ...prev, activityLevel: key as any }));
                    }}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={selectClassNames}
                    placeholder="Selecione seu nível"
                  >
                    <SelectItem key="sedentary">Sedentário</SelectItem>
                    <SelectItem key="light">Leve</SelectItem>
                    <SelectItem key="moderate">Moderado</SelectItem>
                    <SelectItem key="intense">Intenso</SelectItem>
                    <SelectItem key="athlete">Atleta</SelectItem>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Input
                    type="number"
                    label="Peso Inicial"
                    value={getSafeNumber(formData.initialWeight, 70)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, initialWeight: Number(value) }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="kg"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">kg</span>
                      </div>
                    }
                  />
                  <Input
                    type="number"
                    label="Peso Atual"
                    value={getSafeNumber(formData.weight, 70)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, weight: Number(value) }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="kg"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">kg</span>
                      </div>
                    }
                  />
                  <Input
                    type="number"
                    label="Meta de Peso"
                    value={getSafeNumber(formData.weightGoal, 75)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, weightGoal: Number(value) }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="kg"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">kg</span>
                      </div>
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    type="number"
                    label="Altura"
                    value={getSafeNumber(formData.height, 170)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, height: Number(value) }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="cm"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">cm</span>
                      </div>
                    }
                  />
                  <Input
                    type="number"
                    label="Meta de Proteína Diária"
                    value={getSafeNumber(formData.dailyProteinGoal, 150)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dailyProteinGoal: Number(value) }))}
                    isDisabled={!isEditing}
                    size="lg"
                    classNames={inputClassNames}
                    placeholder="gramas"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">g</span>
                      </div>
                    }
                  />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Stats and Avatar */}
          <div className="space-y-6">
            {/* Avatar Card */}
            <Card className="shadow-sm border border-default-200">
              <CardBody className="text-center p-6">
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg border-4 border-white mb-4 cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setIsAvatarCreatorOpen(true)}
                  dangerouslySetInnerHTML={{ 
                    __html: formData.avatar || 
                    '<div class="w-full h-full bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">👤</div>' 
                  }}
                />
                <h3 className="font-bold text-lg sm:text-xl text-default-800 truncate px-2 mb-1">
                  {getSafeString(formData.name, 'Usuário')}
                </h3>
                <p className="text-default-500 text-sm truncate px-2 mb-4">
                  @{getSafeString(formData.nickname, 'usuário')}
                </p>
                <Button 
                  variant="flat" 
                  size="md"
                  className="w-full"
                  onPress={() => setIsAvatarCreatorOpen(true)}
                >
                  Personalizar Avatar
                </Button>
              </CardBody>
            </Card>

            {/* BMI Card */}
            {formData.bmi && (
              <Card className="shadow-sm border border-default-200">
                <CardHeader className="flex items-center gap-3 pb-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Scale className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-semibold text-default-800 text-base">Seu IMC</h4>
                </CardHeader>
                <CardBody className="pt-0 space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-default-800 mb-2">{formData.bmi.toFixed(1)}</p>
                    {bmiInfo && (
                      <Chip color={bmiInfo.color} variant="flat" className="text-sm font-medium">
                        {bmiInfo.category}
                      </Chip>
                    )}
                  </div>
                  <Progress 
                    value={Math.min((formData.bmi / 40) * 100, 100)} 
                    color={bmiInfo?.color}
                    size="sm"
                    classNames={{
                      track: "bg-default-100",
                      indicator: "shadow-sm"
                    }}
                  />
                  <div className="flex justify-between text-xs text-default-500 font-medium">
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40+</span>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Weight Progress Card */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader className="flex items-center gap-3 pb-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold text-default-800 text-base">Progresso do Peso</h4>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-default-700 font-medium">Inicial</span>
                    <span className="font-semibold text-default-800">{getSafeNumber(formData.initialWeight, 70)}kg</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-default-700 font-medium">Atual</span>
                    <span className="font-semibold text-default-800">{getSafeNumber(formData.weight, 70)}kg</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-default-700 font-medium">Meta</span>
                    <span className="font-semibold text-primary">{getSafeNumber(formData.weightGoal, 75)}kg</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-default-700 font-medium">Diferença</span>
                    <span className={`font-semibold text-sm ${
                      (formData.weight || 0) - (formData.initialWeight || 0) > 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {((formData.weight || 0) - (formData.initialWeight || 0)) > 0 ? '+' : ''}
                      {((formData.weight || 0) - (formData.initialWeight || 0)).toFixed(1)}kg
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Medals Card */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader className="flex items-center gap-3 pb-3">
                <div className="p-2 bg-warning-50 rounded-lg">
                  <Trophy className="h-4 w-4 text-warning" />
                </div>
                <h4 className="font-semibold text-default-800 text-base">Medalhas Recentes</h4>
              </CardHeader>
              <CardBody className="pt-0">
                {medals.length === 0 ? (
                  <div className="text-center py-6">
                    <Trophy className="h-12 w-12 text-default-300 mx-auto mb-3" />
                    <p className="text-default-500 text-sm font-medium">
                      Complete suas metas para ganhar medalhas!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medals.slice(0, 3).map(medal => (
                      <div key={medal.id} className="flex items-center gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
                        <span className="text-2xl flex-shrink-0">
                          {medal.type === 'gold' ? '🥇' : medal.type === 'silver' ? '🥈' : '🥉'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-default-800 truncate">
                            {medal.category === 'protein' ? 'Proteína' : 
                             medal.category === 'calories' ? 'Calorias' : 
                             medal.category || 'Conquista'}
                          </p>
                          <p className="text-xs text-default-500 truncate font-medium">
                            {medal.date ? new Date(medal.date).toLocaleDateString('pt-BR') : 'Data não disponível'}
                          </p>
                        </div>
                        <Chip size="sm" variant="flat" color="warning" className="flex-shrink-0 font-semibold">
                          {medal.percentage}%
                        </Chip>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <AvatarCreator
        isOpen={isAvatarCreatorOpen}
        onClose={() => setIsAvatarCreatorOpen(false)}
        onSave={handleAvatarSave}
      />
    </div>
  );
};
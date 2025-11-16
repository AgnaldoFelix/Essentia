import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Avatar,
  Chip,
  ScrollShadow,
  Textarea,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Badge,
  Tooltip,
} from "@heroui/react";
import { 
  Send, 
  Users, 
  MessageCircle, 
  User, 
  Settings, 
  Menu,
  X,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useApiHealth } from '@/hooks/useApiHealth';


export const ChatRoom = () => {
  const {
    onlineUsers,
    currentUser,
    isProfileEnabled,
    toggleProfile,
    addMessage,
    chatMessages,
    updateCurrentUser,
    initializeUser,
    syncEnabled,
    syncStatus,
    syncLabel,
  } = useOnlineUsers();
   const { isOnline, isLoading, apiUrl } = useApiHealth();

  const [newMessage, setNewMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(currentUser?.name || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(false);

    const ApiStatusIndicator = () => (
    <Tooltip content={`API: ${apiUrl} - ${isOnline ? 'Online' : 'Offline'}`}>
      <Chip
        color={isOnline ? "success" : "danger"}
        variant="flat"
        size="sm"
        className="border-0"
      >
        <div className="flex items-center gap-1">
          {isOnline ? 
            <Wifi className="h-3 w-3" /> : 
            <WifiOff className="h-3 w-3" />
          }
          API {isOnline ? 'Online' : 'Offline'}
        </div>
      </Chip>
    </Tooltip>
  );

  const SyncIndicator = () => (
    <Tooltip content={syncLabel}>
      <Chip
        color={
          syncStatus === 'full' ? "success" : 
          syncStatus === 'local' ? "warning" : "danger"
        }
        variant="flat"
        size="sm"
        className="border-0"
      >
        <div className="flex items-center gap-1">
          {syncStatus === 'full' ? 
            <Wifi className="h-3 w-3" /> : 
            syncStatus === 'local' ?
            <Users className="h-3 w-3" /> :
            <WifiOff className="h-3 w-3" />
          }
          {syncStatus === 'full' ? 'Multi-Origem' : 
           syncStatus === 'local' ? 'Apenas Local' : 'Offline'}
        </div>
      </Chip>
    </Tooltip>
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔄 SCROLL AUTOMÁTICO PARA NOVAS MENSAGENS
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // 🔄 ATUALIZAR NOME DO USUÁRIO QUANDO currentUser MUDAR
  useEffect(() => {
    if (currentUser?.name) {
      setUserName(currentUser.name);
    }
  }, [currentUser]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const message = {
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar, // 🔥 Usar avatar atual do usuário
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'text' as const,
    };

    addMessage(message);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveProfile = async () => {
    if (userName.trim()) {
      // Se já existe um usuário atual, atualizar
      if (currentUser) {
        updateCurrentUser({
          name: userName,
          profileEnabled: true,
          isOnline: true,
        });
      } else {
        // Se não existe, criar novo usuário
        await initializeUser({
          id: `user_${Date.now()}`,
          username: userName,
          age: 25,
          avatar: '/Essentia.png', // Avatar padrão
        });
      }
      
      setIsEditingProfile(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onlineCount = onlineUsers.filter(user => user.isOnline && user.profileEnabled).length;

  // 🔥 COMPONENTE DE AVATAR SEGURO
  const SafeAvatar = ({ src, name, className = "" }: { src: string; name: string; className?: string }) => {
    // Verificar se o src é um SVG válido ou uma URL
    const isSvg = src?.startsWith('<svg') || src?.includes('data:image/svg+xml');
    const isValidUrl = src?.startsWith('http') || src?.startsWith('/') || src?.startsWith('data:image');
    
    if (!isValidUrl && !isSvg) {
      // Fallback para avatar com iniciais
      return (
        <Avatar
          name={name}
          className={className}
          getInitials={(name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
        />
      );
    }

    if (isSvg) {
      // Renderizar SVG inline
      return (
        <div className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full ${className}`}>
          <div 
            className="w-full h-full rounded-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: src }}
          />
        </div>
      );
    }

    // URL normal de imagem
    return (
      <Avatar
        src={src}
        name={name}
        className={className}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <Card className="m-4 mb-0 shadow-xl rounded-3xl border border-white/20 backdrop-blur-sm">
        <CardHeader className="flex justify-between items-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              className="text-white md:hidden"
              onPress={onOpen}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative">
              <MessageCircle className="h-7 w-7" />
              <motion.div
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  syncEnabled ? 'bg-green-400' : 'bg-yellow-400'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Comunidade Essentia
              </h2>
              <SyncIndicator />
              <ApiStatusIndicator />
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {onlineCount} {onlineCount === 1 ? 'pessoa online' : 'pessoas online'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip content={isProfileEnabled ? "Você está online" : "Você está offline"}>
              <Chip
                color={isProfileEnabled ? "success" : "default"}
                variant="flat"
                className="cursor-pointer hidden sm:flex border border-white/20"
                onClick={toggleProfile}
              >
                <div className="flex items-center gap-2">
                  {isProfileEnabled ? 
                    <Wifi className="h-3 w-3" /> : 
                    <WifiOff className="h-3 w-3" />
                  }
                  {isProfileEnabled ? 'Online' : 'Offline'}
                </div>
              </Chip>
            </Tooltip>
            
            <Tooltip content="Configurar perfil">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setIsEditingProfile(true)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-1 p-4 gap-4 overflow-hidden">
        {/* Lista de Usuários Online */}
        {!isMobile && (
          <Card className="w-80 flex-shrink-0 shadow-xl rounded-3xl border border-white/20 backdrop-blur-sm">
            <CardHeader className="flex items-center gap-3 border-b border-white/20 bg-gradient-to-r from-white to-blue-50 rounded-t-3xl">
              <Users className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-lg">Usuários Online</h3>
              <Badge color="primary" variant="faded" className="ml-auto">
                {onlineCount}
              </Badge>
            </CardHeader>
            <CardBody className="p-4 bg-gradient-to-b from-white to-blue-50/50 rounded-b-3xl">
              <ScrollShadow className="h-[calc(100vh-12rem)]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {onlineUsers
                      .filter(user => user.isOnline && user.profileEnabled)
                      .map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <div className="relative">
                            {/* 🔥 AVATAR CORRETO - Usando SafeAvatar */}
                            <SafeAvatar
                              src={user.avatar}
                              name={user.name}
                              className="w-12 h-12 border-2 border-green-400 shadow-lg"
                            />
                            <motion.div
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate text-gray-800">{user.name}</p>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Online agora
                            </p>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                  
                  {onlineCount === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8 text-gray-500"
                    >
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="font-medium mb-2">Nenhum usuário online</p>
                      <p className="text-sm">Ative seu perfil para aparecer aqui!</p>
                    </motion.div>
                  )}
                </div>
              </ScrollShadow>
            </CardBody>
          </Card>
        )}

        {/* Área de Chat */}
        <Card className="flex-1 flex flex-col shadow-xl rounded-3xl border border-white/20 backdrop-blur-sm">
          <CardBody className="flex-1 flex flex-col p-0 bg-gradient-to-b from-white to-purple-50/50 rounded-3xl">
            {/* Mensagens */}
            <ScrollShadow className="flex-1 p-6">
              <motion.div className="space-y-4">
                <AnimatePresence>
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.userId === currentUser?.id ? 'flex-row-reverse' : 'flex-row'
                      } ${
                        message.type === 'system' ? 'justify-center' : ''
                      }`}
                    >
                      {message.type !== 'system' && (
                        <Tooltip content={message.userName}>
                          {/* 🔥 AVATAR CORRETO NAS MENSAGENS */}
                          <SafeAvatar
                            src={message.userAvatar}
                            name={message.userName}
                            className="w-10 h-10 flex-shrink-0 border-2 border-white shadow-lg"
                          />
                        </Tooltip>
                      )}
                      <motion.div
                        className={`max-w-xs lg:max-w-md ${
                          message.userId === currentUser?.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                            : message.type === 'system'
                            ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-center border border-amber-200'
                            : 'bg-white text-gray-800 shadow-lg shadow-gray-200/50 border border-white/50'
                        } rounded-3xl p-4 ${
                          message.type === 'system' ? 'mx-auto text-xs px-6 py-3' : ''
                        } backdrop-blur-sm`}
                      >
                        {message.type !== 'system' && message.userId !== currentUser?.id && (
                          <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                            {message.userName}
                            <Sparkles className="h-3 w-3 text-purple-500" />
                          </p>
                        )}
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.userId === currentUser?.id
                              ? 'text-blue-100'
                              : message.type === 'system'
                              ? 'text-amber-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </motion.div>
            </ScrollShadow>

            {/* Input de Mensagem */}
            <div className="border-t border-white/20 p-6 bg-white/80 backdrop-blur-sm rounded-b-3xl">
              {isProfileEnabled ? (
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onValueChange={setNewMessage}
                    onKeyPress={handleKeyPress}
                    minRows={1}
                    maxRows={4}
                    className="flex-1"
                    classNames={{
                      input: "resize-none text-base",
                      inputWrapper: "bg-white border-2 border-gray-200 rounded-2xl hover:border-purple-300 focus-within:border-purple-500 shadow-sm"
                    }}
                  />
                  <Button
                    color="primary"
                    isIconOnly
                    size="lg"
                    onPress={handleSendMessage}
                    isDisabled={!newMessage.trim()}
                    className="rounded-2xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 border-0 min-w-12 h-12"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">Ative seu perfil para participar do chat</p>
                  <p className="text-sm">Compartilhe suas conquistas e motive outros!</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Modal de Edição de Perfil */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="flex items-center gap-3 border-b border-white/20">
                  <User className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Configurar Perfil</h3>
                </CardHeader>
                <CardBody className="space-y-4 p-6">
                  <div className="flex items-center gap-4">
                    {/* 🔥 AVATAR ATUAL DO USUÁRIO */}
                    <SafeAvatar
                      src={currentUser?.avatar || '/Essentia.png'}
                      name={userName}
                      className="w-16 h-16 border-2 border-purple-200 shadow-lg"
                    />
                    <div className="flex-1">
                      <Input
                        label="Seu Nome"
                        value={userName}
                        onValueChange={setUserName}
                        placeholder="Como quer ser chamado?"
                      />
                    </div>
                  </div>
                </CardBody>
                <div className="flex gap-3 p-6 border-t border-white/20">
                  <Button
                    variant="light"
                    onPress={() => setIsEditingProfile(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSaveProfile}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-lg"
                    startContent={<Heart className="h-4 w-4" />}
                  >
                    {isProfileEnabled ? 'Atualizar' : 'Ativar Perfil'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer Mobile */}
      <Drawer 
        isOpen={isOpen} 
        onClose={onClose} 
        placement="left"
        size="sm"
      >
        <DrawerContent className="bg-gradient-to-b from-slate-50 to-blue-50">
          <DrawerHeader className="flex items-center gap-3 border-b border-white/20">
            <Users className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-lg">Usuários Online</h3>
            <Badge color="primary" variant="faded" className="ml-auto">
              {onlineCount}
            </Badge>
            <Button isIconOnly variant="light" onPress={onClose} size="sm">
              <X className="h-4 w-4" />
            </Button>
          </DrawerHeader>
          <DrawerBody className="p-4">
            <div className="space-y-3">
              {onlineUsers
                .filter(user => user.isOnline && user.profileEnabled)
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20"
                  >
                    <div className="relative">
                      {/* 🔥 AVATAR CORRETO NO DRAWER MOBILE */}
                      <SafeAvatar
                        src={user.avatar}
                        name={user.name}
                        className="w-12 h-12 border-2 border-green-400 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-gray-800">{user.name}</p>
                      <p className="text-xs text-green-600 font-medium">Online agora</p>
                    </div>
                  </div>
                ))}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
import { UserProfile } from '@/types/gamification';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  profileEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

interface OnlineUsersContextType {
  onlineUsers: OnlineUser[];
  currentUser: OnlineUser | null;
  isProfileEnabled: boolean;
  toggleProfile: () => void;
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  chatMessages: ChatMessage[];
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  initializeUser: (userData: { id: string; username: string; age: number; avatar?: string }) => Promise<void>;
  updateCurrentUser: (userData: Partial<OnlineUser>) => void;
  syncEnabled: boolean;
  syncStatus: 'full' | 'local' | 'offline';
  syncLabel: string;
  serverStatus: 'online' | 'offline' | 'checking';
}

export const OnlineUsersContext = createContext<OnlineUsersContextType | undefined>(undefined);

// Serviço de sincronização CORRIGIDO
class SyncService {
  private serverUrl = 'http://localhost:3001';
  private isOnline = false;

  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/status`);
      this.isOnline = response.ok;
      return response.ok;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  async fetchOnlineUsers(): Promise<OnlineUser[]> {
    if (!this.isOnline) return [];
    
    try {
      const response = await fetch(`${this.serverUrl}/online-users`);
      if (response.ok) {
        const users = await response.json();
        return users.map((user: any) => ({
          ...user,
          lastSeen: new Date(user.lastSeen),
        }));
      }
    } catch (error) {
      console.warn('❌ Não foi possível buscar usuários do servidor:', error);
    }
    return [];
  }

  async syncUser(user: OnlineUser): Promise<boolean> {
    if (!this.isOnline) return false;
    
    try {
      const response = await fetch(`${this.serverUrl}/online-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return response.ok;
    } catch (error) {
      console.warn('❌ Não foi possível sincronizar usuário:', error);
      return false;
    }
  }

  async fetchChatMessages(): Promise<ChatMessage[]> {
    if (!this.isOnline) return [];
    
    try {
      const response = await fetch(`${this.serverUrl}/chat-messages`);
      if (response.ok) {
        const messages = await response.json();
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (error) {
      console.warn('❌ Não foi possível buscar mensagens:', error);
    }
    return [];
  }

  async syncMessage(messageData: Omit<ChatMessage, 'id'>): Promise<boolean> {
    if (!this.isOnline) return false;
    
    try {
      const response = await fetch(`${this.serverUrl}/chat-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('❌ ERRO ao sincronizar mensagem:', error);
      return false;
    }
  }
}

const syncService = new SyncService();

export const OnlineUsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentUser, setCurrentUser] = useState<OnlineUser | null>(null);
  const [isProfileEnabled, setIsProfileEnabled] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // 🔄 ATUALIZAÇÃO EM TEMPO REAL - Polling mais eficiente
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    const startPolling = async () => {
      if (!syncEnabled) return;

      pollingInterval = setInterval(async () => {
        try {
          // Buscar apenas mensagens do servidor
          const serverMessages = await syncService.fetchChatMessages();
          if (serverMessages.length > chatMessages.length) {
            console.log('🔄 Novas mensagens recebidas:', serverMessages.length - chatMessages.length);
            setChatMessages(serverMessages);
          }

          // Buscar usuários atualizados
          const serverUsers = await syncService.fetchOnlineUsers();
          setOnlineUsers(serverUsers);
        } catch (error) {
          console.warn('Erro no polling:', error);
        }
      }, 2000); // Polling a cada 2 segundos
    };

    startPolling();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [syncEnabled, chatMessages.length]);

  // 🔄 INICIALIZAÇÃO DO SISTEMA
  useEffect(() => {
    console.log('🚀 Iniciando sistema de chat...');

    const initializeSystem = async () => {
      // Verificar status do servidor
      const serverOnline = await syncService.checkServerStatus();
      setServerStatus(serverOnline ? 'online' : 'offline');
      setSyncEnabled(serverOnline);
      
      if (serverOnline) {
        console.log('✅ Servidor online - carregando dados...');
        
        // Carregar dados do servidor
        const [serverUsers, serverMessages] = await Promise.all([
          syncService.fetchOnlineUsers(),
          syncService.fetchChatMessages()
        ]);
        
        setOnlineUsers(serverUsers);
        setChatMessages(serverMessages);
        
        console.log(`👥 ${serverUsers.length} usuários carregados`);
        console.log(`💬 ${serverMessages.length} mensagens carregadas`);
      } else {
        console.log('⚠️ Servidor offline - modo local');
        loadLocalData();
      }
    };

    initializeSystem();
  }, []);

  // 🔄 CARREGAR DADOS LOCAIS
  const loadLocalData = () => {
    try {
      const savedUsers = localStorage.getItem('essentia_online_users');
      const savedMessages = localStorage.getItem('essentia_chat_messages');
      const savedUser = localStorage.getItem('essentia_current_user');
      const savedProfile = localStorage.getItem('essentia_profile_enabled');

      if (savedUsers) {
        setOnlineUsers(JSON.parse(savedUsers));
      }
      if (savedMessages) {
        setChatMessages(JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      }
      if (savedUser) {
        setCurrentUser({
          ...JSON.parse(savedUser),
          lastSeen: new Date(JSON.parse(savedUser).lastSeen),
        });
      }
      if (savedProfile) {
        setIsProfileEnabled(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados locais:', error);
    }
  };

  // 🔄 SALVAR DADOS LOCALMENTE
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`❌ Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  // 🔄 INICIALIZAR USUÁRIO
  const initializeUser = async (userData: { id: string; username: string; age: number; avatar?: string }) => {
    console.log('👤 Inicializando usuário:', userData.username);

    const newUser: OnlineUser = {
      id: userData.id,
      name: userData.username,
      avatar: userData.avatar || '/Essentia.png',
      isOnline: true,
      profileEnabled: true,
      lastSeen: new Date(),
    };

    // Atualizar estado local
    setCurrentUser(newUser);
    setIsProfileEnabled(true);

    // Adicionar à lista de usuários online
    setOnlineUsers(prev => {
      const existingIndex = prev.findIndex(u => u.id === newUser.id);
      let updatedUsers;
      
      if (existingIndex >= 0) {
        updatedUsers = [...prev];
        updatedUsers[existingIndex] = newUser;
      } else {
        updatedUsers = [...prev, newUser];
      }

      // Sincronizar
      saveToLocalStorage('essentia_online_users', updatedUsers);
      return updatedUsers;
    });

    // Sincronizar usuário com servidor
    if (syncEnabled) {
      await syncService.syncUser(newUser);
    }

    // Salvar localmente
    saveToLocalStorage('essentia_current_user', newUser);
    saveToLocalStorage('essentia_profile_enabled', true);

    // Mensagem de sistema
    addMessage({
      userId: 'system',
      userName: 'Sistema',
      userAvatar: '/Essentia.png',
      message: `🎉 ${newUser.name} entrou na comunidade!`,
      timestamp: new Date(),
      type: 'system'
    });

    console.log('✅ Usuário criado e sincronizado:', newUser.name);
  };

  const updateUserProfile = async (profile: UserProfile) => {
    if (!currentUser) return;

    try {
      // 🔄 ATUALIZAR COM O AVATAR DO PERFIL
      await initializeUser({
        id: currentUser.id,
        username: profile.nickname || profile.name || 'Usuário',
        age: profile.age || 25,
        avatar: profile.avatar, // 🔥 Usar o avatar do perfil
      });

      addMessage({
        userId: 'system',
        userName: 'Sistema',
        userAvatar: '/Essentia.png',
        message: `✨ ${profile.nickname || profile.name} atualizou seu perfil!`,
        timestamp: new Date(),
        type: 'system'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const toggleProfile = () => {
    const newState = !isProfileEnabled;
    setIsProfileEnabled(newState);
    saveToLocalStorage('essentia_profile_enabled', newState);

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        isOnline: newState,
        profileEnabled: newState,
        lastSeen: new Date(),
      };

      setCurrentUser(updatedUser);

      // Atualizar lista de usuários online
      setOnlineUsers(prev => {
        let updatedUsers;
        
        if (newState) {
          // Adicionar ou atualizar usuário
          const existingIndex = prev.findIndex(u => u.id === updatedUser.id);
          if (existingIndex >= 0) {
            updatedUsers = [...prev];
            updatedUsers[existingIndex] = updatedUser;
          } else {
            updatedUsers = [...prev, updatedUser];
          }
        } else {
          // Remover usuário
          updatedUsers = prev.filter(u => u.id !== updatedUser.id);
        }

        saveToLocalStorage('essentia_online_users', updatedUsers);
        return updatedUsers;
      });

      // Sincronizar usuário atual com servidor
      if (syncEnabled && newState) {
        syncService.syncUser(updatedUser);
      }

      // Mensagem de sistema
      addMessage({
        userId: 'system',
        userName: 'Sistema',
        userAvatar: '/Essentia.png',
        message: `🔔 ${currentUser.name} ${newState ? 'entrou' : 'saiu'} da comunidade`,
        timestamp: new Date(),
        type: 'system'
      });
    }
  };

  const updateCurrentUser = (userData: Partial<OnlineUser>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      
      // Atualizar na lista de usuários online
      setOnlineUsers(prev => {
        const updatedUsers = prev.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
        saveToLocalStorage('essentia_online_users', updatedUsers);
        return updatedUsers;
      });

      // Sincronizar com servidor
      if (syncEnabled) {
        syncService.syncUser(updatedUser);
      }
    }
  };

  // 🔄 ADICIONAR MENSAGEM - CORRIGIDO PARA ATUALIZAÇÃO IMEDIATA
  const addMessage = async (messageData: Omit<ChatMessage, 'id'>) => {
    try {
      const newMessage: ChatMessage = {
        ...messageData,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      console.log('💬 Adicionando mensagem:', newMessage.message);

      // 🔥 ATUALIZAÇÃO IMEDIATA DO ESTADO
      setChatMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        saveToLocalStorage('essentia_chat_messages', updatedMessages);
        return updatedMessages;
      });

      // 🔄 SINCRONIZAR COM SERVIDOR (NÃO-BLOQUEANTE)
      if (syncEnabled) {
        syncService.syncMessage(messageData)
          .then(success => {
            if (success) {
              console.log('✅ Mensagem sincronizada com servidor');
            }
          })
          .catch(error => {
            console.error('❌ Erro ao sincronizar mensagem:', error);
          });
      }

    } catch (error) {
      console.error('💥 ERRO ao adicionar mensagem:', error);
    }
  };

  // 🔄 DETERMINAR STATUS DA SINCRONIZAÇÃO
  const getSyncStatus = () => {
    if (serverStatus === 'online' && syncEnabled) {
      return { status: 'full' as const, label: 'Sincronização Multi-Origem' };
    } else if (syncEnabled) {
      return { status: 'local' as const, label: 'Sincronização Local' };
    } else {
      return { status: 'offline' as const, label: 'Offline' };
    }
  };

  const syncStatus = getSyncStatus();

  const value: OnlineUsersContextType = {
    onlineUsers: onlineUsers.filter(user => user.profileEnabled && user.isOnline),
    currentUser,
    isProfileEnabled,
    toggleProfile,
    addMessage,
    chatMessages,
    updateUserProfile,
    initializeUser,
    updateCurrentUser,
    syncEnabled: syncStatus.status !== 'offline',
    syncStatus: syncStatus.status,
    syncLabel: syncStatus.label,
    serverStatus,
  };

  return (
    <OnlineUsersContext.Provider value={value}>
      {children}
    </OnlineUsersContext.Provider>
  );
};
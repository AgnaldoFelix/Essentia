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
  private serverUrl = import.meta.env.VITE_API_URL_COMMUNITY || 'https://back-dnutri-community.onrender.com';
  private isOnline = false;

  async checkServerStatus(): Promise<boolean> {
    try {
      console.log('🔄 Verificando status do servidor...');
      const response = await fetch(`${this.serverUrl}/health`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Servidor online:', data);
        this.isOnline = true;
        return true;
      }
    } catch (error) {
      console.warn('❌ Servidor offline:', error);
    }
    
    this.isOnline = false;
    return false;
  }

  async fetchOnlineUsers(): Promise<OnlineUser[]> {
    if (!this.isOnline) {
      console.log('📴 Modo offline - retornando array vazio');
      return [];
    }
    
    try {
      console.log('📥 Buscando usuários online...');
      const response = await fetch(`${this.serverUrl}/online-users`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const users = await response.json();
        console.log('✅ Usuários recebidos:', users.length);
        
        if (Array.isArray(users)) {
          return users.map((user: any) => ({
            ...user,
            lastSeen: new Date(user.lastSeen || user.connectedAt || Date.now()),
          }));
        } else {
          console.warn('⚠️ Resposta não é array:', users);
          return [];
        }
      }
    } catch (error) {
      console.warn('❌ Erro ao buscar usuários:', error);
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
        signal: AbortSignal.timeout(10000)
      });
      
      const success = response.ok;
      if (success) {
        console.log('✅ Usuário sincronizado:', user.name);
      }
      return success;
    } catch (error) {
      console.warn('❌ Erro ao sincronizar usuário:', error);
      return false;
    }
  }

  async fetchChatMessages(): Promise<ChatMessage[]> {
    if (!this.isOnline) {
      console.log('📴 Modo offline - mensagens vazias');
      return [];
    }
    
    try {
      console.log('📥 Buscando mensagens...');
      const response = await fetch(`${this.serverUrl}/chat-messages`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const messages = await response.json();
        console.log('✅ Mensagens recebidas:', messages.length);
        
        if (Array.isArray(messages)) {
          return messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp || msg.serverReceived || Date.now()),
          }));
        } else {
          console.warn('⚠️ Resposta não é array:', messages);
          return [];
        }
      }
    } catch (error) {
      console.warn('❌ Erro ao buscar mensagens:', error);
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
        signal: AbortSignal.timeout(10000)
      });
      
      const success = response.ok;
      if (success) {
        console.log('✅ Mensagem sincronizada');
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao sincronizar mensagem:', error);
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

  // 🔄 SALVAR DADOS LOCALMENTE
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`❌ Erro ao salvar ${key}:`, error);
    }
  };

  // 🔄 CARREGAR DADOS LOCAIS
  const loadLocalData = () => {
    try {
      const savedUsers = localStorage.getItem('essentia_online_users');
      const savedMessages = localStorage.getItem('essentia_chat_messages');
      const savedUser = localStorage.getItem('essentia_current_user');
      const savedProfile = localStorage.getItem('essentia_profile_enabled');

      if (savedUsers) setOnlineUsers(JSON.parse(savedUsers));
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
      if (savedProfile) setIsProfileEnabled(JSON.parse(savedProfile));
    } catch (error) {
      console.error('❌ Erro ao carregar dados locais:', error);
    }
  };

  // 🔄 ADICIONAR MENSAGEM
  const addMessage = async (messageData: Omit<ChatMessage, 'id'>) => {
    try {
      const newMessage: ChatMessage = {
        ...messageData,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      console.log('💬 Adicionando mensagem:', newMessage.message);

      setChatMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        saveToLocalStorage('essentia_chat_messages', updatedMessages);
        return updatedMessages;
      });

      if (syncEnabled) {
        syncService.syncMessage(messageData)
          .then(success => {
            if (success) console.log('✅ Mensagem sincronizada com servidor');
          })
          .catch(error => {
            console.error('❌ Erro ao sincronizar mensagem:', error);
          });
      }
    } catch (error) {
      console.error('💥 ERRO ao adicionar mensagem:', error);
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

    setCurrentUser(newUser);
    setIsProfileEnabled(true);

    setOnlineUsers(prev => {
      const existingIndex = prev.findIndex(u => u.id === newUser.id);
      let updatedUsers;
      
      if (existingIndex >= 0) {
        updatedUsers = [...prev];
        updatedUsers[existingIndex] = newUser;
      } else {
        updatedUsers = [...prev, newUser];
      }

      saveToLocalStorage('essentia_online_users', updatedUsers);
      return updatedUsers;
    });

    if (syncEnabled) {
      await syncService.syncUser(newUser);
    }

    saveToLocalStorage('essentia_current_user', newUser);
    saveToLocalStorage('essentia_profile_enabled', true);

    addMessage({
      userId: 'system',
      userName: 'Sistema',
      userAvatar: '/Essentia.png',
      message: `🎉 ${newUser.name} entrou na comunidade!`,
      timestamp: new Date(),
      type: 'system'
    });

    console.log('✅ Usuário criado:', newUser.name);
  };

  // 🔄 ATUALIZAR PERFIL DO USUÁRIO
  const updateUserProfile = async (profile: UserProfile) => {
    if (!currentUser) return;

    try {
      await initializeUser({
        id: currentUser.id,
        username: profile.nickname || profile.name || 'Usuário',
        age: profile.age || 25,
        avatar: profile.avatar,
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

  // 🔄 TOGGLE PERFIL
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

      setOnlineUsers(prev => {
        let updatedUsers;
        
        if (newState) {
          const existingIndex = prev.findIndex(u => u.id === updatedUser.id);
          if (existingIndex >= 0) {
            updatedUsers = [...prev];
            updatedUsers[existingIndex] = updatedUser;
          } else {
            updatedUsers = [...prev, updatedUser];
          }
        } else {
          updatedUsers = prev.filter(u => u.id !== updatedUser.id);
        }

        saveToLocalStorage('essentia_online_users', updatedUsers);
        return updatedUsers;
      });

      if (syncEnabled && newState) {
        syncService.syncUser(updatedUser);
      }

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

  // 🔄 ATUALIZAR USUÁRIO ATUAL
  const updateCurrentUser = (userData: Partial<OnlineUser>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      
      setOnlineUsers(prev => {
        const updatedUsers = prev.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
        saveToLocalStorage('essentia_online_users', updatedUsers);
        return updatedUsers;
      });

      if (syncEnabled) {
        syncService.syncUser(updatedUser);
      }
    }
  };

  // 🔄 POLLING SIMPLIFICADO E CONFIÁVEL
  useEffect(() => {
    if (!syncEnabled) return;

    console.log('🔄 Iniciando polling...');
    let isMounted = true;

    const pollServer = async () => {
      if (!isMounted) return;

      try {
        const [serverUsers, serverMessages] = await Promise.all([
          syncService.fetchOnlineUsers(),
          syncService.fetchChatMessages()
        ]);

        if (isMounted) {
          setOnlineUsers(prev => 
            JSON.stringify(prev) !== JSON.stringify(serverUsers) ? serverUsers : prev
          );
          
          setChatMessages(prev => 
            JSON.stringify(prev) !== JSON.stringify(serverMessages) ? serverMessages : prev
          );
        }
      } catch (error) {
        console.warn('⚠️ Erro no polling:', error);
      }
    };

    const interval = setInterval(pollServer, 5000);
    pollServer();

    return () => {
      isMounted = false;
      clearInterval(interval);
      console.log('🛑 Polling parado');
    };
  }, [syncEnabled]);

  // 🔄 INICIALIZAÇÃO DO SISTEMA
  useEffect(() => {
    console.log('🚀 Inicializando sistema...');

    const initializeSystem = async () => {
      const serverOnline = await syncService.checkServerStatus();
      setServerStatus(serverOnline ? 'online' : 'offline');
      setSyncEnabled(serverOnline);
      
      if (serverOnline) {
        console.log('✅ Servidor online - sincronizando...');
        
        const [serverUsers, serverMessages] = await Promise.all([
          syncService.fetchOnlineUsers(),
          syncService.fetchChatMessages()
        ]);
        
        setOnlineUsers(serverUsers);
        setChatMessages(serverMessages);
      } else {
        console.log('📴 Servidor offline - modo local');
        loadLocalData();
      }
    };

    initializeSystem();
  }, []);

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

// Hook personalizado para usar o contexto
export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  if (context === undefined) {
    throw new Error('useOnlineUsers deve ser usado dentro de um OnlineUsersProvider');
  }
  return context;
};
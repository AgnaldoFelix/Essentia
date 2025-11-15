// contexts/OnlineUsersContext.tsx
import { UserProfile } from '@/types/gamification';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

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
}

export const OnlineUsersContext = createContext<OnlineUsersContextType | null>(null);

export const OnlineUsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentUser, setCurrentUser] = useState<OnlineUser | null>(null);
  const [isProfileEnabled, setIsProfileEnabled] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Carregar dados do usuário atual do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('essentia_current_user');
    const savedProfileEnabled = localStorage.getItem('essentia_profile_enabled');
    const savedMessages = localStorage.getItem('essentia_chat_messages');

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser({
        ...userData,
        lastSeen: new Date(userData.lastSeen),
      });
    }

    if (savedProfileEnabled) {
      setIsProfileEnabled(JSON.parse(savedProfileEnabled));
    }

    if (savedMessages) {
      const messages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setChatMessages(messages);
    }

    // Carregar usuários do Supabase
    loadOnlineUsersFromSupabase();
    
    // Configurar real-time subscriptions
    setupRealtimeSubscriptions();
  }, []);

  const loadOnlineUsersFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_online', true)
        .order('username');

      if (error) {
        console.error('Erro ao carregar usuários online:', error);
        return;
      }

      if (data) {
        const users: OnlineUser[] = data.map(user => ({
          id: user.id,
          name: user.username,
          avatar: user.avatar || '/Essentia.png',
          isOnline: user.is_online,
          lastSeen: new Date(user.last_seen || user.updated_at),
          profileEnabled: user.profile_enabled,
        }));
        setOnlineUsers(users);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários do Supabase:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscription para usuários online
    const userSubscription = supabase
      .channel('online-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          loadOnlineUsersFromSupabase(); // Recarregar lista quando houver mudanças
        }
      )
      .subscribe();

    // Subscription para mensagens do chat
    const messageSubscription = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMessage = payload.new as any;
          const message: ChatMessage = {
            id: newMessage.id,
            userId: newMessage.user_id,
            userName: newMessage.user_name,
            userAvatar: newMessage.user_avatar,
            message: newMessage.message,
            timestamp: new Date(newMessage.created_at),
            type: newMessage.type,
          };
          setChatMessages(prev => [...prev, message]);
          
          // Atualizar localStorage
          const updatedMessages = [...chatMessages, message];
          localStorage.setItem('essentia_chat_messages', JSON.stringify(updatedMessages));
        }
      )
      .subscribe();

    return () => {
      userSubscription.unsubscribe();
      messageSubscription.unsubscribe();
    };
  };

  const initializeUser = async (userData: { id: string; username: string; age: number; avatar?: string }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            id: userData.id,
            username: userData.username,
            age: userData.age,
            avatar: userData.avatar,
            is_online: true,
            profile_enabled: true,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar/atualizar usuário no Supabase:', error);
        return;
      }

      if (data) {
        const onlineUser: OnlineUser = {
          id: data.id,
          name: data.username,
          avatar: data.avatar || '/Essentia.png',
          isOnline: true,
          profileEnabled: true,
          lastSeen: new Date(data.last_seen || data.updated_at),
        };

        setCurrentUser(onlineUser);
        setIsProfileEnabled(true);

        // Atualizar localStorage
        localStorage.setItem('essentia_current_user', JSON.stringify(onlineUser));
        localStorage.setItem('essentia_profile_enabled', 'true');

        // Adicionar usuário à lista local
        setOnlineUsers(prev => {
          const existingUser = prev.find(u => u.id === onlineUser.id);
          if (existingUser) {
            return prev.map(u => u.id === onlineUser.id ? onlineUser : u);
          }
          return [...prev, onlineUser];
        });

        // Mensagem de boas-vindas
        addMessage({
          userId: 'system',
          userName: 'Sistema',
          userAvatar: '/Essentia.png',
          message: `${onlineUser.name} entrou na comunidade! 🎉`,
          timestamp: new Date(),
          type: 'system'
        });
      }
    } catch (error) {
      console.error('Erro em initializeUser:', error);
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    if (!currentUser) return;

    try {
      await initializeUser({
        id: currentUser.id,
        username: profile.nickname || profile.name || 'Usuário',
        age: profile.age || 25,
        avatar: profile.avatar,
      });

      // Mensagem de sistema
      addMessage({
        userId: 'system',
        userName: 'Sistema',
        userAvatar: '/Essentia.png',
        message: `${profile.nickname || profile.name} atualizou seu perfil! ✨`,
        timestamp: new Date(),
        type: 'system'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const toggleProfile = async () => {
    const newState = !isProfileEnabled;
    setIsProfileEnabled(newState);
    localStorage.setItem('essentia_profile_enabled', JSON.stringify(newState));

    if (currentUser) {
      try {
        // Atualizar no Supabase
        const { error } = await supabase
          .from('users')
          .update({
            is_online: newState,
            profile_enabled: newState,
            last_seen: new Date().toISOString(),
          })
          .eq('id', currentUser.id);

        if (error) {
          console.error('Erro ao atualizar status no Supabase:', error);
        }

        // Atualizar usuário local
        const updatedUser = {
          ...currentUser,
          isOnline: newState,
          profileEnabled: newState,
          lastSeen: new Date(),
        };

        setCurrentUser(updatedUser);
        localStorage.setItem('essentia_current_user', JSON.stringify(updatedUser));

        // Atualizar lista de usuários online
        setOnlineUsers(prev => {
          if (newState) {
            const exists = prev.find(user => user.id === updatedUser.id);
            if (exists) {
              return prev.map(user => 
                user.id === updatedUser.id ? updatedUser : user
              );
            } else {
              return [...prev, updatedUser];
            }
          } else {
            return prev.filter(user => user.id !== updatedUser.id);
          }
        });

        // Mensagem de sistema
        addMessage({
          userId: 'system',
          userName: 'Sistema',
          userAvatar: '/Essentia.png',
          message: `${currentUser.name} ${newState ? 'entrou' : 'saiu'} da comunidade`,
          timestamp: new Date(),
          type: 'system'
        });

      } catch (error) {
        console.error('Erro ao alternar perfil:', error);
      }
    }
  };

  const updateCurrentUser = (userData: Partial<OnlineUser>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('essentia_current_user', JSON.stringify(updatedUser));

      // Atualizar na lista de usuários online
      setOnlineUsers(prev => 
        prev.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      );
    }
  };

  const addMessage = async (messageData: Omit<ChatMessage, 'id'>) => {
    try {
      // Gerar ID temporário
      const tempId = generateMessageId();
      const newMessage: ChatMessage = {
        ...messageData,
        id: tempId,
      };

      // Adicionar localmente imediatamente para feedback rápido
      setChatMessages(prev => [...prev, newMessage]);
      
      // Atualizar localStorage
      const updatedMessages = [...chatMessages, newMessage];
      localStorage.setItem('essentia_chat_messages', JSON.stringify(updatedMessages));

      // Salvar no Supabase (para mensagens de usuário, não de sistema)
      if (messageData.type === 'text' && messageData.userId !== 'system') {
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: messageData.userId,
            user_name: messageData.userName,
            user_avatar: messageData.userAvatar,
            message: messageData.message,
            type: messageData.type,
            created_at: messageData.timestamp.toISOString(),
          });

        if (error) {
          console.error('Erro ao salvar mensagem no Supabase:', error);
        }
      }

    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
    }
  };

  return (
    <OnlineUsersContext.Provider value={{
      onlineUsers: onlineUsers.filter(user => user.profileEnabled && user.isOnline),
      currentUser,
      isProfileEnabled,
      toggleProfile,
      addMessage,
      chatMessages,
      updateUserProfile,
      initializeUser,
      updateCurrentUser,
    }}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

// Helper functions
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  if (!context) {
    throw new Error('useOnlineUsers must be used within an OnlineUsersProvider');
  }
  return context;
};
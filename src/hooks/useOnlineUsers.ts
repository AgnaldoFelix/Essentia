// hooks/useOnlineUsers.ts
import { useContext } from 'react';
import { OnlineUsersContext } from '@/contexts/OnlineUsersContext';

export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  
  if (context === undefined) {
    console.warn('useOnlineUsers usado fora do Provider');
    return {
      onlineUsers: [],
      currentUser: null,
      isProfileEnabled: false,
      toggleProfile: () => {},
      addMessage: () => {},
      chatMessages: [],
      updateUserProfile: async () => {},
      initializeUser: async () => {},
      updateCurrentUser: () => {},
      syncEnabled: false,
      syncStatus: 'offline' as const,
      syncLabel: 'Offline',
      serverStatus: 'offline' as const,
    };
  }
  
  return context;
};
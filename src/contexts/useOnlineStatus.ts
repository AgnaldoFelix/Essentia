
// hooks/useOnlineStatus.ts
import { useEffect } from 'react';
import { useOnlineUsers } from '@/contexts/OnlineUsersContext';

export const useOnlineStatus = () => {
  const { currentUser, isProfileEnabled, toggleProfile, updateCurrentUser } = useOnlineUsers();

  // Atualizar último visto quando o usuário sai da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser && isProfileEnabled) {
        // Em um app real, enviaria uma requisição para o backend
        updateCurrentUser({
          isOnline: false,
          lastSeen: new Date(),
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, isProfileEnabled, updateCurrentUser]);

  return {
    currentUser,
    isProfileEnabled,
    toggleProfile,
    updateCurrentUser,
  };
};
// contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isProfileActive: boolean;
  toggleProfile: () => void;
  onlineUsers: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileActive, setIsProfileActive] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  // Carregar do localStorage ao inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('essentia_user');
    const savedProfileActive = localStorage.getItem('essentia_profile_active');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedProfileActive) {
      setIsProfileActive(JSON.parse(savedProfileActive));
    }
  }, []);

  // Efeito para atualizar a lista de usuários online quando o perfil é ativado/desativado
  useEffect(() => {
    if (user && isProfileActive) {
      // Adiciona o usuário à lista de online
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (exists) {
          return prev.map(u => u.id === user.id ? { ...u, isOnline: true } : u);
        } else {
          return [...prev, { ...user, isOnline: true }];
        }
      });
    } else if (user && !isProfileActive) {
      // Remove o usuário da lista de online
      setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
    }
  }, [user, isProfileActive]);

  const toggleProfile = () => {
    const newState = !isProfileActive;
    setIsProfileActive(newState);
    localStorage.setItem('essentia_profile_active', JSON.stringify(newState));
  };

  return (
    <UserContext.Provider value={{ user, setUser, isProfileActive, toggleProfile, onlineUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
// hooks/useApiHealth.ts - CORRIGIDO
import { useState, useEffect } from 'react';

// URLs corretas - SEM barra no final
const POSSIBLE_API_URLS = [
  'https://back-dnutri-community.onrender.com',
  'http://localhost:10000',
  import.meta.env.VITE_API_URL_COMMUNITY,
].filter(Boolean).map(url => url.replace(/\/$/, '')); // Remove barras finais

export const useApiHealth = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [error, setError] = useState('');

  const checkSingleUrl = async (url: string): Promise<boolean> => {
    try {
      console.log(`🔗 Testando: ${url}`);
      
      // ✅ Timeout aumentado para 10 segundos (Render é lento)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Conectado: ${url}`, data);
        return true;
      }
      return false;
    } catch (err) {
      console.log(`❌ Falha em ${url}:`, err);
      return false;
    }
  };

  const checkApiHealth = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    for (const url of POSSIBLE_API_URLS) {
      const success = await checkSingleUrl(url);
      if (success) {
        setIsOnline(true);
        setApiUrl(url);
        setIsLoading(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsOnline(false);
    setApiUrl(POSSIBLE_API_URLS[0] || '');
    setError('Não foi possível conectar com o servidor');
    setIsLoading(false);
  };

  useEffect(() => {
    checkApiHealth();
    
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, isLoading, apiUrl, error, retry: checkApiHealth };
};
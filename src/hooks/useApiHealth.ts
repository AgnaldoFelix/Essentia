// hooks/useApiHealth.ts - ATUALIZADO
import { useState, useEffect } from 'react';

// Lista de URLs possíveis para tentar conexão
const POSSIBLE_API_URLS = [
  'https://back-dnutri-community.onrender.com/',
].filter(Boolean); // Remove valores vazios

export const useApiHealth = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [error, setError] = useState('');

  const checkSingleUrl = async (url: string): Promise<boolean> => {
    try {
      console.log(`🔗 Tentando conectar com: ${url}`);
      const response = await fetch(`${url}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 3 segundos
        signal: AbortSignal.timeout(3000),
      });
      
      if (response.ok) {
        console.log(`✅ Conectado com sucesso: ${url}`);
        return true;
      }
      return false;
    } catch (err) {
      console.log(`❌ Falha ao conectar com ${url}:`, err);
      return false;
    }
  };

  const checkApiHealth = async () => {
    setIsLoading(true);
    setError('');

    // Tentar cada URL possivel
    for (const url of POSSIBLE_API_URLS) {
      const success = await checkSingleUrl(url);
      if (success) {
        setIsOnline(true);
        setApiUrl(url);
        setIsLoading(false);
        return;
      }
      
      // Pequena pausa entre tentativas
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Se nenhuma URL funcionou
    setIsOnline(false);
    setApiUrl(POSSIBLE_API_URLS[0] || '');
    setError('Não foi possível conectar com nenhuma URL da API');
    setIsLoading(false);
  };

  useEffect(() => {
    checkApiHealth();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, isLoading, apiUrl, error, retry: checkApiHealth };
};
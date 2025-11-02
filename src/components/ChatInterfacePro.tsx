import { useState, useRef, useEffect } from 'react';
import { Card, CardBody, Input, Button, Avatar, Spinner, Chip } from '@nextui-org/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types/nutrition';
import { storage } from '@/lib/localStorage';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ChatInterfacePro = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(storage.getChatHistory());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('nutrition-chat', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      storage.saveChatHistory(updatedMessages);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "Como calcular minhas macros?",
    "Qual a melhor proteína pré-treino?",
    "Dicas para ganho de massa muscular",
    "Como fazer um déficit calórico?"
  ];

  return (
    <div className="space-y-4">
      {/* Suggested Questions */}
      {messages.length === 0 && (
        <Card className="border-none bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Perguntas sugeridas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Chip
                  key={index}
                  variant="flat"
                  color="primary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="border-none">
        <CardBody className="p-0">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Olá! Sou seu assistente nutricional</h3>
                <p className="text-default-500 max-w-md">
                  Faça perguntas sobre nutrição, planejamento alimentar, macros e muito mais!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar
                    icon={message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    className={message.role === 'user' ? 'bg-primary' : 'bg-secondary'}
                  />
                  <div
                    className={`flex-1 max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-default-100 text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3">
                <Avatar
                  icon={<Bot className="h-5 w-5" />}
                  className="bg-secondary"
                />
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-default-100">
                  <Spinner size="sm" color="primary" />
                  <span className="text-sm text-default-500">Pensando...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-divider">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta sobre nutrição..."
                value={input}
                onValueChange={setInput}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-base"
                }}
              />
              <Button
                isIconOnly
                color="primary"
                onPress={handleSend}
                isDisabled={!input.trim() || isLoading}
                size="lg"
                className="bg-gradient-primary"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

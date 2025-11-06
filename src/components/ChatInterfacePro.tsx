import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Avatar,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { Send, Bot, User, Sparkles, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { ChatMessage } from "@/types/nutrition";
import { storage } from "@/lib/localStorage";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type DataWithReply = {
  reply: string;
};

type ParsedResponse = {
  error?: string;
  detail?: string;
  message?: string;
};

const CHAT_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/avaliar`
  : "/avaliar";

const REQUEST_TIMEOUT = 30_000;

const suggestedQuestions = [
  "Como calcular minhas macros?",
  "Qual a melhor proteína pré-treino?",
  "Dicas para ganho de massa muscular",
  "Como fazer um déficit calórico?",
];

const makeId = (prefix = "msg") => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Componente para mensagens com animação
const MessageBubble = ({ message, onCopy, onFeedback }: { 
  message: ChatMessage; 
  onCopy: (content: string) => void;
  onFeedback: (messageId: string, isPositive: boolean) => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar
        icon={isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        className={`shrink-0 ${
          isUser 
            ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25" 
            : "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25"
        }`}
        size="sm"
      />
      
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div
          className={`relative p-4 rounded-2xl break-words ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 ml-auto"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/20 dark:shadow-gray-800/20"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          
          {/* Ações para mensagens do assistente */}
          {!isUser && showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-1 absolute -bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border"
            >
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onCopy(message.content)}
                className="h-6 w-6 min-w-6"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onFeedback(message.id, true)}
                className="h-6 w-6 min-w-6 text-green-500"
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onFeedback(message.id, false)}
                className="h-6 w-6 min-w-6 text-red-500"
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 ${isUser ? "text-right" : "text-left"}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

export const ChatInterfacePro = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => storage.getChatHistory() ?? []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Persistência automática
  useEffect(() => {
    storage.saveChatHistory(messages);
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const buildChatHistoryForBackend = (msgs: ChatMessage[]) =>
    msgs.map((m) => ({
      from: m.role === "user" ? "user" : "model",
      text: m.content,
    }));

  const handleSend = async (prefill?: string) => {
    const textToSend = prefill ?? input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: makeId("user"),
      role: "user",
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const body = {
      message: textToSend.trim(),
      chat_history: buildChatHistoryForBackend([...messages, userMessage]),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      let res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok && res.status >= 500 && res.status < 600) {
        await new Promise((r) => setTimeout(r, 300));
        res = await fetch(CHAT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      }

      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let parsed: ParsedResponse = null;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch {
          parsed = null;
        }
        const serverMessage = (parsed?.error ?? parsed?.detail ?? parsed?.message ?? text) || `Erro ${res.status}`;
        throw new Error(String(serverMessage));
      }

      const data = await res.json().catch(() => null);
      const assistantText = data?.reply?.replace(/^Dr\.Nutri:\s*/i, "").trim() || 
        (typeof data === "string" ? data : "Desculpe, não consegui entender a resposta do servidor.");

      const assistantMessage: ChatMessage = {
        id: makeId("assistant"),
        role: "assistant",
        content: assistantText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      
      let messageText = "Não foi possível enviar a mensagem.";
      if (err instanceof Error) {
        messageText = err.message;
      }
      
      toast({
        title: "Erro",
        description: messageText,
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(text), 80);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência",
    });
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    toast({
      title: isPositive ? "Obrigado pelo feedback! 👍" : "Desculpe pela experiência! 👎",
      description: "Sua opinião nos ajuda a melhorar",
    });
    // Aqui você pode enviar o feedback para seu backend
    console.log(`Feedback ${isPositive ? 'positive' : 'negative'} para mensagem:`, messageId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header com gradiente profissional */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Dr. Nutri AI
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Seu assistente pessoal de nutrição e fitness
        </p>
      </motion.div>

      {/* Suggested Questions com animação */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-xl shadow-green-500/5">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Comece uma conversa
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedQuestions.map((q, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Chip
                      variant="flat"
                      className="w-full cursor-pointer bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-green-200 dark:border-green-800 text-gray-700 dark:text-gray-300 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 py-4 px-4 text-sm font-medium"
                      onClick={() => handleSuggestionClick(q)}
                    >
                      {q}
                    </Chip>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Chat Container */}
      <Card className="border-none shadow-2xl shadow-green-500/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardBody className="p-0">
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6"
              >
                <div className="p-6 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/25">
                  <Bot className="h-16 w-16 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Olá! Sou o Dr. Nutri
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg leading-relaxed">
                    Especialista em nutrição, fitness e bem-estar. Estou aqui para ajudar você a alcançar seus objetivos!
                  </p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onCopy={handleCopyMessage}
                    onFeedback={handleFeedback}
                  />
                ))}
              </AnimatePresence>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-start"
              >
                <Avatar 
                  icon={<Bot className="h-4 w-4" />} 
                  className="bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25"
                  size="sm"
                />
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <Spinner size="sm" classNames={{ circle1: "border-b-green-500", circle2: "border-b-green-500" }} />
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pensando...</span>
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="h-1 w-1 rounded-full bg-green-500"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="h-1 w-1 rounded-full bg-green-500"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="h-1 w-1 rounded-full bg-green-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area melhorada */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-3">
              <Input
                placeholder="Digite sua pergunta sobre nutrição, exercícios, suplementos..."
                value={input}
                onValueChange={setInput}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={isLoading}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-base placeholder-gray-500",
                  inputWrapper: "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 focus-within:border-green-500 dark:focus-within:border-green-500 transition-colors",
                }}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => setInput("")}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                }
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  isIconOnly
                  color="primary"
                  onPress={() => handleSend()}
                  isDisabled={!input.trim() || isLoading}
                  size="lg"
                  className="bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                >
                  {isLoading ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </motion.div>
            </div>
            
            {/* Quick tips */}
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <Sparkles className="h-3 w-3" />
              <span>Dica: Pergunte sobre dieta, treinos, suplementos ou metas específicas</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400"
      >
        <p>Dr. Nutri AI • Assistente de nutrição e fitness • {new Date().getFullYear()}</p>
      </motion.div>
    </div>
  );
};
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Leaf, Apple, Droplet } from "lucide-react";

// Types
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type DataWithReply = {
  reply: string;
};

type ParsedResponse = {
  error?: string;
  detail?: string;
  message?: string;
};

interface ToastProps {
  title: string;
  description: string;
  variant?: string;
}

// Mock storage for demo
const storage = {
  getChatHistory: () => {
    try {
      const stored = localStorage.getItem('chat_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  saveChatHistory: (messages: ChatMessage[]) => {
    try {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }
};

// Mock toast
const toast = ({ title, description, variant }: ToastProps) => {
  console.log(`${variant?.toUpperCase() || 'INFO'}: ${title} - ${description}`);
  alert(`${title}\n${description}`);
};

// Constants
const CHAT_API = "/avaliar";
const REQUEST_TIMEOUT = 30_000;

const suggestedQuestions = [
  { text: "Como calcular minhas macros?", icon: <Apple className="w-4 h-4" /> },
  { text: "Qual a melhor proteína pré-treino?", icon: <Droplet className="w-4 h-4" /> },
  { text: "Dicas para ganho de massa muscular", icon: <Sparkles className="w-4 h-4" /> },
  { text: "Como fazer um déficit calórico?", icon: <Leaf className="w-4 h-4" /> },
];

const makeId = (prefix = "msg") => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatInterfacePro() {
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => storage.getChatHistory() ?? []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-save to storage
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

    // Simulate API call for demo
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: makeId("assistant"),
        role: "assistant",
        content: "Ótima pergunta! Para calcular suas macros, precisamos considerar seu objetivo (emagrecimento, ganho de massa ou manutenção), seu nível de atividade física e seu peso corporal. Uma abordagem comum é: Proteínas: 1.6-2.2g por kg de peso, Carboidratos: 3-5g por kg (ajustável conforme atividade), Gorduras: 0.8-1g por kg. Gostaria que eu detalhasse mais algum aspecto?",
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(text), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4 animate-float">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Assistente Nutricional IA
          </h1>
          <p className="text-gray-600 text-lg">
            Seu guia personalizado para uma vida mais saudável
          </p>
        </div>

        {/* Suggested Questions */}
        {messages.length === 0 && (
          <div className="animate-slideUp" style={{ animationDelay: '150ms' }}>
            <div className="border-none bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Perguntas Populares
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((q, i) => (
                    <div
                      key={i}
                      onClick={() => handleSuggestionClick(q.text)}
                      className="group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 animate-fadeInUp border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-lg"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="relative flex items-center gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                          {q.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                          {q.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="border-none bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden animate-slideUp" style={{ animationDelay: '300ms' }}>
          <div className="p-0">
            <div className="h-[500px] md:h-[600px] overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-zoomIn">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl">
                      <Bot className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Olá! Sou seu Nutricionista Virtual
                  </h3>
                  <p className="text-gray-600 max-w-md text-lg leading-relaxed">
                    Estou aqui para ajudar com nutrição, planejamento alimentar, 
                    cálculo de macros e muito mais! Como posso te auxiliar hoje?
                  </p>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 items-end animate-slideUp ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                          message.role === "user" 
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30" 
                            : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex-1 max-w-[85%] md:max-w-[75%] p-4 rounded-2xl break-words transition-all duration-300 hover:shadow-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 rounded-br-md"
                          : "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-800 shadow-md rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className={`mt-2 text-xs flex justify-end ${
                        message.role === "user" 
                          ? "text-blue-100" 
                          : "text-gray-500"
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 animate-slideUp">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl rounded-bl-md bg-gradient-to-br from-gray-100 to-gray-50 shadow-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      Analisando sua questão...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-transparent">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Leaf className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${
                      focusedInput ? "text-emerald-500" : "text-gray-400"
                    }`} />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Digite sua pergunta sobre nutrição..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      onFocus={() => setFocusedInput(true)}
                      onBlur={() => setFocusedInput(false)}
                      disabled={isLoading}
                      className={`w-full pl-12 pr-4 py-3 text-base rounded-xl border-2 bg-white transition-all duration-300 outline-none ${
                        focusedInput 
                          ? "border-emerald-500 shadow-lg shadow-emerald-500/20 scale-[1.01]" 
                          : "border-gray-300"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      aria-label="Mensagem para o assistente nutricional"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg transition-all duration-300 ${
                    input.trim() && !isLoading
                      ? "hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-110 active:scale-95 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  aria-label="Enviar mensagem"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-6 w-6" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Pressione Enter para enviar • Shift + Enter para quebrar linha
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.7s ease-out;
          animation-fill-mode: both;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-zoomIn {
          animation: zoomIn 0.7s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #10b981, #14b8a6);
          border-radius: 10px;
          transition: background 0.3s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #059669, #0d9488);
        }
      `}</style>
    </div>
  );
}
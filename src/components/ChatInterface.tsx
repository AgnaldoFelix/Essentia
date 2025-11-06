// import { useState, useRef, useEffect, useCallback } from "react";
// import {
//   Card,
//   CardBody,
//   Input,
//   Button,
//   Avatar,
//   Spinner,
//   Chip,
// } from "@nextui-org/react";
// import { Send, Bot, User, Sparkles } from "lucide-react";
// import { ChatMessage } from "@/types/nutrition";
// import { storage } from "@/lib/localStorage";
// import { toast } from "@/hooks/use-toast";

// type DataWithReply = {
//   reply: string;
//   // other properties if any
// };

// type ParsedResponse = {
//   error?: string;
//   detail?: string;
//   message?: string;
// };

// type ErrorResponse = {
//   status: number;
// };
// /**
//  * ChatInterfacePro (refatorado)
//  * - Usa backend `/avaliar` para processamento (não expõe chaves).
//  * - Persistência automática via `storage`.
//  * - Melhor tratamento de erros, rollback e timeout.
//  * - Exibe timestamps, spinner de "Pensando..." e sugestões clicáveis.
//  */

// // Endereço do seu backend (ajuste se necessário)
// const CHAT_API = import.meta.env.VITE_API_URL
//   ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/avaliar`
//   : "/avaliar";

// // Timeout em ms para a request (evita ficar pendurado indefinidamente)
// const REQUEST_TIMEOUT = 30_000;

// const suggestedQuestions = [
//   "Como calcular minhas macros?",
//   "Qual a melhor proteína pré-treino?",
//   "Dicas para ganho de massa muscular",
//   "Como fazer um déficit calórico?",
// ];

// const makeId = (prefix = "msg") => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// const formatTime = (ts: number) =>
//   new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// export const ChatInterfacePro = () => {
//   const [messages, setMessages] = useState<ChatMessage[]>(
//     () => storage.getChatHistory() ?? []
//   );
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   // Persistência automática sempre que messages mudam
//   useEffect(() => {
//     storage.saveChatHistory(messages);
//   }, [messages]);

//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   // Envia o histórico (mapear para o formato que o backend espera)
//   const buildChatHistoryForBackend = (msgs: ChatMessage[]) =>
//     msgs.map((m) => ({
//       // Backend espera { from: 'user'|'model', text: string } (ajustado conforme FastAPI)
//       from: m.role === "user" ? "user" : "model",
//       text: m.content,
//     }));

//   const handleSend = async (prefill?: string) => {
//   const textToSend = prefill ?? input;
//   if (!textToSend.trim() || isLoading) return;

//   const userMessage: ChatMessage = {
//     id: makeId("user"),
//     role: "user",
//     content: textToSend.trim(),
//     timestamp: Date.now(),
//   };

//   // Otimistic update
//   setMessages((prev) => [...prev, userMessage]);
//   setInput("");
//   setIsLoading(true);

//   const body = {
//     message: textToSend.trim(),
//     chat_history: buildChatHistoryForBackend(
//       [...(storage.getChatHistory() ?? messages), userMessage]
//     ),
//   };

//   const attemptFetch = async (signal: AbortSignal) => {
//     return fetch(CHAT_API, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       signal,
//     });
//   };

//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

//   try {
//     let res = await attemptFetch(controller.signal);

//     // retry once on 5xx
//     if (!res.ok && res.status >= 500 && res.status < 600) {
//       console.warn("Servidor retornou 5xx — tentando retry uma vez...");
//       await new Promise((r) => setTimeout(r, 300));
//       res = await attemptFetch(controller.signal);
//     }

//     clearTimeout(timeout);

//     if (res.status === 429) {
//       throw new Error("Limite de requisições excedido. Por favor, tente novamente mais tarde.");
//     }
//     if (res.status === 402) {
//       throw new Error("Créditos insuficientes no serviço de IA.");
//     }
//     if (!res.ok) {
//       // extrai texto e tenta parsear JSON seguro
//       const text = await res.text().catch(() => "");
//       let parsed: ParsedResponse = null;
//       try {
//         parsed = text ? JSON.parse(text) : null;
//       } catch {
//         parsed = null;
//       }

//       // evita mix de ?? e || sem parênteses: usamos parênteses para garantir
// const serverMessage =
//   (parsed?.error ?? parsed?.detail ?? parsed?.message ?? text) ||
//   `Erro ${res.status}`;

//       throw new Error(String(serverMessage));
//     }

//     // sucesso
//     const data = await res.json().catch(() => null);

// const assistantText =
//   data && typeof (data as DataWithReply).reply === "string"
//     ? (data as DataWithReply).reply.replace(/^Dr\.Nutri:\s*/i, "").trim()
//     : typeof data === "string"
//     ? data
//     : "Desculpe, não consegui entender a resposta do servidor.";

//     const assistantMessage: ChatMessage = {
//       id: makeId("assistant"),
//       role: "assistant",
//       content: assistantText,
//       timestamp: Date.now(),
//     };

//     setMessages((prev) => {
//       const dedup = prev.filter((m) => m.id !== userMessage.id);
//       const next = [...dedup, userMessage, assistantMessage];
//       storage.saveChatHistory(next);
//       return next;
//     });
//   } catch (err: unknown) {
//     // remove mensagem otimista
//     setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));

//     // Narrowing seguro de 'unknown'
//     let messageText = "Não foi possível enviar a mensagem.";
//     if (err instanceof Error) {
//       messageText = err.message;
//     } else if (typeof err === "object" && err !== null) {
//       // se for um objeto que contenha detail/message
//       const e = err as Record<string, unknown>;
//       if (typeof e.detail === "string") messageText = e.detail;
//       else if (typeof e.message === "string") messageText = e.message;
//       else messageText = JSON.stringify(e);
//     } else {
//       messageText = String(err);
//     }

//     console.error("Erro ao enviar mensagem (detalhes):", err);

//     toast({
//       title: "Erro",
//       description: messageText,
//       variant: "destructive",
//     });
//   } finally {
//     clearTimeout(timeout);
//     setIsLoading(false);
//   }
// };


//   // Atalho: enviar quando o usuário clicar em uma sugestão
//   const handleSuggestionClick = (text: string) => {
//     // preenche input e dispara envio breve para sentir mais "proativo"
//     setInput(text);
//     // pequeno delay para dar sensação de que o usuário confirmou a escolha
//     setTimeout(() => handleSend(text), 80);
//   };

//   return (
//     <div className="space-y-4">
//       {/* Suggested Questions */}
//       {messages.length === 0 && (
//         <Card className="border-none bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
//           <CardBody className="p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <Sparkles className="h-5 w-5 text-primary" />
//               <h3 className="text-lg font-semibold">Perguntas sugeridas</h3>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {suggestedQuestions.map((q, i) => (
//                 <Chip
//                   key={i}
//                   variant="flat"
//                   color="primary"
//                   className="cursor-pointer hover:bg-primary/20 transition-colors"
//                   onClick={() => handleSuggestionClick(q)}
//                 >
//                   {q}
//                 </Chip>
//               ))}
//             </div>
//           </CardBody>
//         </Card>
//       )}

//       {/* Chat Messages */}
//       <Card className="border-none">
//         <CardBody className="p-0">
//           <div className="h-[500px] overflow-y-auto p-6 space-y-4">
//             {messages.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-center">
//                 <div className="p-4 rounded-full bg-primary/10 mb-4">
//                   <Bot className="h-12 w-12 text-primary" />
//                 </div>
//                 <h3 className="text-xl font-bold mb-2">Olá! Sou seu assistente nutricional</h3>
//                 <p className="text-default-500 max-w-md">
//                   Faça perguntas sobre nutrição, planejamento alimentar, macros e muito mais!
//                 </p>
//               </div>
//             ) : (
//               messages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex gap-3 items-end ${
//                     message.role === "user" ? "flex-row-reverse" : "flex-row"
//                   }`}
//                 >
//                   <Avatar
//                     icon={
//                       message.role === "user" ? (
//                         <User className="h-5 w-5" />
//                       ) : (
//                         <Bot className="h-5 w-5" />
//                       )
//                     }
//                     className={message.role === "user" ? "bg-primary" : "bg-secondary"}
//                   />
//                   <div
//                     className={`flex-1 max-w-[80%] p-4 rounded-2xl break-words ${
//                       message.role === "user"
//                         ? "bg-primary text-primary-foreground ml-auto"
//                         : "bg-default-100 text-foreground"
//                     }`}
//                   >
//                     <div className="flex items-baseline justify-between gap-2">
//                       <p className="text-sm whitespace-pre-wrap">{message.content}</p>
//                     </div>
//                     <div className="mt-2 text-xs text-default-500 flex justify-end">
//                       {formatTime(message.timestamp)}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}

//             {/* Loading indicator for assistant thinking */}
//             {isLoading && (
//               <div className="flex gap-3">
//                 <Avatar icon={<Bot className="h-5 w-5" />} className="bg-secondary" />
//                 <div className="flex items-center gap-2 p-4 rounded-2xl bg-default-100">
//                   <Spinner size="sm" color="primary" />
//                   <span className="text-sm text-default-500">Pensando...</span>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input Area */}
//           <div className="p-4 border-t border-divider">
//             <div className="flex gap-2">
//               <Input
//                 placeholder="Digite sua pergunta sobre nutrição..."
//                 value={input}
//                 onValueChange={setInput}
//                 onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
//                 disabled={isLoading}
//                 variant="bordered"
//                 size="lg"
//                 classNames={{
//                   input: "text-base",
//                 }}
//                 aria-label="Mensagem para o assistente nutricional"
//               />
//               <Button
//                 isIconOnly
//                 color="primary"
//                 onPress={() => handleSend()}
//                 isDisabled={!input.trim() || isLoading}
//                 size="lg"
//                 className="bg-gradient-primary"
//                 aria-label="Enviar mensagem"
//               >
//                 {isLoading ? <Spinner size="sm" /> : <Send className="h-5 w-5" />}
//               </Button>
//             </div>
//           </div>
//         </CardBody>
//       </Card>
//     </div>
//   );
// };

import { useEffect, useRef, useState } from 'react';
import { Card, CardBody, Input, Button, Avatar, Spinner, Chip } from '@heroui/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Msg { id: string; role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Como calcular meus macros?',
  'Sugestão de jantar com 30g de proteína',
  'Dicas para cutting',
  'Quais alimentos são bons pré-treino?',
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    // streaming via SSE
    try {
      const url = `https://ilxcpwrjaduulfvwbaxe.supabase.co/functions/v1/nutrition-chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const aiId = crypto.randomUUID();
      setMessages((m) => [...m, { id: aiId, role: 'assistant', content: '' }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const payload = t.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((m) => m.map((x) => x.id === aiId ? { ...x, content: x.content + delta } : x));
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Erro no chat');
      setMessages((m) => m.filter((x) => x.role !== 'assistant' || x.content));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {messages.length === 0 && (
        <Card shadow="sm" className="glass border-0">
          <CardBody className="gap-3">
            <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><span className="font-semibold">Sugestões</span></div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Chip key={s} variant="flat" color="primary" className="cursor-pointer" onClick={() => send(s)}>{s}</Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card shadow="sm" className="glass border-0">
        <CardBody className="p-0">
          <div className="h-[460px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full grid place-items-center text-center">
                <div>
                  <div className="size-14 rounded-full bg-primary/15 grid place-items-center mx-auto mb-3">
                    <Bot className="size-7 text-primary" />
                  </div>
                  <p className="font-semibold">Assistente nutricional</p>
                  <p className="text-xs text-muted-foreground">Pergunte sobre macros, calorias e ajustes.</p>
                </div>
              </div>
            ) : messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar size="sm" className={m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}
                        icon={m.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />} />
                <div className={`max-w-[78%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'
                }`}>{m.content || (loading ? '...' : '')}</div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <Avatar size="sm" icon={<Bot className="size-4" />} className="bg-accent" />
                <div className="bg-muted rounded-2xl p-3"><Spinner size="sm" color="primary" /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-border/40 flex gap-2">
            <Input
              placeholder="Digite sua pergunta..."
              value={input}
              onValueChange={setInput}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              size="lg"
              variant="bordered"
            />
            <Button isIconOnly color="primary" size="lg" className="bg-gradient-primary" isDisabled={!input.trim() || loading} onPress={() => send(input)}>
              <Send className="size-4" />
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

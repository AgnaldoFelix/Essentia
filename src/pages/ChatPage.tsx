import { ChatPanel } from '@/components/ChatPanel';

export function ChatPage() {
  return (
    <div className="space-y-4 pb-32 md:pb-12 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Chat com IA</h2>
        <p className="text-sm text-muted-foreground">Pergunte sobre nutrição, macros e planejamento.</p>
      </div>
      <ChatPanel />
    </div>
  );
}

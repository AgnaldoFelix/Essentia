import { useState, useEffect } from 'react';
import { Card, CardBody, Input, Button, Divider } from '@heroui/react';
import { Target, Save } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import type { Goals } from '@/types/nutrition';

export function Profile() {
  const { goals, updateGoals } = useApp();
  const [draft, setDraft] = useState<Goals>(goals);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setDraft(goals); }, [goals]);

  const save = async () => {
    setBusy(true);
    try {
      await updateGoals(draft);
      toast.success('Metas salvas!');
    } catch (e: any) {
      toast.error(e.message ?? 'Falha ao salvar metas');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-32 md:pb-12 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Target className="size-5 text-primary" /> Perfil & Metas</h2>

      <Card className="glass border-0" shadow="sm">
        <CardBody className="gap-4 p-5">
          <h3 className="font-semibold">Metas diárias</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Calorias (kcal)" type="number" min={500} max={6000}
              value={String(draft.meta_calorias)}
              onValueChange={(v) => setDraft({ ...draft, meta_calorias: Number(v) || 0 })}
              startContent={<span className="text-calories">🔥</span>}
            />
            <Input
              label="Proteínas (g)" type="number" min={20} max={400}
              value={String(draft.meta_proteinas)}
              onValueChange={(v) => setDraft({ ...draft, meta_proteinas: Number(v) || 0 })}
              startContent={<span className="text-protein">💪</span>}
            />
            <Input
              label="Gorduras (g)" type="number" min={10} max={250}
              value={String(draft.meta_gorduras)}
              onValueChange={(v) => setDraft({ ...draft, meta_gorduras: Number(v) || 0 })}
              startContent={<span className="text-fat">🥑</span>}
            />
            <Input
              label="Carboidratos (g)" type="number" min={20} max={600}
              value={String(draft.meta_carboidratos)}
              onValueChange={(v) => setDraft({ ...draft, meta_carboidratos: Number(v) || 0 })}
              startContent={<span className="text-carbs">🌾</span>}
            />
          </div>
          <Divider />
          <Button color="primary" className="bg-gradient-primary self-end" startContent={<Save className="size-4" />} onPress={save} isLoading={busy}>
            Salvar metas
          </Button>
        </CardBody>
      </Card>

      <Card className="glass border-0" shadow="sm">
        <CardBody className="p-5 text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Sobre o Meu Diário:</strong> aplicativo pessoal para acompanhar calorias, proteínas e gorduras
            diariamente. Todos os dados ficam vinculados ao seu dispositivo (modo anônimo).
          </p>
          <p>
            Use o botão <strong>+</strong> para adicionar refeições por foto, câmera, texto ou voz — a IA analisa
            e atualiza automaticamente os anéis e o gráfico semanal.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

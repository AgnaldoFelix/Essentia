import { useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, RadioGroup, Radio, Input, Tabs, Tab,
} from '@heroui/react';
import { Download, FileText, FileSpreadsheet, Sparkles, Database } from 'lucide-react';
import { toast } from 'sonner';
import { exportPDF, exportCSV } from '@/lib/exportReport';
import { useApp } from '@/contexts/AppContext';
import { getWeekRecords } from '@/lib/db';
import { addDays, subDays, format } from 'date-fns';
import { toDateKey } from '@/lib/dateHelpers';
import type { DailyRecord, Meal } from '@/types/nutrition';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Gera histórico simulado de 7 dias baseado nas refeições atuais
function generateFakeHistory(refDate: Date, meals: Meal[], goals: { meta_calorias: number; meta_proteinas: number; meta_gorduras: number; meta_carboidratos: number }): DailyRecord[] {
  // base = média das refeições do dia * n_refeicoes_por_dia (usa 3 se vazio)
  const totalCals = meals.reduce((a, m) => a + Number(m.calorias), 0);
  const totalProt = meals.reduce((a, m) => a + Number(m.proteinas), 0);
  const totalFat  = meals.reduce((a, m) => a + Number(m.gorduras), 0);
  const totalCarb = meals.reduce((a, m) => a + Number(m.carboidratos), 0);

  // Se não houver refeições, usa 90% da meta como base
  const baseCal = totalCals > 0 ? totalCals : goals.meta_calorias * 0.9;
  const baseProt = totalProt > 0 ? totalProt : goals.meta_proteinas * 0.9;
  const baseFat  = totalFat  > 0 ? totalFat  : goals.meta_gorduras  * 0.9;
  const baseCarb = totalCarb > 0 ? totalCarb : goals.meta_carboidratos * 0.9;

  const jitter = (base: number, pct = 0.18) => {
    const variation = (Math.random() * 2 - 1) * pct;
    return Math.max(0, base * (1 + variation));
  };

  const records: DailyRecord[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(refDate, i);
    records.push({
      user_id: 'simulado',
      data: toDateKey(d),
      calorias: Math.round(jitter(baseCal)),
      proteinas: Math.round(jitter(baseProt)),
      gorduras: Math.round(jitter(baseFat)),
      carboidratos: Math.round(jitter(baseCarb)),
    });
  }
  return records;
}

export function ExportModal({ isOpen, onClose }: Props) {
  const { currentDate, meals, daily, goals } = useApp();
  const [mode, setMode] = useState<'real' | 'fake'>('real');
  const [formato, setFormato] = useState<'pdf' | 'csv'>('pdf');
  const [periodDays, setPeriodDays] = useState(7);
  const [fakeDate, setFakeDate] = useState<string>(toDateKey(new Date()));
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      if (mode === 'fake') {
        const ref = new Date(`${fakeDate}T12:00:00`);
        const historico = generateFakeHistory(ref, meals, goals);
        const todayFake = historico[historico.length - 1];
        const dailyFake: DailyRecord = todayFake;

        // gera "refeições" simuladas resumidas do dia de referência
        const fakeMeals: Meal[] = meals.length
          ? meals.map((m, idx) => ({ ...m, data: toDateKey(ref), id: `fake-${idx}` }))
          : [
              { id: 'f1', user_id: 'simulado', data: toDateKey(ref), horario: '08:00', nome: 'Café da manhã', emoji: '🥐', alimentos: [], calorias: Math.round(dailyFake.calorias * 0.25), proteinas: Math.round(dailyFake.proteinas * 0.2), gorduras: Math.round(dailyFake.gorduras * 0.25), carboidratos: Math.round(dailyFake.carboidratos * 0.3) },
              { id: 'f2', user_id: 'simulado', data: toDateKey(ref), horario: '12:30', nome: 'Almoço', emoji: '🍛', alimentos: [], calorias: Math.round(dailyFake.calorias * 0.4), proteinas: Math.round(dailyFake.proteinas * 0.45), gorduras: Math.round(dailyFake.gorduras * 0.4), carboidratos: Math.round(dailyFake.carboidratos * 0.4) },
              { id: 'f3', user_id: 'simulado', data: toDateKey(ref), horario: '16:00', nome: 'Lanche', emoji: '🍎', alimentos: [], calorias: Math.round(dailyFake.calorias * 0.1), proteinas: Math.round(dailyFake.proteinas * 0.1), gorduras: Math.round(dailyFake.gorduras * 0.1), carboidratos: Math.round(dailyFake.carboidratos * 0.1) },
              { id: 'f4', user_id: 'simulado', data: toDateKey(ref), horario: '20:00', nome: 'Jantar', emoji: '🍲', alimentos: [], calorias: Math.round(dailyFake.calorias * 0.25), proteinas: Math.round(dailyFake.proteinas * 0.25), gorduras: Math.round(dailyFake.gorduras * 0.25), carboidratos: Math.round(dailyFake.carboidratos * 0.2) },
            ];

        if (formato === 'pdf') {
          await exportPDF({
            dataReferencia: `${toDateKey(ref)}`,
            daily: dailyFake,
            goals,
            meals: fakeMeals,
            historico,
          });
        } else {
          exportCSV({ daily: dailyFake, meals: fakeMeals, historico });
        }
        toast.success('Relatório simulado gerado!');
      } else {
        const end = currentDate;
        const records = await getWeekRecords(end);

        if (formato === 'pdf') {
          await exportPDF({
            dataReferencia: toDateKey(currentDate),
            daily,
            goals,
            meals,
            historico: records,
          });
        } else {
          exportCSV({ daily, meals, historico: records });
        }
        toast.success('Relatório gerado!');
      }
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? 'Falha ao exportar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" placement="center" size="md" classNames={{ base: 'glass-strong' }}>
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <Download className="size-5 text-primary" />
              Exportar relatório
            </ModalHeader>
            <ModalBody className="gap-4">
              <Tabs
                selectedKey={mode}
                onSelectionChange={(k) => setMode(k as 'real' | 'fake')}
                color="primary"
                variant="solid"
                size="sm"
                fullWidth
              >
                <Tab
                  key="real"
                  title={<span className="flex items-center gap-1.5"><Database className="size-3.5" /> Dados reais</span>}
                >
                  <div className="pt-2">
                    <Input
                      label="Período (dias)"
                      type="number"
                      min={1}
                      max={90}
                      value={String(periodDays)}
                      onValueChange={(v) => setPeriodDays(Math.min(90, Math.max(1, Number(v) || 7)))}
                      description="Até a data atualmente selecionada"
                    />
                  </div>
                </Tab>
                <Tab
                  key="fake"
                  title={<span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> Simulado 7 dias</span>}
                >
                  <div className="pt-2 space-y-3">
                    <Input
                      label="Data final do relatório"
                      type="date"
                      value={fakeDate}
                      onValueChange={setFakeDate}
                      description="Gera 7 dias terminando nesta data, baseado nas refeições atuais"
                    />
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 leading-relaxed">
                      ✨ O relatório simulado usa as calorias e macros das suas refeições cadastradas como base, aplicando uma variação natural de ±18% para gerar 7 dias plausíveis. Ideal para demonstrações.
                    </div>
                  </div>
                </Tab>
              </Tabs>

              <RadioGroup
                label="Formato"
                orientation="horizontal"
                value={formato}
                onValueChange={(v) => setFormato(v as any)}
              >
                <Radio value="pdf">
                  <span className="flex items-center gap-1.5"><FileText className="size-4" /> PDF</span>
                </Radio>
                <Radio value="csv">
                  <span className="flex items-center gap-1.5"><FileSpreadsheet className="size-4" /> CSV</span>
                </Radio>
              </RadioGroup>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={close}>Cancelar</Button>
              <Button
                color="primary"
                onPress={handleExport}
                isLoading={busy}
                startContent={!busy && (mode === 'fake' ? <Sparkles className="size-4" /> : <Download className="size-4" />)}
                className="bg-gradient-primary"
              >
                {mode === 'fake' ? 'Gerar simulado' : 'Baixar relatório'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

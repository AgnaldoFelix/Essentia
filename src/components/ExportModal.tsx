import { useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, RadioGroup, Radio, Input,
} from '@heroui/react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { exportPDF, exportCSV } from '@/lib/exportReport';
import { useApp } from '@/contexts/AppContext';
import { getWeekRecords } from '@/lib/db';
import { addDays, subDays } from 'date-fns';
import { toDateKey } from '@/lib/dateHelpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: Props) {
  const { currentDate, meals, daily, goals } = useApp();
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [periodDays, setPeriodDays] = useState(7);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      // Junta histórico do período
      const end = currentDate;
      const start = subDays(end, periodDays - 1);
      const days: Date[] = [];
      for (let d = start; d <= end; d = addDays(d, 1)) days.push(new Date(d));
      const records = await getWeekRecords(end); // limit 7 by design

      if (format === 'pdf') {
        await exportPDF({
          dataReferencia: toDateKey(currentDate),
          daily,
          goals,
          meals,
          historico: records,
        });
        toast.success('PDF gerado!');
      } else {
        exportCSV({ daily, meals, historico: records });
        toast.success('CSV gerado!');
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
              <RadioGroup label="Formato" value={format} onValueChange={(v) => setFormat(v as any)}>
                <Radio value="pdf" description="Relatório visual com gráficos">
                  <span className="flex items-center gap-2"><FileText className="size-4" /> PDF</span>
                </Radio>
                <Radio value="csv" description="Dados brutos em planilha">
                  <span className="flex items-center gap-2"><FileSpreadsheet className="size-4" /> CSV</span>
                </Radio>
              </RadioGroup>
              <Input
                label="Período (dias)" type="number" min={1} max={90}
                value={String(periodDays)}
                onValueChange={(v) => setPeriodDays(Math.min(90, Math.max(1, Number(v) || 7)))}
                description="Até a data atualmente selecionada"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={close}>Cancelar</Button>
              <Button color="primary" onPress={handleExport} isLoading={busy} className="bg-gradient-primary">
                Exportar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

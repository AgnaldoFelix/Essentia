import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DailyRecord, Goals, Meal } from '@/types/nutrition';

interface ExportPayload {
  dataReferencia: string;
  daily: DailyRecord;
  goals: Goals;
  meals: Meal[];
  historico: DailyRecord[];
}

const fmt = (n: number) => Math.round(n).toString();

export async function exportPDF(p: ExportPayload) {
  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // Title bar
  doc.setFillColor(31, 191, 168);
  doc.rect(0, 0, W, 70, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Meu Diario Nutricional', 40, 35);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Relatorio de ${p.dataReferencia}`, 40, 55);

  // Resumo do dia
  let y = 100;
  doc.setTextColor(20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo do dia', 40, y);
  y += 16;

  autoTable(doc, {
    startY: y,
    head: [['Metrica', 'Consumido', 'Meta', '% Meta']],
    body: [
      ['Calorias (kcal)', fmt(p.daily.calorias), fmt(p.goals.meta_calorias), `${Math.round((p.daily.calorias / p.goals.meta_calorias) * 100) || 0}%`],
      ['Proteinas (g)',  fmt(p.daily.proteinas), fmt(p.goals.meta_proteinas), `${Math.round((p.daily.proteinas / p.goals.meta_proteinas) * 100) || 0}%`],
      ['Gorduras (g)',   fmt(p.daily.gorduras),  fmt(p.goals.meta_gorduras),  `${Math.round((p.daily.gorduras / p.goals.meta_gorduras) * 100) || 0}%`],
      ['Carboidratos (g)', fmt(p.daily.carboidratos), fmt(p.goals.meta_carboidratos), `${Math.round((p.daily.carboidratos / p.goals.meta_carboidratos) * 100) || 0}%`],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [31, 191, 168] },
  });

  // Refeicoes
  const lastY1 = (doc as any).lastAutoTable.finalY + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Refeicoes do dia', 40, lastY1);

  autoTable(doc, {
    startY: lastY1 + 8,
    head: [['Hora', 'Refeicao', 'Kcal', 'Prot.', 'Gord.', 'Carb.']],
    body: p.meals.length
      ? p.meals.map((m) => [m.horario, `${m.emoji} ${m.nome}`, fmt(m.calorias), fmt(m.proteinas), fmt(m.gorduras), fmt(m.carboidratos)])
      : [['-', 'Sem refeicoes registradas', '-', '-', '-', '-']],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [78, 205, 196] },
  });

  // Historico
  const lastY2 = (doc as any).lastAutoTable.finalY + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Historico (ultimos dias)', 40, lastY2);

  const avgCal = p.historico.length ? p.historico.reduce((a, b) => a + Number(b.calorias), 0) / p.historico.length : 0;
  const avgProt = p.historico.length ? p.historico.reduce((a, b) => a + Number(b.proteinas), 0) / p.historico.length : 0;
  const avgFat = p.historico.length ? p.historico.reduce((a, b) => a + Number(b.gorduras), 0) / p.historico.length : 0;

  autoTable(doc, {
    startY: lastY2 + 8,
    head: [['Data', 'Calorias', 'Proteinas', 'Gorduras', 'Carboidratos']],
    body: [
      ...p.historico.map((r) => [r.data, fmt(Number(r.calorias)), fmt(Number(r.proteinas)), fmt(Number(r.gorduras)), fmt(Number(r.carboidratos))]),
      ['MEDIA', fmt(avgCal), fmt(avgProt), fmt(avgFat), '-'],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 107, 107] },
  });

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 40, doc.internal.pageSize.getHeight() - 24);

  doc.save(`meu-diario-${p.dataReferencia}.pdf`);
}

export function exportCSV({
  daily, meals, historico,
}: { daily: DailyRecord; meals: Meal[]; historico: DailyRecord[] }) {
  const lines: string[] = [];
  lines.push('# Resumo do dia');
  lines.push('data,calorias,proteinas,gorduras,carboidratos');
  lines.push(`${daily.data},${fmt(daily.calorias)},${fmt(daily.proteinas)},${fmt(daily.gorduras)},${fmt(daily.carboidratos)}`);
  lines.push('');
  lines.push('# Refeicoes do dia');
  lines.push('horario,nome,calorias,proteinas,gorduras,carboidratos');
  meals.forEach((m) => lines.push(
    `${m.horario},"${m.nome.replace(/"/g, '""')}",${fmt(m.calorias)},${fmt(m.proteinas)},${fmt(m.gorduras)},${fmt(m.carboidratos)}`,
  ));
  lines.push('');
  lines.push('# Historico');
  lines.push('data,calorias,proteinas,gorduras,carboidratos');
  historico.forEach((r) => lines.push(
    `${r.data},${fmt(Number(r.calorias))},${fmt(Number(r.proteinas))},${fmt(Number(r.gorduras))},${fmt(Number(r.carboidratos))}`,
  ));

  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meu-diario-${daily.data || 'export'}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

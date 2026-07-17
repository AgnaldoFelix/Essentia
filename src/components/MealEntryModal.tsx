import { useEffect, useRef, useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Tabs, Tab, Spinner, Chip,
} from '@heroui/react';
import { Camera, Image as ImageIcon, Type, Mic, Upload, Sparkles, X, Check, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Meal, Food, AIAnalysisResult } from '@/types/nutrition';
import { addMeal, updateMeal } from '@/lib/db';
import { toDateKey } from '@/lib/dateHelpers';
import { useApp } from '@/contexts/AppContext';
import type { FabAction } from './FloatingActionButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: FabAction;
  editing?: Meal | null;
}

const tabFromAction: Record<FabAction, string> = {
  camera: 'camera',
  gallery: 'photo',
  text: 'text',
  voice: 'voice',
  repeat: 'text',
};

interface AnalysisCache { [hash: string]: AIAnalysisResult }
const analysisCache: AnalysisCache = {};

async function hashBlob(b: Blob) {
  const buf = await b.arrayBuffer();
  const h = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(h)).slice(0, 8).map((x) => x.toString(16).padStart(2, '0')).join('');
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function MealEntryModal({ isOpen, onClose, initialTab = 'text', editing }: Props) {
  const { currentDate, refresh } = useApp();
  const [tab, setTab] = useState<string>(tabFromAction[initialTab]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [nome, setNome] = useState('');
  const [emoji, setEmoji] = useState('🍽️');
  const [horario, setHorario] = useState(() => new Date().toTimeString().slice(0, 5));
  const [foods, setFoods] = useState<Food[]>([]);
  const [confianca, setConfianca] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<any>(null);

  // hidrata quando editar
  useEffect(() => {
    if (!isOpen) return;
    setTab(tabFromAction[initialTab]);
    if (editing) {
      setNome(editing.nome);
      setEmoji(editing.emoji);
      setHorario(editing.horario);
      setFoods(editing.alimentos);
      setConfianca(editing.ai_confianca ?? null);
      setPreviewUrl(editing.imagem_url ?? null);
    } else {
      setNome('');
      setEmoji('🍽️');
      setHorario(new Date().toTimeString().slice(0, 5));
      setFoods([]);
      setConfianca(null);
      setPreviewUrl(null);
      setPhotoFile(null);
      setTextInput('');
    }
    setSavedSuccess(false);
  }, [isOpen, editing, initialTab]);

  const totals = foods.reduce(
    (acc, f) => ({
      calorias: acc.calorias + (f.calories || 0),
      proteinas: acc.proteinas + (f.protein || 0),
      gorduras: acc.gorduras + (f.fat || 0),
      carboidratos: acc.carboidratos + (f.carbs || 0),
    }),
    { calorias: 0, proteinas: 0, gorduras: 0, carboidratos: 0 },
  );

  const handleFile = async (file: File) => {
    setPhotoFile(file);
    const url = await fileToDataUrl(file);
    setPreviewUrl(url);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const payload: any = {};
      if (photoFile) {
        const url = await fileToDataUrl(photoFile);
        const hash = await hashBlob(photoFile);
        if (analysisCache[hash]) {
          applyResult(analysisCache[hash]);
          toast.success('Resultado recuperado do cache');
          return;
        }
        payload.imageDataUrl = url;
        payload.cacheKey = hash;
      } else if (textInput.trim()) {
        payload.text = textInput.trim();
      } else {
        toast.error('Forneça uma imagem ou descrição.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-meal', { body: payload });
      if (error) throw error;
      if (!data) throw new Error('Resposta vazia da IA');

      const result = data as AIAnalysisResult;
      if (payload.cacheKey) analysisCache[payload.cacheKey] = result;
      applyResult(result);
      toast.success(`Análise concluída (${Math.round(result.confianca * 100)}% confiança)`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? 'Falha na análise. Use a edição manual.');
    } finally {
      setAnalyzing(false);
    }
  };

  const applyResult = (r: AIAnalysisResult) => {
    setFoods(r.alimentos);
    setNome((prev) => prev || r.nome_sugerido);
    setEmoji(r.emoji || '🍽️');
    setConfianca(r.confianca);
    setTab('review');
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error('Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev: any) => {
      const transcript = ev.results[0][0].transcript;
      setTextInput((prev) => prev ? `${prev} ${transcript}` : transcript);
      setVoiceRecording(false);
    };
    rec.onerror = () => { setVoiceRecording(false); toast.error('Erro no reconhecimento de voz.'); };
    rec.onend = () => setVoiceRecording(false);
    rec.start();
    recRef.current = rec;
    setVoiceRecording(true);
  };

  const stopVoice = () => {
    try { recRef.current?.stop(); } catch {}
    setVoiceRecording(false);
  };

  const handleSave = async () => {
    if (!nome.trim()) { toast.error('Informe o nome da refeição'); return; }
    if (!foods.length) { toast.error('Adicione pelo menos um alimento'); return; }
    setSaving(true);
    try {
      const payload = {
        data: toDateKey(currentDate),
        horario,
        nome: nome.trim(),
        emoji,
        alimentos: foods,
        calorias: totals.calorias,
        proteinas: totals.proteinas,
        gorduras: totals.gorduras,
        carboidratos: totals.carboidratos,
        imagem_url: previewUrl,
        ai_confianca: confianca,
      };
      if (editing) {
        await updateMeal(editing.id, payload as any);
        toast.success('Refeição atualizada!');
        await refresh();
        onClose();
      } else {
        await addMeal(payload as any);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#1FBFA8', '#FFA94D'] });
        await refresh();
        setSavedSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1400);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      motionProps={{
        variants: {
          enter: { y: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
          exit: { y: 40, opacity: 0, transition: { duration: 0.2 } },
        },
      }}
      classNames={{
        base: 'glass-strong',
        header: 'border-b border-border/40',
        footer: 'border-t border-border/40',
      }}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <h2 className="text-lg font-bold">{editing ? 'Editar refeição' : 'Registrar refeição'}</h2>
                  {confianca != null && (
                    <p className="text-[11px] text-muted-foreground">Confiança IA: {Math.round(confianca * 100)}%</p>
                  )}
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="gap-4 py-4 relative">
              <AnimatePresence>
                {savedSuccess && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-md rounded-xl"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 15 }}
                      className="size-20 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center shadow-lg shadow-primary/40"
                    >
                      <CheckCircle2 className="size-11 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-center"
                    >
                      <p className="text-lg font-bold">Refeição registrada!</p>
                      <p className="text-sm text-muted-foreground">{emoji} {nome} · {Math.round(totals.calorias)} kcal</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Tabs
                aria-label="Modo de entrada"
                selectedKey={tab}
                onSelectionChange={(k) => setTab(String(k))}
                color="primary"
                variant="solid"
                size="sm"
                fullWidth
              >
                <Tab key="photo" title={<span className="flex items-center gap-1.5"><ImageIcon className="size-3.5" /> Foto</span>}>
                  <PhotoPanel
                    previewUrl={previewUrl}
                    onPick={() => fileInputRef.current?.click()}
                    onClear={() => { setPreviewUrl(null); setPhotoFile(null); }}
                    onDrop={async (file) => { await handleFile(file); }}
                  />
                  <input
                    ref={fileInputRef} type="file" accept="image/*" hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </Tab>
                <Tab key="camera" title={<span className="flex items-center gap-1.5"><Camera className="size-3.5" /> Câmera</span>}>
                  <PhotoPanel
                    previewUrl={previewUrl}
                    onPick={() => cameraInputRef.current?.click()}
                    onClear={() => { setPreviewUrl(null); setPhotoFile(null); }}
                  />
                  <input
                    ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </Tab>
                <Tab key="text" title={<span className="flex items-center gap-1.5"><Type className="size-3.5" /> Texto</span>}>
                  <div className="space-y-3">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Ex.: 200g de frango grelhado, 100g de arroz, salada"
                      className="w-full min-h-[120px] p-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    />
                  </div>
                </Tab>
                <Tab key="voice" title={<span className="flex items-center gap-1.5"><Mic className="size-3.5" /> Voz</span>}>
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Button
                      isIconOnly
                      radius="full"
                      color={voiceRecording ? 'danger' : 'primary'}
                      variant="shadow"
                      size="lg"
                      onPress={voiceRecording ? stopVoice : startVoice}
                      className="size-20"
                    >
                      <motion.div animate={voiceRecording ? { scale: [1, 1.15, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2 }}>
                        <Mic className="size-8" />
                      </motion.div>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {voiceRecording ? 'Gravando...' : 'Toque para gravar a descrição'}
                    </p>
                    {textInput && (
                      <div className="w-full p-3 rounded-xl bg-muted text-sm">{textInput}</div>
                    )}
                  </div>
                </Tab>
                <Tab key="review" title={<span className="flex items-center gap-1.5"><Check className="size-3.5" /> Revisar</span>}>
                  <ReviewPanel
                    nome={nome} setNome={setNome}
                    emoji={emoji} setEmoji={setEmoji}
                    horario={horario} setHorario={setHorario}
                    foods={foods} setFoods={setFoods}
                    totals={totals}
                  />
                </Tab>
              </Tabs>

              {(tab !== 'review') && (
                <Button
                  color="primary"
                  variant="shadow"
                  startContent={analyzing ? null : <Sparkles className="size-4" />}
                  isLoading={analyzing}
                  onPress={handleAnalyze}
                  isDisabled={(!photoFile && !textInput.trim()) || analyzing}
                  className="bg-gradient-primary"
                >
                  {analyzing ? 'Analisando...' : 'Analisar com IA'}
                </Button>
              )}
            </ModalBody>

            {!savedSuccess && (
              <ModalFooter>
                <Button variant="light" onPress={close} startContent={<X className="size-4" />}>Cancelar</Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isLoading={saving}
                  isDisabled={saving || !foods.length || !nome.trim()}
                  startContent={!saving && <Check className="size-4" />}
                  className="bg-gradient-primary"
                >
                  {editing ? 'Salvar alterações' : 'Confirmar refeição'}
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/* ----- subcomponents ----- */

function PhotoPanel({
  previewUrl, onPick, onClear, onDrop,
}: {
  previewUrl: string | null;
  onPick: () => void;
  onClear: () => void;
  onDrop?: (f: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { if (!onDrop) return; e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (!onDrop) return;
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onDrop(f);
      }}
      className={`relative rounded-xl border-2 border-dashed transition-colors min-h-[200px] grid place-items-center overflow-hidden ${
        dragOver ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    >
      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Refeição" className="absolute inset-0 w-full h-full object-cover" />
          <Button
            isIconOnly size="sm" variant="solid" color="danger" radius="full"
            className="absolute top-2 right-2"
            onPress={onClear}
            aria-label="Remover imagem"
          >
            <X className="size-3.5" />
          </Button>
        </>
      ) : (
        <div className="text-center p-6">
          <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">Arraste uma imagem ou</p>
          <Button color="primary" variant="flat" size="sm" onPress={onPick}>
            Selecionar arquivo
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewPanel({
  nome, setNome, emoji, setEmoji, horario, setHorario,
  foods, setFoods, totals,
}: {
  nome: string; setNome: (v: string) => void;
  emoji: string; setEmoji: (v: string) => void;
  horario: string; setHorario: (v: string) => void;
  foods: Food[]; setFoods: (f: Food[]) => void;
  totals: { calorias: number; proteinas: number; gorduras: number; carboidratos: number };
}) {
  const updateFood = (i: number, patch: Partial<Food>) =>
    setFoods(foods.map((f, idx) => idx === i ? { ...f, ...patch } : f));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12 sm:gap-3">
        <div className="col-span-2 sm:col-span-2">
          <Input label="Emoji" value={emoji} onValueChange={setEmoji} maxLength={4} size="sm" />
        </div>
        <div className="col-span-4 sm:col-span-6">
          <Input label="Nome" value={nome} onValueChange={setNome} size="sm" placeholder="Ex: Almoço" />
        </div>
        <div className="col-span-6 sm:col-span-4">
          <Input label="Horário" type="time" value={horario} onValueChange={setHorario} size="sm" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip color="danger" variant="flat" size="sm">🔥 {Math.round(totals.calorias)} kcal</Chip>
        <Chip color="success" variant="flat" size="sm">💪 {Math.round(totals.proteinas)}g prot</Chip>
        <Chip color="warning" variant="flat" size="sm">🥑 {Math.round(totals.gorduras)}g gord</Chip>
      </div>

      <div className="space-y-2">
        {foods.map((f, i) => (
          <div key={i} className="bg-card/70 p-2.5 rounded-xl border border-border/50 space-y-2">
            {/* Linha 1: nome + remover */}
            <div className="flex items-center gap-2">
              <Input
                size="sm"
                className="flex-1"
                placeholder="Alimento"
                value={f.name}
                onValueChange={(v) => updateFood(i, { name: v })}
              />
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="light"
                aria-label="Remover alimento"
                onPress={() => setFoods(foods.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            {/* Linha 2: qtd + macros (Kcal, P, G) */}
            <div className="grid grid-cols-4 gap-2">
              <Input
                size="sm"
                placeholder="Qtd"
                value={f.amount}
                onValueChange={(v) => updateFood(i, { amount: v })}
              />
              <Input
                size="sm"
                type="number"
                inputMode="numeric"
                label="kcal"
                labelPlacement="inside"
                value={String(f.calories)}
                onValueChange={(v) => updateFood(i, { calories: Number(v) || 0 })}
              />
              <Input
                size="sm"
                type="number"
                inputMode="numeric"
                label="Prot (g)"
                labelPlacement="inside"
                value={String(f.protein)}
                onValueChange={(v) => updateFood(i, { protein: Number(v) || 0 })}
              />
              <Input
                size="sm"
                type="number"
                inputMode="numeric"
                label="Gord (g)"
                labelPlacement="inside"
                value={String(f.fat)}
                onValueChange={(v) => updateFood(i, { fat: Number(v) || 0 })}
              />
            </div>
          </div>
        ))}
        <Button
          fullWidth size="sm" variant="flat" color="primary" startContent={<Plus className="size-3.5" />}
          onPress={() => setFoods([...foods, { name: '', amount: '100g', calories: 0, protein: 0, fat: 0, carbs: 0 }])}
        >
          Adicionar alimento
        </Button>
      </div>
    </div>
  );
}

-- Create daily nutrition records table
CREATE TABLE IF NOT EXISTS public.registro_diario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  calorias numeric NOT NULL DEFAULT 0,
  proteinas numeric NOT NULL DEFAULT 0,
  gorduras numeric NOT NULL DEFAULT 0,
  carboidratos numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, data)
);

-- Create meals table for individual meal entries
CREATE TABLE IF NOT EXISTS public.refeicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  horario time NOT NULL DEFAULT CURRENT_TIME,
  nome text NOT NULL,
  emoji text DEFAULT '🍽️',
  alimentos jsonb DEFAULT '[]'::jsonb,
  calorias numeric NOT NULL DEFAULT 0,
  proteinas numeric NOT NULL DEFAULT 0,
  gorduras numeric NOT NULL DEFAULT 0,
  carboidratos numeric NOT NULL DEFAULT 0,
  imagem_url text,
  ai_confianca numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User goals/metas
CREATE TABLE IF NOT EXISTS public.metas_usuario (
  user_id uuid PRIMARY KEY,
  meta_calorias numeric NOT NULL DEFAULT 2200,
  meta_proteinas numeric NOT NULL DEFAULT 150,
  meta_gorduras numeric NOT NULL DEFAULT 70,
  meta_carboidratos numeric NOT NULL DEFAULT 250,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registro_diario TO authenticated, anon;
GRANT ALL ON public.registro_diario TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.refeicoes TO authenticated, anon;
GRANT ALL ON public.refeicoes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metas_usuario TO authenticated, anon;
GRANT ALL ON public.metas_usuario TO service_role;

-- RLS
ALTER TABLE public.registro_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refeicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_usuario ENABLE ROW LEVEL SECURITY;

-- Permissive policies (single-user personal app - no auth yet)
CREATE POLICY "Allow all on registro_diario" ON public.registro_diario FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on refeicoes" ON public.refeicoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on metas_usuario" ON public.metas_usuario FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_registro_diario_user_data ON public.registro_diario(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_refeicoes_user_data ON public.refeicoes(user_id, data DESC);

-- Trigger to update registro_diario totals when refeicoes change
CREATE OR REPLACE FUNCTION public.atualizar_registro_diario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user uuid;
  target_data date;
  totals record;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_user := OLD.user_id;
    target_data := OLD.data;
  ELSE
    target_user := NEW.user_id;
    target_data := NEW.data;
  END IF;

  SELECT 
    COALESCE(SUM(calorias),0) AS cal,
    COALESCE(SUM(proteinas),0) AS prot,
    COALESCE(SUM(gorduras),0) AS gord,
    COALESCE(SUM(carboidratos),0) AS carb
  INTO totals
  FROM public.refeicoes
  WHERE user_id = target_user AND data = target_data;

  INSERT INTO public.registro_diario (user_id, data, calorias, proteinas, gorduras, carboidratos)
  VALUES (target_user, target_data, totals.cal, totals.prot, totals.gord, totals.carb)
  ON CONFLICT (user_id, data) DO UPDATE SET
    calorias = EXCLUDED.calorias,
    proteinas = EXCLUDED.proteinas,
    gorduras = EXCLUDED.gorduras,
    carboidratos = EXCLUDED.carboidratos,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_atualizar_registro_diario ON public.refeicoes;
CREATE TRIGGER trg_atualizar_registro_diario
AFTER INSERT OR UPDATE OR DELETE ON public.refeicoes
FOR EACH ROW EXECUTE FUNCTION public.atualizar_registro_diario();
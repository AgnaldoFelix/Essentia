
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow all on metas_usuario" ON public.metas_usuario;
DROP POLICY IF EXISTS "Allow all on refeicoes" ON public.refeicoes;
DROP POLICY IF EXISTS "Allow all on registro_diario" ON public.registro_diario;

-- User-scoped policies for refeicoes
CREATE POLICY "Users select own meals" ON public.refeicoes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own meals" ON public.refeicoes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own meals" ON public.refeicoes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own meals" ON public.refeicoes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User-scoped policies for registro_diario
CREATE POLICY "Users select own daily" ON public.registro_diario
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own daily" ON public.registro_diario
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own daily" ON public.registro_diario
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own daily" ON public.registro_diario
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User-scoped policies for metas_usuario
CREATE POLICY "Users select own goals" ON public.metas_usuario
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own goals" ON public.metas_usuario
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own goals" ON public.metas_usuario
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own goals" ON public.metas_usuario
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Revoke public execute on SECURITY DEFINER trigger function (trigger runs as owner anyway)
REVOKE EXECUTE ON FUNCTION public.atualizar_registro_diario() FROM PUBLIC, anon, authenticated;

-- Ensure trigger is attached for daily totals
DROP TRIGGER IF EXISTS trg_atualizar_registro_diario ON public.refeicoes;
CREATE TRIGGER trg_atualizar_registro_diario
AFTER INSERT OR UPDATE OR DELETE ON public.refeicoes
FOR EACH ROW EXECUTE FUNCTION public.atualizar_registro_diario();

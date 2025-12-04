# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9d4f7d00-14a0-4b84-b4cd-dce8040cbbf2

# Essentia — Meal Mindset Pro

![Essentia — preview do projeto](./assets/essentia-screenshot.png)

Uma interface moderna para planejamento nutricional e acompanhamento diário. Fornece planos de refeições ajustáveis, monitoramento da janela de alimentação, chat com IA e persistência local do usuário.

---

## Principais funcionalidades

- Planos de alimentação (ex.: "Modelo até 15h", "Modelo até 18h")
- Seleção e edição de refeições (nome, descrição, adicionar alimentos)
- Persistência local de planos e refeições via `localStorage`
- Botão "Restaurar Padrão" que limpa valores (alimentos, proteína, calorias, descrição) mantendo a estrutura/horários
- Monitoramento da janela de alimentação (progresso, tempo restante, status)
- Modal/Drawer para acessar o painel de progresso a partir da navbar
- Chat com IA (integração com Supabase/functions — opcional)
- Componentes UI reutilizáveis (cards, dialogs, toasts, etc.)
- Suporte PWA / service worker (registro no bootstrap da app)

---

## Quick start

Requisitos:
- Node.js (>=16 recomendado)
- npm (ou pnpm)

1. Instale dependências:

```bash
npm install
```

2. Crie um arquivo `.env` (se for usar integrações remotas) e defina apenas as chaves necessárias — **NÃO** commit valores sensíveis.

Chaves esperadas (nomes apenas):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

(O projeto funciona localmente sem Supabase; sem Supabase algumas integrações remotas ficam limitadas.)

3. Rodar em desenvolvimento:

```bash
npm run dev
```

4. Build para produção:

```bash
npm run build
npm run preview
```

---

## Fluxo de uso rápida (do usuário)

- Navbar: selecione o plano (Ex.: "Até 15h" / "Até 18h").
- Acesse o painel de progresso clicando no botão "Progresso" ao lado do logo.
- Dashboard: visualize proteína/calorias agregadas, edite refeições.
- Ao editar/alterar refeições, dados são salvos automaticamente no `localStorage`.
- Ao clicar em "Restaurar Padrão", os campos de cada refeição são limpos (alimentos, proteína, calorias, descrição) mantendo horários e slots — assim o usuário pode preencher novamente.

---

## Regras de negócio visíveis

- A janela de alimentação considera início fixo às `07:00` e término depende do plano (`15:00` ou `18:00`) para cálculo de progresso.
- Persistência local: planos/alterações são gravados em `localStorage` sob a chave `nutrition_custom_plans`.
- O botão "Restaurar Padrão" preserva a estrutura de refeições, mas limpa valores para entrada diária.

---

## Arquivos e pontos de partida (para desenvolvedores)

- `src/main.tsx` — bootstrap da app (providers, registro do service worker, cores)
- `src/pages/IndexPro.tsx` — versão Pro do dashboard (componentes avançados)
- `src/pages/Index.tsx` — dashboard principal
- `src/hooks/useMealPlans.ts` — lógica de planos, CRUD e persistência local
- `src/components/FeedingWindowProgress.tsx` — componente de progresso e status da janela
- `src/components/*` — componentes principais (MealCard, EditMealDialog, ChatInterface, DashboardStats, etc.)
- `src/integrations/supabase/*` — cliente Supabase e funções relacionadas (opcional)
- `public/service-worker.js` — service worker PWA

---

## Sugestões rápidas de extensão

- Tornar os títulos dos modelos (por exemplo "Modelo até 15h") editáveis: adicionar `updatePlanTitle(planId, title)` em `useMealPlans` e UI inline para edição.
- Export / Import do plano do usuário (JSON) para backup.
- Sincronização remota via Supabase para multi-dispositivo (opcional).

---

## Comandos úteis

- `npm install` — instala dependências
- `npm run dev` — desenvolvimento
- `npm run build` — build produção
- `npm run preview` — preview do build

---

## Contribuindo

- Abra PR contra a branch `dev` por padrão.
- Mantenha lint e formatação consistentes (ESLint/Prettier configurados no projeto).
- Adicione testes ao alterar lógica crítica (por exemplo: persistência ou operações nos planos).

---

## Licença e contato

- Autor: Agnaldo Santos 
— LinkedIn: https://www.linkedin.com/in/agnaldofelix/


---
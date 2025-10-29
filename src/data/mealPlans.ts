import { DailyPlan } from '@/types/nutrition';

export const mealPlans: DailyPlan[] = [
  {
    id: 'plan-15h',
    name: 'Modelo até 15h',
    totalProtein: 228,
    totalCalories: 2720,
    meals: [
      {
        id: 'pre-treino',
        time: '07:00',
        name: 'Pré-treino',
        emoji: '🥗',
        protein: 45,
        calories: 470,
        description: 'Energia rápida e proteína de fácil absorção antes do treino.',
        foods: [
          { id: '1', name: 'Iogurte natural', amount: '170 g' },
          { id: '2', name: 'Whey protein', amount: '2 scoops' },
          { id: '3', name: 'Cereal flakes (com açúcar)', amount: '50 g' }
        ]
      },
      {
        id: 'cafe-manha',
        time: '09:00',
        name: 'Café da manhã (pós-treino)',
        emoji: '🥚',
        protein: 55,
        calories: 790,
        description: 'Reposição de energia e proteína para recuperação muscular.',
        foods: [
          { id: '4', name: 'Ovos', amount: '4 unidades' },
          { id: '5', name: 'Pães de forma integrais', amount: '2 unidades' },
          { id: '6', name: 'Leite em pó La Serenísima', amount: '3 colheres' }
        ]
      },
      {
        id: 'almoco',
        time: '12:30',
        name: 'Almoço',
        emoji: '🍗',
        protein: 60,
        calories: 680,
        description: 'Refeição equilibrada com boa digestão e energia prolongada.',
        foods: [
          { id: '7', name: 'Frango grelhado', amount: '200 g' },
          { id: '8', name: 'Purê de abóbora', amount: '200 g' },
          { id: '9', name: 'Arroz cozido', amount: '80 g' }
        ]
      },
      {
        id: 'lanche-tarde',
        time: '15:00',
        name: 'Lanche da tarde',
        emoji: '🍌',
        protein: 35,
        calories: 300,
        description: 'Lanche leve e prático para manter o anabolismo ativo.',
        foods: [
          { id: '10', name: 'Banana', amount: '1 unidade' },
          { id: '11', name: 'Whey protein', amount: '2 scoops' }
        ]
      },
      {
        id: 'lanche-noite',
        time: '17:30',
        name: 'Lanche da noite',
        emoji: '🌙',
        protein: 18,
        calories: 330,
        description: 'Energia e proteína moderada antes do descanso.',
        foods: [
          { id: '12', name: 'Banana', amount: '1 unidade' },
          { id: '13', name: 'Cereal flakes', amount: '50 g' },
          { id: '14', name: 'Leite em pó', amount: '2 colheres' }
        ]
      },
      {
        id: 'ceia',
        time: '20:00',
        name: 'Ceia',
        emoji: '🍶',
        protein: 15,
        calories: 150,
        description: 'Fechamento do dia com proteína de lenta absorção para recuperação noturna.',
        foods: [
          { id: '15', name: 'YoPRO (15g proteína)', amount: '1 unidade' }
        ]
      }
    ]
  },
  {
    id: 'plan-18h',
    name: 'Modelo até 18h',
    totalProtein: 228,
    totalCalories: 2720,
    meals: [
      {
        id: 'pre-treino-18',
        time: '08:00',
        name: 'Pré-treino',
        emoji: '🥗',
        protein: 45,
        calories: 470,
        description: 'Energia rápida e proteína de fácil absorção antes do treino.',
        foods: [
          { id: '16', name: 'Iogurte natural', amount: '170 g' },
          { id: '17', name: 'Whey protein', amount: '2 scoops' },
          { id: '18', name: 'Cereal flakes (com açúcar)', amount: '50 g' }
        ]
      },
      {
        id: 'cafe-manha-18',
        time: '10:00',
        name: 'Café da manhã (pós-treino)',
        emoji: '🥚',
        protein: 55,
        calories: 790,
        description: 'Reposição de energia e proteína para recuperação muscular.',
        foods: [
          { id: '19', name: 'Ovos', amount: '4 unidades' },
          { id: '20', name: 'Pães de forma integrais', amount: '2 unidades' },
          { id: '21', name: 'Leite em pó La Serenísima', amount: '3 colheres' }
        ]
      },
      {
        id: 'almoco-18',
        time: '13:30',
        name: 'Almoço',
        emoji: '🍗',
        protein: 60,
        calories: 680,
        description: 'Refeição equilibrada com boa digestão e energia prolongada.',
        foods: [
          { id: '22', name: 'Frango grelhado', amount: '200 g' },
          { id: '23', name: 'Purê de abóbora', amount: '200 g' },
          { id: '24', name: 'Arroz cozido', amount: '80 g' }
        ]
      },
      {
        id: 'lanche-tarde-18',
        time: '16:00',
        name: 'Lanche da tarde',
        emoji: '🍌',
        protein: 35,
        calories: 300,
        description: 'Lanche leve e prático para manter o anabolismo ativo.',
        foods: [
          { id: '25', name: 'Banana', amount: '1 unidade' },
          { id: '26', name: 'Whey protein', amount: '2 scoops' }
        ]
      },
      {
        id: 'lanche-noite-18',
        time: '18:30',
        name: 'Lanche da noite',
        emoji: '🌙',
        protein: 18,
        calories: 330,
        description: 'Energia e proteína moderada antes do descanso.',
        foods: [
          { id: '27', name: 'Banana', amount: '1 unidade' },
          { id: '28', name: 'Cereal flakes', amount: '50 g' },
          { id: '29', name: 'Leite em pó', amount: '2 colheres' }
        ]
      },
      {
        id: 'ceia-18',
        time: '21:00',
        name: 'Ceia',
        emoji: '🍶',
        protein: 15,
        calories: 150,
        description: 'Fechamento do dia com proteína de lenta absorção para recuperação noturna.',
        foods: [
          { id: '30', name: 'YoPRO (15g proteína)', amount: '1 unidade' }
        ]
      }
    ]
  }
];

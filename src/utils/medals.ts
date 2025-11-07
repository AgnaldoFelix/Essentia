// utils/medals.ts
export class MedalSystem {
  static calculateMedal(percentage: number): { type: 'gold' | 'silver' | 'bronze' | null; message: string } {
    if (percentage >= 100) {
      return {
        type: 'gold',
        message: '🏆 Excelente! Meta superada!'
      };
    } else if (percentage >= 90) {
      return {
        type: 'silver', 
        message: '🥈 Incrível! Quase perfeito!'
      };
    } else if (percentage >= 75) {
      return {
        type: 'bronze',
        message: '🥉 Bom trabalho! Continue assim!'
      };
    }
    return { type: null, message: '' };
  }

  static getMedalIcon(type: 'gold' | 'silver' | 'bronze') {
    const icons = {
      gold: '🥇',
      silver: '🥈', 
      bronze: '🥉'
    };
    return icons[type];
  }

  static getMedalColor(type: 'gold' | 'silver' | 'bronze') {
    const colors = {
      gold: 'text-yellow-500',
      silver: 'text-gray-400',
      bronze: 'text-orange-800'
    };
    return colors[type];
  }
}
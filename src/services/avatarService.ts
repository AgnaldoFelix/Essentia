// services/avatarService.ts
export class AvatarService {
  // Usando uma abordagem mais simples e confiável
  private static baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';

  static generateAvatarUrl(seed: string = 'default'): string {
    // Parâmetros mínimos que funcionam
    const params = new URLSearchParams({
      seed: seed,
      size: '120',
      radius: '50',
      backgroundColor: 'ffd5dc',
      topType: 'ShortHairShortCurly',
      hairColor: '4f46e5',
      facialHairType: 'Blank',
      clothesType: 'ShirtCrewNeck',
      clothesColor: '10b981',
      eyeType: 'Default',
      eyebrowType: 'Default',
      mouthType: 'Default',
      skinColor: 'fd9841'
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  static async generateAvatarSvg(seed: string = 'default'): Promise<string> {
    try {
      const url = this.generateAvatarUrl(seed);
      console.log('🔄 Tentando gerar avatar:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const svgText = await response.text();
      return svgText;
    } catch (error) {
      console.error('❌ Erro ao gerar avatar, usando fallback:', error);
      return this.generateFallbackSvg(seed);
    }
  }

  private static generateFallbackSvg(seed: string): string {
    // Fallback bonito e personalizado
    const colors = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    const colorIndex = seed ? 
      seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 
      Math.floor(Math.random() * colors.length);
    const color = colors[colorIndex];
    
    const initials = seed ? seed.substring(0, 2).toUpperCase() : 'US';
    
    return `
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.6" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="url(#bg-${seed})" stroke="${color}" stroke-width="2"/>
        <text x="60" y="70" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold" dy=".3em">
          ${initials}
        </text>
      </svg>
    `.trim();
  }

  // Método super simples que sempre funciona
  static async generateSimpleAvatar(userName: string = 'Usuário'): Promise<string> {
    const seed = userName.toLowerCase().replace(/\s+/g, '-');
    return this.generateAvatarSvg(seed);
  }

  // Gerar avatar baseado no nome (sempre funciona)
  static generateInitialsAvatar(name: string): string {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    const colors = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const color = colors[colorIndex];
    
    return `
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="50" fill="${color}"/>
        <text x="60" y="68" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="bold" dy=".3em">
          ${initials}
        </text>
      </svg>
    `.trim();
  }
}
import { CircularRing } from './CircularRing';
import { useApp } from '@/contexts/AppContext';

export function Rings() {
  const { daily, goals } = useApp();
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 py-4">
      <CircularRing
        label="Calorias"
        current={Math.round(daily.calorias)}
        goal={goals.meta_calorias}
        unit="kcal"
        icon="🔥"
        colorVar="--calories"
        glowClass="glow-calories"
      />
      <CircularRing
        label="Proteínas"
        current={Math.round(daily.proteinas)}
        goal={goals.meta_proteinas}
        unit="g"
        icon="💪"
        colorVar="--protein"
        glowClass="glow-protein"
      />
      <CircularRing
        label="Gorduras"
        current={Math.round(daily.gorduras)}
        goal={goals.meta_gorduras}
        unit="g"
        icon="🥑"
        colorVar="--fat"
        glowClass="glow-fat"
      />
    </div>
  );
}

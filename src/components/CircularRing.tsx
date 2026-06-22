import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@heroui/react';
import { cn } from '@/lib/utils';
import { pct, fmtNumber } from '@/lib/macros';

interface CircularRingProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  icon: string;
  /** CSS var token (without `var()`) — e.g. '--calories' */
  colorVar: string;
  size?: number;
  stroke?: number;
  /** Tailwind glow utility, e.g. 'glow-calories' */
  glowClass?: string;
}

export function CircularRing({
  label,
  current,
  goal,
  unit,
  icon,
  colorVar,
  size = 180,
  stroke = 14,
  glowClass,
}: CircularRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = pct(current, goal);
  const offset = circumference - (percentage / 100) * circumference;
  const isHighlighted = percentage >= 80;

  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>();

  // Animação de contagem do número central
  useEffect(() => {
    const start = displayed;
    const end = current;
    const duration = 800;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const ease = 1 - Math.pow(1 - k, 3);
      setDisplayed(Math.round(start + (end - start) * ease));
      if (k < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const colorHsl = `hsl(var(${colorVar}))`;

  return (
    <Tooltip
      content={
        <div className="px-2 py-1 text-xs">
          <div className="font-semibold">{label}</div>
          <div className="text-default-500">
            {fmtNumber(current)} / {fmtNumber(goal)} {unit} ({Math.round(percentage)}%)
          </div>
        </div>
      }
      placement="top"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'relative inline-flex flex-col items-center justify-center select-none',
          isHighlighted && glowClass && glowClass,
          isHighlighted && 'rounded-full',
        )}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
            opacity={0.4}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorHsl}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              filter: isHighlighted
                ? `drop-shadow(0 0 12px ${colorHsl})`
                : `drop-shadow(0 0 4px ${colorHsl}66)`,
            }}
          />
        </svg>

        {/* Centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            className="text-2xl mb-0.5"
            animate={isHighlighted ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {icon}
          </motion.span>
          <span className="font-mono font-bold text-2xl leading-none tabular-nums" style={{ color: colorHsl }}>
            {fmtNumber(displayed)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
            / {fmtNumber(goal)} {unit}
          </span>
          <span className="text-[11px] font-semibold mt-1">{label}</span>
        </div>
      </motion.div>
    </Tooltip>
  );
}

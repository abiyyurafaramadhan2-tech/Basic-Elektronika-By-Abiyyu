import { motion, type HTMLMotionProps } from 'framer-motion';
import type { GlowColor } from '../../types';

interface GlassPanelProps extends Omit<HTMLMotionProps<'div'>, 'className'> {
  children: React.ReactNode;
  className?: string;
  glow?: GlowColor;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const glowMap: Record<GlowColor, string> = {
  cyan:   'hover:border-neon-cyan/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.12)]',
  green:  'hover:border-neon-green/40 hover:shadow-[0_0_30px_rgba(57,255,20,0.12)]',
  purple: 'hover:border-neon-purple/40 hover:shadow-[0_0_30px_rgba(191,90,242,0.12)]',
  orange: 'hover:border-neon-orange/40 hover:shadow-[0_0_30px_rgba(255,107,53,0.12)]',
  gold:   'hover:border-neon-gold/40 hover:shadow-[0_0_30px_rgba(255,215,0,0.12)]',
};

const padMap = { sm: 'p-3', md: 'p-5', lg: 'p-8', none: '' };

export function GlassPanel({
  children,
  className = '',
  glow = 'cyan',
  hover = false,
  padding = 'md',
  ...motionProps
}: GlassPanelProps) {
  return (
    <motion.div
      className={`
        backdrop-blur-xl bg-white/[0.025] 
        border border-white/[0.07] 
        rounded-2xl
        transition-all duration-300
        ${hover ? glowMap[glow] : ''}
        ${padMap[padding]}
        ${className}
      `}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

/* Compact badge-style glass pill */
export function GlassBadge({
  children,
  color = 'cyan',
  className = '',
}: {
  children: React.ReactNode;
  color?: GlowColor;
  className?: string;
}) {
  const textColors: Record<GlowColor, string> = {
    cyan:   'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
    green:  'text-neon-green border-neon-green/30 bg-neon-green/10',
    purple: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
    orange: 'text-neon-orange border-neon-orange/30 bg-neon-orange/10',
    gold:   'text-neon-gold border-neon-gold/30 bg-neon-gold/10',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-0.5
        font-mono text-xs font-medium tracking-wider uppercase
        border rounded-full
        ${textColors[color]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

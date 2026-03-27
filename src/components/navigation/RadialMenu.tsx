import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import type { NavItem, PageId } from '../../types';

const NAV_ITEMS: NavItem[] = [
  { id: 'theory',     label: 'Theory',      icon: '📐', color: 'cyan',   description: 'Fundamentals & Laws' },
  { id: 'components', label: 'Components',  icon: '🔧', color: 'green',  description: 'Component Atlas'    },
  { id: 'tools',      label: 'Laboratory',  icon: '🔬', color: 'purple', description: 'Ohmic Lab & Tools'  },
];

const RADIUS = 110;

function getPosition(index: number, total: number) {
  // Spread items in a semicircle above (from -160° to -20°)
  const startAngle = -160;
  const endAngle   = -20;
  const step = (endAngle - startAngle) / (total - 1);
  const angleDeg = startAngle + index * step;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(angleRad) * RADIUS,
    y: Math.sin(angleRad) * RADIUS,
  };
}

const colorMap: Record<string, { text: string; border: string; bg: string; shadow: string }> = {
  cyan:   { text:'text-neon-cyan',   border:'border-neon-cyan/40',   bg:'bg-neon-cyan/10',   shadow:'hover:shadow-neon-md'    },
  green:  { text:'text-neon-green',  border:'border-neon-green/40',  bg:'bg-neon-green/10',  shadow:'hover:shadow-green-md'   },
  purple: { text:'text-neon-purple', border:'border-neon-purple/40', bg:'bg-neon-purple/10', shadow:'hover:shadow-purple-md'  },
  orange: { text:'text-neon-orange', border:'border-neon-orange/40', bg:'bg-neon-orange/10', shadow:'hover:shadow-orange-md'  },
  gold:   { text:'text-neon-gold',   border:'border-neon-gold/40',   bg:'bg-neon-gold/10',   shadow:'hover:shadow-gold-md'    },
};

export function RadialMenu() {
  const { currentPage, setCurrentPage } = useApp();
  const [open, setOpen] = useState(false);

  const handleSelect = (id: PageId) => {
    setCurrentPage(id);
    setOpen(false);
  };

  const isHome = currentPage === 'home';

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Orbit ring glow */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Subtle orbit circle */}
            <svg
              width={RADIUS * 2 + 80}
              height={RADIUS * 2 + 80}
              className="absolute"
              style={{
                left: -(RADIUS + 40) + 28,
                top:  -(RADIUS + 40) + 28,
                pointerEvents: 'none',
              }}
            >
              <circle
                cx={RADIUS + 40}
                cy={RADIUS + 40}
                r={RADIUS}
                fill="none"
                stroke="rgba(0,229,255,0.08)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            </svg>

            {/* Nav items */}
            {NAV_ITEMS.map((item, i) => {
              const pos = getPosition(i, NAV_ITEMS.length);
              const c   = colorMap[item.color];
              const isActive = currentPage === item.id;

              return (
                <motion.button
                  key={item.id}
                  className={`
                    absolute w-14 h-14 rounded-full
                    backdrop-blur-xl border
                    flex flex-col items-center justify-center gap-0.5
                    cursor-pointer transition-all duration-200
                    ${c.bg} ${c.border} ${c.shadow}
                    ${isActive ? 'ring-2 ring-offset-2 ring-offset-dark-800' : ''}
                  `}
                  style={{ left: pos.x - 28 + 28, top: pos.y - 28 + 28 }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: 1, x: pos.x, y: pos.y, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 22,
                    delay: i * 0.06,
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSelect(item.id)}
                >
                  <span className="text-xl leading-none">{item.icon}</span>
                  <span className={`font-mono text-[8px] font-semibold uppercase tracking-wider ${c.text}`}>
                    {item.label}
                  </span>

                  {/* Tooltip */}
                  <motion.div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                    initial={{ opacity: 0, y: 4 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="glass-card px-2 py-1 text-[10px] font-mono text-white/70">
                      {item.description}
                    </div>
                  </motion.div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central trigger button */}
      <motion.button
        className={`
          relative w-14 h-14 rounded-full
          backdrop-blur-xl border-2
          flex items-center justify-center
          cursor-pointer
          ${open
            ? 'bg-neon-cyan/20 border-neon-cyan/70 shadow-neon-md'
            : 'bg-dark-700/80 border-neon-cyan/30 hover:border-neon-cyan/60 hover:shadow-neon-sm'
          }
          transition-all duration-300
        `}
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        title="Navigation Menu"
      >
        {/* Pulse ring */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-full border border-neon-cyan/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {open ? (
            <span className="text-neon-cyan text-2xl font-light">×</span>
          ) : (
            <span className="text-neon-cyan text-xl">⚡</span>
          )}
        </motion.div>
      </motion.button>

      {/* Back to home (when on a page) */}
      <AnimatePresence>
        {!isHome && !open && (
          <motion.button
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                       font-mono text-[10px] text-white/30 hover:text-neon-cyan/60
                       transition-colors duration-200"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setCurrentPage('home')}
          >
            ← HOME
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

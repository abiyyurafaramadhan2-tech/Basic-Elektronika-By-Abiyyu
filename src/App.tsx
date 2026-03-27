import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { RadialMenu }      from './components/navigation/RadialMenu';
import { Footer }          from './components/layout/Footer';
import { TheoryPage }      from './pages/TheoryPage';
import { ComponentsPage }  from './pages/ComponentsPage';
import type { PageId } from './types';

// Lazy-loaded pages (prevent flash)
function ToolsPage() {
  return (
    <div className="flex items-center justify-center h-full min-h-64">
      <div className="text-center space-y-3">
        <div className="text-4xl">🔬</div>
        <div className="font-orbitron text-white/40 text-sm tracking-widest uppercase">Laboratory</div>
        <div className="font-mono text-xs text-white/20">Send signal for Laboratory module</div>
      </div>
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, x: 60,  filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0,   filter: 'blur(0px)' },
  exit:    { opacity: 0, x: -60, filter: 'blur(4px)' },
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 28,
};

function HomePage() {
  const { setCurrentPage } = useApp();

  const cards = [
    { id:'theory'     as PageId, icon:'📐', label:'Theory',     desc:'Charge, Voltage, Current, Ohm\'s Law', color:'cyan'   },
    { id:'components' as PageId, icon:'🔧', label:'Components',  desc:'Resistors, Capacitors, Diodes, BJTs',  color:'green'  },
    { id:'tools'      as PageId, icon:'🔬', label:'Laboratory',  desc:'Ohmic Lab, Stress Test, V=IR',         color:'purple' },
  ];

  const colorStyles: Record<string, string> = {
    cyan:   'border-neon-cyan/20 hover:border-neon-cyan/50 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]',
    green:  'border-neon-green/20 hover:border-neon-green/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.15)]',
    purple: 'border-neon-purple/20 hover:border-neon-purple/50 hover:shadow-[0_0_30px_rgba(191,90,242,0.15)]',
  };

  const iconBg: Record<string, string> = {
    cyan:   'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan',
    green:  'bg-neon-green/10 border-neon-green/30 text-neon-green',
    purple: 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 py-12">
      {/* Glitch title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center mb-14 space-y-4"
      >
        {/* Animated logo mark */}
        <motion.div
          className="mx-auto w-20 h-20 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 flex items-center justify-center mb-6"
          animate={{
            boxShadow: [
              '0 0 20px rgba(0,229,255,0.1)',
              '0 0 50px rgba(0,229,255,0.3)',
              '0 0 20px rgba(0,229,255,0.1)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-4xl">⚡</span>
        </motion.div>

        <h1 className="font-orbitron font-black text-4xl md:text-6xl text-white tracking-tight leading-none">
          ELECTRO
          <span
            className="block neon-text-cyan glitch-text"
            data-text="VERSE"
          >
            VERSE
          </span>
        </h1>

        <p className="text-white/40 max-w-md mx-auto text-sm font-body leading-relaxed">
          An immersive, interactive learning environment for electronics.
          Explore the invisible forces that power our world.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs font-mono text-white/25">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          SYSTEM ONLINE · v1.0.0
        </div>
      </motion.div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentPage(card.id)}
            className={`
              group relative text-left p-6 rounded-2xl
              backdrop-blur-xl bg-white/[0.025]
              border transition-all duration-300
              cursor-pointer
              ${colorStyles[card.color]}
            `}
          >
            {/* Scan line effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan" />
            </div>

            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg mb-4 ${iconBg[card.color]}`}>
              {card.icon}
            </div>
            <h3 className="font-orbitron font-semibold text-white text-sm tracking-wide mb-1">{card.label}</h3>
            <p className="text-white/40 text-xs font-body">{card.desc}</p>

            <div className={`
              mt-4 text-xs font-mono tracking-wider flex items-center gap-1 transition-all
              ${card.color === 'cyan' ? 'text-neon-cyan/50 group-hover:text-neon-cyan' : ''}
              ${card.color === 'green' ? 'text-neon-green/50 group-hover:text-neon-green' : ''}
              ${card.color === 'purple' ? 'text-neon-purple/50 group-hover:text-neon-purple' : ''}
            `}>
              ENTER <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-6 mt-12 text-xs font-mono text-white/20"
      >
        {[['6', 'Theory Modules'], ['4', 'Interactive Components'], ['∞', 'Calculations']].map(([v, l]) => (
          <div key={l} className="text-center">
            <div className="text-neon-cyan/50 font-bold text-lg leading-none">{v}</div>
            <div className="mt-0.5">{l}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function AppInner() {
  const { currentPage, ghostActive, setGhostActive } = useApp();

  // Ghost Protocol: click logo 5× fast
  const [logoClicks, setLogoClicks] = useState(0);
  useEffect(() => {
    if (logoClicks >= 5) {
      setGhostActive(true);
      setLogoClicks(0);
    }
    const t = setTimeout(() => setLogoClicks(0), 1500);
    return () => clearTimeout(t);
  }, [logoClicks, setGhostActive]);

  const pageMap: Record<PageId, React.ReactNode> = {
    home:       <HomePage />,
    theory:     <TheoryPage />,
    components: <ComponentsPage />,
    tools:      <ToolsPage />,
  };

  return (
    <div className="min-h-screen circuit-bg scanlines flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.04] backdrop-blur-xl bg-dark-900/70">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => setLogoClicks(n => n + 1)}
            className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-0"
          >
            <motion.div
              className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center"
              whileHover={{ scale: 1.1, borderColor: 'rgba(0,229,255,0.6)' }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-neon-cyan text-sm">⚡</span>
            </motion.div>
            <span className="font-orbitron text-xs font-bold tracking-[0.2em] text-white/50 group-hover:text-neon-cyan/70 transition-colors uppercase">
              ElectroVerse
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-white/20">
              <span className="w-1 h-1 rounded-full bg-neon-green animate-pulse" />
              ONLINE
            </div>
            {/* Ghost Protocol hint — subtle */}
            <button
              onClick={() => setGhostActive(true)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-white/10 hover:text-neon-gold/40 transition-colors text-xs"
              title="[REDACTED]"
            >
              ◈
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="h-full"
          >
            {pageMap[currentPage]}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <RadialMenu />

      {/* Ghost Protocol overlay placeholder */}
      <AnimatePresence>
        {ghostActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-dark-900/95 backdrop-blur-2xl flex items-center justify-center"
            onClick={() => setGhostActive(false)}
          >
            <div className="text-center space-y-4" onClick={e => e.stopPropagation()}>
              <div className="font-orbitron text-neon-gold text-2xl font-bold tracking-[0.3em]">
                GHOST · PROTOCOL
              </div>
              <div className="font-mono text-white/30 text-xs">
                © 2026 Abiyyu Rafa Ramadhan — Module loading on next signal...
              </div>
              <button onClick={() => setGhostActive(false)} className="btn-neon text-xs">
                ← EXIT VAULT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
        }

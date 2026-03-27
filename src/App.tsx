import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider, useLang } from './context/LanguageContext';
import { LanguageToggle } from './components/ui/LanguageToggle';
import { RadialMenu }     from './components/navigation/RadialMenu';
import { Footer }         from './components/layout/Footer';
import { GhostProtocol }  from './components/ghost/GhostProtocol';
import { TheoryPage }     from './pages/TheoryPage';
import { ComponentsPage } from './pages/ComponentsPage';
import { LaboratoryPage } from './pages/LaboratoryPage';
import type { PageId } from './types';

const pageVariants = {
  initial: { opacity:0, x:50, filter:'blur(3px)' },
  animate: { opacity:1, x:0,  filter:'blur(0px)' },
  exit:    { opacity:0, x:-50,filter:'blur(3px)' },
};

function HomePage() {
  const { setCurrentPage } = useApp();
  const { t } = useLang();

  const cards = [
    { id:'theory'     as PageId, icon:'📐', labelKey:'nav_theory',     descKey:'theory_desc',     color:'cyan'   },
    { id:'components' as PageId, icon:'🔧', labelKey:'nav_components',  descKey:'components_desc', color:'green'  },
    { id:'tools'      as PageId, icon:'🔬', labelKey:'nav_lab',         descKey:'lab_desc',        color:'purple' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 py-12">
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        transition={{ type:'spring', stiffness:200, damping:20 }}
        className="text-center mb-14 space-y-4">
        <motion.div className="mx-auto w-20 h-20 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 flex items-center justify-center mb-6"
          animate={{ boxShadow:['0 0 20px rgba(0,229,255,0.1)','0 0 50px rgba(0,229,255,0.3)','0 0 20px rgba(0,229,255,0.1)'] }}
          transition={{ duration:3, repeat:Infinity }}>
          <span className="text-4xl">⚡</span>
        </motion.div>
        <h1 className="font-orbitron font-black text-4xl md:text-6xl text-white tracking-tight leading-none">
          ELECTRO
          <span className="block neon-text-cyan glitch-text" data-text="VERSE">VERSE</span>
        </h1>
        <p className="text-white/40 max-w-md mx-auto text-sm font-body leading-relaxed">{t('tagline')}</p>
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-white/25">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          {t('system_online')} · 15 {t('tab_all')} · v1.0.0
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {cards.map((card, i) => (
          <motion.button key={card.id}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.15+i*0.1, type:'spring', stiffness:300, damping:24 }}
            whileHover={{ y:-4, scale:1.02 }} whileTap={{ scale:0.97 }}
            onClick={() => setCurrentPage(card.id)}
            className={`group relative text-left p-6 rounded-2xl backdrop-blur-xl bg-white/[0.025] border border-${card.color === 'cyan' ? 'neon-cyan' : card.color === 'green' ? 'neon-green' : 'neon-purple'}/20 hover:border-${card.color === 'cyan' ? 'neon-cyan' : card.color === 'green' ? 'neon-green' : 'neon-purple'}/50 transition-all duration-300 cursor-pointer`}
          >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg mb-4 bg-${card.color === 'cyan' ? 'neon-cyan' : card.color === 'green' ? 'neon-green' : 'neon-purple'}/10 border-${card.color === 'cyan' ? 'neon-cyan' : card.color === 'green' ? 'neon-green' : 'neon-purple'}/30 text-${card.color === 'cyan' ? 'neon-cyan' : card.color === 'green' ? 'neon-green' : 'neon-purple'}`}>
              {card.icon}
            </div>
            <h3 className="font-orbitron font-semibold text-white text-sm tracking-wide mb-1">{t(card.labelKey as any)}</h3>
            <p className="text-white/40 text-xs font-body">{t(card.descKey as any)}</p>
            <div className={`mt-4 text-xs font-mono tracking-wider flex items-center gap-1 text-${card.color === 'cyan' ? 'neon-cyan' : card.color === 'green' ? 'neon-green' : 'neon-purple'}/50 group-hover:text-${card.color === 'cyan' ? 'neon-cyan' : card.color === 'green' ? 'neon-green' : 'neon-purple'} transition-colors`}>
              {t('enter')} <motion.span animate={{ x:[0,4,0] }} transition={{ duration:1.2, repeat:Infinity }}>→</motion.span>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
        className="flex items-center gap-6 mt-12 text-xs font-mono text-white/20">
        {[['15', t('tab_all')],['3','Modules'],['∞','Calculations']].map(([v,l]) => (
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
  const { currentPage, setCurrentPage, ghostActive, setGhostActive } = useApp();
  const { t, lang } = useLang();
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    if (logoClicks >= 5) { setGhostActive(true); setLogoClicks(0); }
    const timer = setTimeout(() => setLogoClicks(0), 1500);
    return () => clearTimeout(timer);
  }, [logoClicks, setGhostActive]);

  const pageMap: Record<PageId, React.ReactNode> = {
    home:       <HomePage />,
    theory:     <TheoryPage />,
    components: <ComponentsPage />,
    tools:      <LaboratoryPage />,
  };

  return (
    <div className="min-h-screen circuit-bg scanlines flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.04] backdrop-blur-xl bg-dark-900/70">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
          <button onClick={() => setLogoClicks(n => n+1)}
            className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-0">
            <motion.div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center"
              whileHover={{ scale:1.1, borderColor:'rgba(0,229,255,0.6)' }} whileTap={{ scale:0.9 }}>
              <span className="text-neon-cyan text-sm">⚡</span>
            </motion.div>
            <span className="font-orbitron text-xs font-bold tracking-[0.2em] text-white/50 group-hover:text-neon-cyan/70 transition-colors uppercase hidden sm:inline">
              ElectroVerse
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <LanguageToggle />

            {/* Ghost Protocol trigger */}
            <motion.button onClick={() => setGhostActive(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neon-gold/25 hover:text-neon-gold/60 transition-colors text-xs border border-transparent hover:border-neon-gold/20"
              whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} title="◈">
              ◈
            </motion.button>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-white/20">
              <span className="w-1 h-1 rounded-full bg-neon-green animate-pulse" />
              {t('online')}
            </div>
          </div>
        </div>
      </header>

      {/* Pages */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage}
            variants={pageVariants} initial="initial" animate="animate" exit="exit"
            transition={{ type:'spring', stiffness:280, damping:28 }}
            className="h-full">
            {pageMap[currentPage]}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <RadialMenu />

      {/* Ghost Protocol */}
      <AnimatePresence>
        {ghostActive && <GhostProtocol onClose={() => setGhostActive(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </LanguageProvider>
  );
}

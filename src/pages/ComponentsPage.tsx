import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassBadge } from '../components/ui/GlassPanel';
import { ResistorNode }   from '../components/atlas/ResistorNode';
import { CapacitorNode }  from '../components/atlas/CapacitorNode';
import { DiodeNode }      from '../components/atlas/DiodeNode';
import { TransistorNode } from '../components/atlas/TransistorNode';

type TabId = 'all' | 'passive' | 'active' | 'semiconductor';

const TABS: { id: TabId; label: string; count: number }[] = [
  { id:'all',          label:'All',         count: 4 },
  { id:'passive',      label:'Passive',     count: 2 },
  { id:'active',       label:'Active',      count: 1 },
  { id:'semiconductor',label:'Semiconductor',count:1 },
];

type ComponentMeta = {
  id: string;
  tab: Exclude<TabId, 'all'>;
  node: React.ReactNode;
};

const COMPONENTS: ComponentMeta[] = [
  { id:'resistor',    tab:'passive',       node: <ResistorNode /> },
  { id:'capacitor',   tab:'passive',       node: <CapacitorNode /> },
  { id:'diode',       tab:'semiconductor', node: <DiodeNode /> },
  { id:'transistor',  tab:'active',        node: <TransistorNode /> },
];

export function ComponentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const visible = COMPONENTS.filter(c => activeTab === 'all' || c.tab === activeTab);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-8 overflow-y-auto scrollbar-none">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <GlassBadge color="green">🔧 Component Atlas · Module 02</GlassBadge>
        <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white tracking-tight">
          Component{' '}
          <span className="neon-text-green">Atlas</span>
        </h1>
        <p className="text-white/40 text-sm font-body max-w-xl mx-auto">
          Interact with every component. Visualize physics in real time.
          Click any card to expand its interactive diagram and parameters.
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full
              font-mono text-xs font-semibold uppercase tracking-wider
              border transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-neon-green/15 border-neon-green/50 text-neon-green shadow-green-sm'
                : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
              }
            `}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {tab.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-neon-green/20 text-neon-green' : 'bg-white/[0.06] text-white/30'}`}>
              {tab.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {visible.map((comp, i) => (
            <motion.div
              key={comp.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.06 }}
            >
              {comp.node}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Electronics timeline */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-6 h-6 rounded bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-xs">📅</span>
          <h2 className="font-orbitron text-sm font-semibold text-white/80 tracking-wider uppercase">
            Discovery Timeline
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/40 via-neon-green/30 to-neon-purple/20" />

          <div className="space-y-4 pl-10">
            {[
              { year:'1820', event:'Ørsted discovers electromagnetism',     icon:'🧲', color:'text-neon-cyan'   },
              { year:'1826', event:"Ohm publishes V = I × R",              icon:'Ω',   color:'text-neon-orange' },
              { year:'1847', event:'Kirchhoff formulates circuit laws',     icon:'⊕',  color:'text-neon-green'  },
              { year:'1906', event:'De Forest invents the triode vacuum tube',icon:'💡',color:'text-neon-purple' },
              { year:'1947', event:'Shockley, Bardeen & Brattain: Transistor',icon:'🔌',color:'text-neon-cyan'  },
              { year:'1958', event:'Kilby invents the integrated circuit',  icon:'🔬', color:'text-neon-green'  },
              { year:'1965', event:"Moore's Law: density doubles every 2yr",icon:'📈', color:'text-neon-gold'   },
            ].map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-3 group"
              >
                {/* Dot */}
                <div className="absolute left-2 w-4 h-4 rounded-full bg-dark-900 border border-neon-cyan/30 flex items-center justify-center -translate-x-[1px] mt-0.5 group-hover:border-neon-cyan/60 transition-colors" />

                <div className="glass-card-hover px-4 py-2.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className={`font-mono text-xs font-bold ${item.color}`}>{item.year}</span>
                    <span className="text-xs text-white/60 font-body">{item.event}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
      }

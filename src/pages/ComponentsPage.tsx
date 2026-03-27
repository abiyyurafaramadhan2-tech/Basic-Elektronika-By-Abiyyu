import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassBadge } from '../components/ui/GlassPanel';
import { ResistorNode }    from '../components/atlas/ResistorNode';
import { CapacitorNode }   from '../components/atlas/CapacitorNode';
import { DiodeNode }       from '../components/atlas/DiodeNode';
import { TransistorNode }  from '../components/atlas/TransistorNode';
import {
  LEDNode, InductorNode, TransformerNode, ZenerNode,
  MOSFETNode, OpAmpNode, RelayNode, PotentiometerNode,
  FuseNode, CrystalNode, SCRNode,
} from '../components/atlas/SimpleComponents';
import { useLang } from '../context/LanguageContext';

type TabId = 'all' | 'passive' | 'active' | 'semiconductor' | 'signal' | 'protection';

const TABS: { id: TabId; labelKey: string; count: number }[] = [
  { id:'all',          labelKey:'tab_all',        count:15 },
  { id:'passive',      labelKey:'tab_passive',     count:5  },
  { id:'active',       labelKey:'tab_active',      count:4  },
  { id:'semiconductor',labelKey:'tab_semi',        count:4  },
  { id:'signal',       labelKey:'tab_signal',      count:1  },
  { id:'protection',   labelKey:'tab_protection',  count:1  },
];

type CompEntry = { id:string; tab:Exclude<TabId,'all'>; node:React.ReactNode };

const ALL_COMPONENTS: CompEntry[] = [
  { id:'resistor',      tab:'passive',       node:<ResistorNode /> },
  { id:'capacitor',     tab:'passive',       node:<CapacitorNode /> },
  { id:'inductor',      tab:'passive',       node:<InductorNode /> },
  { id:'transformer',   tab:'passive',       node:<TransformerNode /> },
  { id:'potentiometer', tab:'passive',       node:<PotentiometerNode /> },
  { id:'transistor',    tab:'active',        node:<TransistorNode /> },
  { id:'opamp',         tab:'active',        node:<OpAmpNode /> },
  { id:'relay',         tab:'active',        node:<RelayNode /> },
  { id:'scr',           tab:'active',        node:<SCRNode /> },
  { id:'diode',         tab:'semiconductor', node:<DiodeNode /> },
  { id:'led',           tab:'semiconductor', node:<LEDNode /> },
  { id:'zener',         tab:'semiconductor', node:<ZenerNode /> },
  { id:'mosfet',        tab:'semiconductor', node:<MOSFETNode /> },
  { id:'crystal',       tab:'signal',        node:<CrystalNode /> },
  { id:'fuse',          tab:'protection',    node:<FuseNode /> },
];

export function ComponentsPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');

  const visible = ALL_COMPONENTS.filter(c =>
    (activeTab === 'all' || c.tab === activeTab) &&
    c.id.includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-7 overflow-y-auto scrollbar-none">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="text-center space-y-3">
        <GlassBadge color="green">{t('comp_badge')}</GlassBadge>
        <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white">
          Component{' '}
          <span className="neon-text-green">{t('comp_title').split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-white/40 text-sm font-body max-w-xl mx-auto">{t('comp_sub')}</p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-xs mx-auto">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search components..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 pl-9 text-sm text-white placeholder-white/25 outline-none focus:border-neon-green/40 font-mono transition-colors"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">🔍</span>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {TABS.map(tab => (
          <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider border transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-neon-green/15 border-neon-green/50 text-neon-green shadow-green-sm'
                : 'bg-white/[0.02] border-white/10 text-white/40 hover:text-white/70'
            }`}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}>
            {t(tab.labelKey as any)}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab===tab.id?'bg-neon-green/20 text-neon-green':'bg-white/[0.05] text-white/25'}`}>
              {tab.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {visible.map((comp, i) => (
            <motion.div key={comp.id} layout
              initial={{ opacity:0, scale:0.95, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95 }}
              transition={{ type:'spring', stiffness:300, damping:25, delay:i*0.04 }}>
              {comp.node}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-white/20 font-mono text-sm">
          No components found for "{search}"
        </div>
      )}
    </div>
  );
}

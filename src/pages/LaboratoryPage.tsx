import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel, GlassBadge } from '../components/ui/GlassPanel';
import { CurrentFlowVisualizer } from '../components/visualizers/CurrentFlowVisualizer';
import { useLang } from '../context/LanguageContext';

type Locked = 'voltage' | 'current' | 'resistance';

const PRESET_COMPONENTS = [
  { name:'LED',         name_id:'LED',            maxP:0.12,  r:68,    color:'gold'  },
  { name:'Resistor',    name_id:'Resistor',        maxP:0.25,  r:220,   color:'orange'},
  { name:'Motor (5V)', name_id:'Motor (5V)',       maxP:2.5,   r:10,    color:'cyan'  },
  { name:'IC Chip',    name_id:'IC Chip',          maxP:0.8,   r:500,   color:'green' },
  { name:'Custom',     name_id:'Kustom',           maxP:1.0,   r:100,   color:'purple'},
];

export function LaboratoryPage() {
  const { t, lang } = useLang();

  const [voltage, setVoltage]       = useState(5);
  const [resistance, setResistance] = useState(220);
  const [locked, setLocked]         = useState<Locked>('resistance');
  const [stressMode, setStressMode] = useState(false);
  const [burnt, setBurnt]           = useState(false);
  const [powerRating, setPowerRating] = useState(0.25);
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [history, setHistory]       = useState<{v:number;i:number;r:number;p:number}[]>([]);

  const current  = voltage / Math.max(resistance, 0.1);
  const power    = voltage * current;
  const pRatio   = power / powerRating;

  useEffect(() => {
    if (stressMode && pRatio >= 1 && !burnt) {
      const delay = Math.max(200, 2000 / (pRatio * pRatio));
      const t = setTimeout(() => setBurnt(true), delay);
      return () => clearTimeout(t);
    }
  }, [stressMode, pRatio, burnt]);

  const handleV = useCallback((v: number) => {
    if (burnt) return;
    setVoltage(v);
    if (history.length > 0) setHistory(h => [
      ...h.slice(-19),
      { v, i: v / Math.max(resistance, 0.1), r: resistance, p: v * v / Math.max(resistance, 0.1) }
    ]);
  }, [burnt, resistance, history]);

  const handleR = useCallback((r: number) => {
    if (burnt) return;
    setResistance(r);
  }, [burnt]);

  const applyPreset = (idx: number) => {
    const p = PRESET_COMPONENTS[idx];
    setSelectedPreset(idx);
    setResistance(p.r);
    setPowerRating(p.maxP);
    setBurnt(false);
    setHistory([]);
  };

  const resetBurn = () => {
    setBurnt(false);
    setVoltage(5);
    setHistory([]);
  };

  const measure = () => {
    setHistory(h => [...h.slice(-19), { v: voltage, i: current, r: resistance, p: power }]);
  };

  const colorForRatio = pRatio < 0.5 ? '#39ff14' : pRatio < 0.8 ? '#ffdd00' : pRatio < 1 ? '#ff6600' : '#ff2d55';

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-8 overflow-y-auto scrollbar-none">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="text-center space-y-3">
        <GlassBadge color="purple">{t('lab_badge')}</GlassBadge>
        <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white">
          {t('lab_title').split(' ')[0]}{' '}
          <span className="neon-text-purple">{t('lab_title').split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-white/40 text-sm font-body max-w-xl mx-auto">{t('lab_sub')}</p>
      </motion.div>

      {/* Burnt overlay */}
      <AnimatePresence>
        {burnt && (
          <motion.div
            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-lg flex items-center justify-center"
            onClick={resetBurn}
          >
            <GlassPanel className="text-center max-w-sm mx-4 burning" glow="orange">
              <div className="text-6xl mb-4">🔥</div>
              <h2 className="font-orbitron text-2xl text-neon-red font-bold mb-2">{t('burnout_warn')}</h2>
              <p className="text-white/50 text-sm font-body mb-5">{t('burnout_msg')}</p>
              <button className="btn-neon text-xs" onClick={resetBurn}>{t('reset_comp')}</button>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Component presets */}
          <GlassPanel>
            <p className="data-label mb-3">Select Component</p>
            <div className="space-y-1.5">
              {PRESET_COMPONENTS.map((p,i) => (
                <button key={i} onClick={() => applyPreset(i)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-left ${
                    selectedPreset===i ? `bg-neon-${p.color}/10 border-neon-${p.color}/40` : 'bg-white/[0.02] border-white/[0.05] hover:border-white/15'
                  }`}
                >
                  <span className="font-mono text-xs text-white/70">{lang==='id' ? p.name_id : p.name}</span>
                  <span className="font-mono text-[10px] text-white/30">{p.maxP}W · {p.r}Ω</span>
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* Custom power rating */}
          <GlassPanel>
            <p className="data-label mb-3">{t('watt_rating')}</p>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-white/40">Pmax</span>
              <span className="text-neon-orange">{powerRating.toFixed(2)} W</span>
            </div>
            <input type="range" min={0.05} max={10} step={0.05} value={powerRating}
              onChange={e => { setPowerRating(+e.target.value); setBurnt(false); }}
              className="w-full h-1 accent-neon-orange cursor-pointer" />
          </GlassPanel>

          {/* Stress mode toggle */}
          <GlassPanel className={`transition-all duration-500 ${stressMode ? 'border-neon-red/30 shadow-[0_0_20px_rgba(255,45,85,0.08)]' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-orbitron text-xs font-semibold text-white">
                  {stressMode ? t('stress_mode') : t('stress_off')}
                </p>
                <p className="font-mono text-[10px] text-white/30 mt-0.5">
                  {stressMode ? 'Component can burn out!' : 'Components are protected'}
                </p>
              </div>
              <button
                onClick={() => { setStressMode(s => !s); setBurnt(false); }}
                className={`w-12 h-6 rounded-full border-2 relative transition-all ${
                  stressMode ? 'bg-neon-red/30 border-neon-red/60' : 'bg-white/[0.05] border-white/20'
                }`}
              >
                <motion.div
                  className={`absolute top-0.5 w-4 h-4 rounded-full ${stressMode ? 'bg-neon-red' : 'bg-white/40'}`}
                  animate={{ left: stressMode ? '1.5rem' : '0.1rem' }}
                  transition={{ type:'spring', stiffness:400, damping:22 }}
                />
              </button>
            </div>
          </GlassPanel>

          {/* Measure button */}
          <button className="btn-neon-green w-full" onClick={measure}>
            📊 Record Measurement
          </button>
        </div>

        {/* Right — Visualizer + results */}
        <div className="lg:col-span-2 space-y-4">

          {/* Current flow */}
          <GlassPanel padding="sm">
            <CurrentFlowVisualizer
              voltage={voltage}
              resistance={resistance}
              showControls
              onVoltageChange={handleV}
              onResistanceChange={handleR}
            />
          </GlassPanel>

          {/* Live results */}
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <p className="font-orbitron text-xs font-semibold text-white tracking-wider">{t('results_panel')}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: colorForRatio }} />
                <span className="font-mono text-[10px]" style={{ color: colorForRatio }}>
                  {burnt ? t('component_burnt') : pRatio < 0.8 ? t('component_ok') : '⚠ HIGH LOAD'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:t('voltage'),    val:`${voltage.toFixed(2)} V`,       color:'neon-cyan'   },
                { label:t('current'),    val:`${(current*1000).toFixed(1)} mA`, color:'neon-green' },
                { label:t('resistance'), val:`${resistance} Ω`,               color:'neon-orange' },
                { label:t('power'),      val:`${power.toFixed(3)} W`,          color: pRatio >= 1 ? 'neon-red' : 'neon-purple' },
              ].map(item => (
                <div key={item.label} className="bg-dark-900/60 rounded-xl p-3">
                  <div className="data-label mb-1">{item.label}</div>
                  <motion.div key={item.val} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                    className={`font-orbitron text-xl font-bold text-${item.color}`}
                    style={{ textShadow: `0 0 15px var(--tw-shadow-color)` }}
                  >
                    {item.val}
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Power stress bar */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1.5">
                <span className="text-white/40">{t('power_label')} vs {t('watt_rating')}</span>
                <span style={{ color: colorForRatio }}>{(pRatio * 100).toFixed(0)}% of limit</span>
              </div>
              <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ width:`${Math.min(pRatio * 100, 100)}%`, background: colorForRatio, boxShadow:`0 0 10px ${colorForRatio}` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono mt-1 text-white/20">
                <span>0W</span>
                <span>{powerRating}W MAX</span>
              </div>
            </div>

            {/* Formulas */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-dark-900/40 rounded-lg p-2.5 text-center font-mono text-xs">
                <div className="text-white/30 text-[9px] mb-0.5">{t('ohm_law')}</div>
                <div className="text-neon-cyan">{voltage} = {(current).toFixed(3)} × {resistance}</div>
              </div>
              <div className="bg-dark-900/40 rounded-lg p-2.5 text-center font-mono text-xs">
                <div className="text-white/30 text-[9px] mb-0.5">{t('power_law')}</div>
                <div className="text-neon-green">{power.toFixed(3)} = {voltage} × {(current).toFixed(3)}</div>
              </div>
            </div>
          </GlassPanel>

          {/* Measurement history */}
          {history.length > 0 && (
            <GlassPanel>
              <p className="font-orbitron text-xs font-semibold text-white/60 mb-3 tracking-wider uppercase">Measurement Log</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-white/30 text-[9px] uppercase tracking-wider">
                      <th className="text-left pb-2">#</th>
                      <th className="text-left pb-2">V</th>
                      <th className="text-left pb-2">I (mA)</th>
                      <th className="text-left pb-2">R (Ω)</th>
                      <th className="text-left pb-2">P (W)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => (
                      <tr key={i} className="border-t border-white/[0.03] hover:bg-white/[0.01]">
                        <td className="py-1.5 text-white/20">{i+1}</td>
                        <td className="py-1.5 text-neon-cyan">{row.v.toFixed(1)}</td>
                        <td className="py-1.5 text-neon-green">{(row.i*1000).toFixed(1)}</td>
                        <td className="py-1.5 text-neon-orange">{row.r}</td>
                        <td className="py-1.5 text-neon-purple">{row.p.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}

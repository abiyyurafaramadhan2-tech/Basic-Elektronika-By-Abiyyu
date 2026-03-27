import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel, GlassBadge } from '../ui/GlassPanel';

interface BandDef {
  name: string;
  hex: string;
  value: number | null;
  multiplier: number | null;
  tolerance: string | null;
}

const BANDS: BandDef[] = [
  { name:'Black',  hex:'#111111', value:0, multiplier:1,        tolerance: null    },
  { name:'Brown',  hex:'#7B3F00', value:1, multiplier:10,       tolerance:'±1%'    },
  { name:'Red',    hex:'#CC1111', value:2, multiplier:100,      tolerance:'±2%'    },
  { name:'Orange', hex:'#FF8800', value:3, multiplier:1000,     tolerance: null    },
  { name:'Yellow', hex:'#FFDD00', value:4, multiplier:10000,    tolerance: null    },
  { name:'Green',  hex:'#22AA44', value:5, multiplier:100000,   tolerance:'±0.5%'  },
  { name:'Blue',   hex:'#1144CC', value:6, multiplier:1000000,  tolerance:'±0.25%' },
  { name:'Violet', hex:'#880088', value:7, multiplier:10000000, tolerance:'±0.1%'  },
  { name:'Gray',   hex:'#888888', value:8, multiplier: null,    tolerance:'±0.05%' },
  { name:'White',  hex:'#EEEEEE', value:9, multiplier: null,    tolerance: null    },
  { name:'Gold',   hex:'#D4A843', value:null, multiplier:0.1,   tolerance:'±5%'    },
  { name:'Silver', hex:'#C0C0C0', value:null, multiplier:0.01,  tolerance:'±10%'   },
];

const DIGIT_BANDS   = BANDS.filter(b => b.value !== null);
const MULT_BANDS    = BANDS.filter(b => b.multiplier !== null);
const TOL_BANDS     = BANDS.filter(b => b.tolerance !== null);

function formatResistance(ohms: number): string {
  if (ohms >= 1_000_000) return `${(ohms / 1_000_000).toFixed(ohms % 1_000_000 === 0 ? 0 : 2)} MΩ`;
  if (ohms >= 1_000)     return `${(ohms / 1_000).toFixed(ohms % 1_000 === 0 ? 0 : 2)} kΩ`;
  return `${ohms} Ω`;
}

export function ResistorNode() {
  const [band1, setBand1] = useState(3);  // Orange = 3
  const [band2, setBand2] = useState(3);  // Orange = 3
  const [multI, setMultI] = useState(2);  // Red = ×100 → 3.3kΩ
  const [tolI,  setTolI]  = useState(0);  // Gold = ±5%
  const [expanded, setExpanded] = useState(false);
  const [activeSelector, setActiveSelector] = useState<'b1'|'b2'|'mult'|'tol'|null>(null);

  const b1 = DIGIT_BANDS[band1];
  const b2 = DIGIT_BANDS[band2];
  const mult = MULT_BANDS[multI];
  const tol  = TOL_BANDS[tolI];

  const resistance = useMemo(() => {
    if (b1.value === null || b2.value === null || mult.multiplier === null) return 0;
    return (b1.value * 10 + b2.value) * mult.multiplier;
  }, [b1, b2, mult]);

  const bandColors = [b1.hex, b2.hex, mult.hex, tol.hex];

  // SVG Resistor Body
  const ResistorSVG = (
    <svg width="260" height="70" viewBox="0 0 260 70" className="mx-auto">
      {/* Left lead */}
      <line x1="0" y1="35" x2="45" y2="35" stroke="rgba(0,229,255,0.7)" strokeWidth="2" />
      {/* Right lead */}
      <line x1="215" y1="35" x2="260" y2="35" stroke="rgba(0,229,255,0.7)" strokeWidth="2" />
      {/* Body */}
      <rect x="45" y="18" width="170" height="34" rx="6" ry="6"
        fill="rgba(210,190,140,0.9)" stroke="rgba(180,160,110,0.8)" strokeWidth="1.5" />
      {/* Color bands */}
      {bandColors.map((color, i) => {
        const positions = [65, 100, 135, 170];
        return (
          <rect
            key={i}
            x={positions[i] - 8}
            y="14"
            width="16"
            height="42"
            rx="2"
            fill={color}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.5"
            className="cursor-pointer"
            onClick={() => setActiveSelector(['b1','b2','mult','tol'][i] as typeof activeSelector)}
          />
        );
      })}
      {/* Terminal labels */}
      <text x="4"   y="26" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">+</text>
      <text x="248" y="26" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">−</text>
    </svg>
  );

  const BandSelector = ({
    label,
    options,
    selectedIdx,
    onSelect,
    selectorId,
  }: {
    label: string;
    options: BandDef[];
    selectedIdx: number;
    onSelect: (i: number) => void;
    selectorId: 'b1'|'b2'|'mult'|'tol';
  }) => (
    <div className="flex flex-col gap-1.5">
      <button
        className="data-label hover:text-neon-cyan transition-colors text-left"
        onClick={() => setActiveSelector(activeSelector === selectorId ? null : selectorId)}
      >
        {label} ▾
      </button>
      <div
        className="w-8 h-8 rounded border border-white/20 cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: options[selectedIdx].hex }}
        onClick={() => setActiveSelector(activeSelector === selectorId ? null : selectorId)}
      />
      <AnimatePresence>
        {activeSelector === selectorId && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute z-20 mt-10 glass-card p-2 grid grid-cols-4 gap-1 w-48"
          >
            {options.map((opt, i) => (
              <button
                key={opt.name}
                className={`
                  w-8 h-8 rounded border transition-all
                  ${i === selectedIdx ? 'border-neon-cyan scale-110' : 'border-white/10 hover:border-white/40'}
                `}
                style={{ backgroundColor: opt.hex }}
                title={`${opt.name}${opt.value !== null ? ` (${opt.value})` : ''}${opt.multiplier !== null ? ` ×${opt.multiplier}` : ''}${opt.tolerance ?? ''}`}
                onClick={() => { onSelect(i); setActiveSelector(null); }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <GlassPanel
      hover
      glow="orange"
      className="cursor-pointer relative"
      onClick={() => { if (!activeSelector) setExpanded(e => !e); }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          <div>
            <h3 className="font-orbitron font-semibold text-white tracking-wide text-sm">Resistor</h3>
            <p className="text-xs text-white/40 font-mono">Color Band Decoder</p>
          </div>
        </div>
        <GlassBadge color="orange">Ω</GlassBadge>
      </div>

      {/* SVG Visualization */}
      <div className="bg-dark-900/60 rounded-xl p-3 mb-4">
        {ResistorSVG}
      </div>

      {/* Resistance display */}
      <div className="text-center mb-4">
        <motion.div
          key={resistance}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-mono text-3xl font-bold text-neon-orange"
          style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}
        >
          {formatResistance(resistance)}
        </motion.div>
        <div className="text-xs text-white/40 font-mono mt-1">{tol.tolerance} tolerance</div>
      </div>

      {/* Expand / Collapse */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="overflow-visible"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-t border-white/[0.06] pt-4 mt-2">
              <p className="text-xs text-white/40 font-mono mb-4">
                Click a band or a selector below to change its value.
              </p>
              <div className="grid grid-cols-4 gap-4 relative">
                <BandSelector label="Band 1"   options={DIGIT_BANDS} selectedIdx={band1} onSelect={setBand1} selectorId="b1"   />
                <BandSelector label="Band 2"   options={DIGIT_BANDS} selectedIdx={band2} onSelect={setBand2} selectorId="b2"   />
                <BandSelector label="Mult"     options={MULT_BANDS}  selectedIdx={multI} onSelect={setMultI} selectorId="mult" />
                <BandSelector label="Tol"      options={TOL_BANDS}   selectedIdx={tolI}  onSelect={setTolI}  selectorId="tol"  />
              </div>

              {/* Color code table */}
              <div className="mt-5 rounded-xl overflow-hidden border border-white/[0.05]">
                <div className="grid grid-cols-4 text-[9px] font-mono uppercase tracking-wider bg-white/[0.03] px-2 py-1.5 text-white/40">
                  <span>Color</span><span>Digit</span><span>Multiplier</span><span>Tolerance</span>
                </div>
                {BANDS.slice(0, 10).map(b => (
                  <div key={b.name} className="grid grid-cols-4 px-2 py-1.5 text-xs font-mono hover:bg-white/[0.02] items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: b.hex }} />
                      <span className="text-white/60">{b.name}</span>
                    </div>
                    <span className="text-white/50">{b.value ?? '—'}</span>
                    <span className="text-white/50">{b.multiplier !== null ? (b.multiplier >= 1000 ? `×${(b.multiplier/1000).toFixed(0)}k` : `×${b.multiplier}`) : '—'}</span>
                    <span className="text-white/50">{b.tolerance ?? '—'}</span>
                  </div>
                ))}
              </div>

              {/* Formula */}
              <div className="mt-4 bg-dark-900/50 rounded-lg px-4 py-3 font-mono text-sm text-center">
                <span className="text-white/40">R = (</span>
                <span className="font-bold" style={{ color: b1.hex !== '#111111' ? b1.hex : '#aaaaaa' }}>{b1.value}</span>
                <span className="text-white/40">×10 + </span>
                <span className="font-bold" style={{ color: b2.hex !== '#111111' ? b2.hex : '#aaaaaa' }}>{b2.value}</span>
                <span className="text-white/40">) × </span>
                <span className="font-bold" style={{ color: mult.hex }}>{mult.multiplier}</span>
                <span className="text-white/40"> = </span>
                <span className="text-neon-orange font-bold">{formatResistance(resistance)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand hint */}
      <div className="text-center mt-3">
        <motion.span
          className="text-[10px] font-mono text-white/20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {expanded ? '▲ Click to collapse' : '▼ Click to expand'}
        </motion.span>
      </div>
    </GlassPanel>
  );
}

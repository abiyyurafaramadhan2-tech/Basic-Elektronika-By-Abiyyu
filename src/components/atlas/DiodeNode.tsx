import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel, GlassBadge } from '../ui/GlassPanel';

type BiasType = 'forward' | 'reverse';

interface DiodeRegion {
  label: string;
  description: string;
  current: string;
  color: string;
}

export function DiodeNode() {
  const [bias, setBias] = useState<BiasType>('forward');
  const [voltage, setVoltage] = useState<number>(0.7); // number, fix TS2363
  const [expanded, setExpanded] = useState(false);

  const VT   = 0.026; // thermal voltage ~26mV at 300K
  const Is   = 1e-12; // saturation current
  const n    = 1;     // ideality factor
  const I    = Is * (Math.exp(voltage / (n * VT)) - 1);

  const displayI = bias === 'forward'
    ? (Number(voltage) >= 0.6
        ? `${(Math.min(I, 0.1) * 1000).toFixed(1)} mA`
        : `${(I * 1e9).toFixed(2)} nA`)
    : `${(Is * 1e12 * (1 - Math.exp(-Math.abs(Number(voltage)) / VT))).toFixed(4)} pA`;

  const isConductive = bias === 'forward' && Number(voltage) >= 0.6;
  const deplWidth    = bias === 'forward'
    ? Math.max(0.1, 1 - Number(voltage) / 1.2)
    : Math.min(1, 1 + Number(voltage) / 5);

  const region: DiodeRegion =
    bias === 'forward' && Number(voltage) >= 0.6
      ? { label: 'Forward Active',  description: 'Current flows freely. Depletion region collapses.', current: displayI, color: 'text-neon-green'  }
      : bias === 'forward'
      ? { label: 'Forward Biased',  description: 'Small voltage — not yet conducting. Barrier present.', current: displayI, color: 'text-neon-cyan'   }
      : { label: 'Reverse Biased',  description: 'Depletion widens. Only leakage current flows.',      current: displayI, color: 'text-neon-purple' };

  return (
    <GlassPanel hover glow="purple" className="cursor-pointer" onClick={() => setExpanded(e => !e)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-orbitron font-semibold text-white tracking-wide text-sm">Diode</h3>
            <p className="text-xs text-white/40 font-mono">PN Junction</p>
          </div>
        </div>
        <GlassBadge color="purple">V · I · f(V)</GlassBadge>
      </div>

      {/* PN Junction SVG */}
      <div className="bg-dark-900/60 rounded-xl p-3 mb-4 flex justify-center">
        <svg width="240" height="100" viewBox="0 0 240 100">
          {/* Anode lead */}
          <line x1="0" y1="50" x2="50" y2="50"
            stroke={isConductive ? '#39ff14' : 'rgba(0,229,255,0.6)'} strokeWidth="2" />
          {/* Cathode lead */}
          <line x1="190" y1="50" x2="240" y2="50"
            stroke={isConductive ? '#39ff14' : 'rgba(0,229,255,0.4)'} strokeWidth="2" />

          {/* P region */}
          <rect x="50" y="20" width="70" height="60" rx="4"
            fill={bias === 'forward' ? 'rgba(57,255,20,0.12)' : 'rgba(100,50,200,0.10)'}
            stroke={bias === 'forward' ? 'rgba(57,255,20,0.4)' : 'rgba(100,50,200,0.3)'}
            strokeWidth="1.5"
          />
          <text x="85" y="54" fill="rgba(57,255,20,0.7)" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">P</text>

          {/* N region */}
          <rect x="120" y="20" width="70" height="60" rx="4"
            fill={bias === 'forward' ? 'rgba(57,255,20,0.08)' : 'rgba(0,229,255,0.10)'}
            stroke={bias === 'forward' ? 'rgba(57,255,20,0.3)' : 'rgba(0,229,255,0.3)'}
            strokeWidth="1.5"
          />
          <text x="155" y="54" fill="rgba(0,229,255,0.7)" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

          {/* Depletion region */}
          <rect
            x={120 - deplWidth * 15}
            y="20"
            width={deplWidth * 30}
            height="60"
            fill={bias === 'forward' ? 'rgba(57,255,20,0.15)' : 'rgba(100,50,200,0.25)'}
          />

          {/* Junction line */}
          <line x1="120" y1="10" x2="120" y2="90"
            stroke={bias === 'forward' ? 'rgba(57,255,20,0.5)' : 'rgba(191,90,242,0.6)'}
            strokeWidth="1.5" strokeDasharray="4 3"
          />

          {/* Charge carriers — only in forward */}
          {isConductive && (
            <>
              {[30, 55, 65, 75].map((y, i) => (
                <motion.circle key={i} cx="90" cy={y} r="3"
                  fill="rgba(57,255,20,0.8)"
                  animate={{ cx: [90, 130, 160], opacity: [1, 0.5, 0] }}
                  transition={{ duration: 1, delay: i * 0.25, repeat: Infinity, ease: 'linear' }}
                />
              ))}
            </>
          )}

          {/* Diode symbol overlay */}
          <polygon points="50,40 50,60 70,50" fill="rgba(0,229,255,0.15)" stroke="rgba(0,229,255,0.5)" strokeWidth="1" />
          <line x1="70" y1="40" x2="70" y2="60" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" />

          {/* Labels */}
          <text x="20" y="20" fill="rgba(255,100,100,0.6)" fontSize="9" fontFamily="monospace">Anode</text>
          <text x="185" y="20" fill="rgba(0,200,255,0.6)" fontSize="9" fontFamily="monospace">Cathode</text>
        </svg>
      </div>

      {/* Bias toggle */}
      <div className="flex gap-2 mb-4" onClick={e => e.stopPropagation()}>
        {(['forward', 'reverse'] as BiasType[]).map(b => (
          <button
            key={b}
            className={`
              flex-1 py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider
              border transition-all duration-200
              ${bias === b
                ? b === 'forward'
                  ? 'bg-neon-green/15 border-neon-green/50 text-neon-green shadow-green-sm'
                  : 'bg-neon-purple/15 border-neon-purple/50 text-neon-purple shadow-purple-md'
                : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white/70'
              }
            `}
            onClick={() => setBias(b)}
          >
            {b} Bias
          </button>
        ))}
      </div>

      {/* Region status */}
      <div className="flex items-center justify-between text-sm mb-3">
        <GlassBadge color={isConductive ? 'green' : bias === 'reverse' ? 'purple' : 'cyan'}>
          {region.label}
        </GlassBadge>
        <span className={`font-mono text-sm font-bold ${region.color}`}>{displayI}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-t border-white/[0.06] pt-4 mt-2 space-y-4">
              {/* Voltage slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="data-label">{bias === 'forward' ? 'Forward' : 'Reverse'} Voltage</span>
                  <span className="data-value">{voltage.toFixed(2)} V</span>
                </div>
                <input type="range" min={0} max={bias === 'forward' ? 1.2 : 5} step={0.05}
                  value={voltage}
                  onChange={e => setVoltage(Number(e.target.value))}
                  className={`w-full h-1 cursor-pointer ${bias === 'forward' ? 'accent-neon-green' : 'accent-neon-purple'}`}
                />
              </div>

              <p className="text-xs text-white/40 font-body leading-relaxed">{region.description}</p>

              {/* Shockley equation */}
              <div className="bg-dark-900/50 rounded-lg p-3 font-mono text-xs text-center space-y-1">
                <div className="text-white/40">Shockley Diode Equation:</div>
                <div className="text-neon-cyan/80">I = Is(e^(V/nVT) − 1)</div>
                <div className="text-white/30 text-[10px]">Is={Is.toExponential(0)} · n={n} · VT=26mV</div>
              </div>

              {/* I-V Curve (simplified) */}
              <div>
                <p className="data-label mb-2">I–V Characteristic</p>
                <svg width="100%" height="90" viewBox="0 0 200 90">
                  <line x1="0" y1="75" x2="200" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="80" y1="5" x2="80" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <path
                    d="M 0 75 L 75 75 Q 78 75 80 73 Q 82 70 84 68 Q 90 60 100 40 Q 110 20 120 5"
                    fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="2"
                  />
                  <path
                    d="M 80 75 L 10 77"
                    fill="none" stroke="rgba(191,90,242,0.6)" strokeWidth="1.5" strokeDasharray="3 2"
                  />
                  <text x="170" y="72" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">V</text>
                  <text x="82" y="14" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">I</text>
                  <text x="83" y="82" fill="rgba(0,229,255,0.5)" fontSize="7" fontFamily="monospace">0.6V</text>
                </svg>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mt-3">
        <span className="text-[10px] font-mono text-white/20">
          {expanded ? '▲ Collapse' : '▼ Expand PN Junction'}
        </span>
      </div>
    </GlassPanel>
  );
                   }

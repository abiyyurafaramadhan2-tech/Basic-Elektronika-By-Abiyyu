import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel, GlassBadge } from '../ui/GlassPanel';

export function CapacitorNode() {
  const [voltage, setVoltage]       = useState(5);
  const [capacitance, setCapacitance] = useState(100); // µF
  const [isCharging, setIsCharging] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0);   // 0-1
  const [expanded, setExpanded]     = useState(false);
  const [breakdown, setBreakdown]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BREAKDOWN_V = 25; // max voltage before breakdown
  const timeConst = capacitance * 10 / 1000; // τ in seconds (simplified)

  const startCharge = () => {
    if (voltage > BREAKDOWN_V) {
      setBreakdown(true);
      setTimeout(() => setBreakdown(false), 2000);
      return;
    }
    setIsCharging(true);
    setChargeLevel(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    let t = 0;
    intervalRef.current = setInterval(() => {
      t += 0.05;
      const level = 1 - Math.exp(-t / Math.max(timeConst, 0.1));
      setChargeLevel(Math.min(level, 1));
      if (level >= 0.99) {
        setIsCharging(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 50);
  };

  const discharge = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsCharging(false);
    let level = chargeLevel;
    intervalRef.current = setInterval(() => {
      level = Math.max(0, level - 0.08);
      setChargeLevel(level);
      if (level <= 0.01) {
        setChargeLevel(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 50);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const storedEnergy = 0.5 * (capacitance / 1_000_000) * Math.pow(voltage * chargeLevel, 2);
  const fieldStrength = voltage * chargeLevel / 0.001; // E = V/d (d=1mm)
  const plateColor   = `rgba(0, ${Math.floor(200 + chargeLevel * 55)}, 255, ${0.4 + chargeLevel * 0.5})`;
  const fieldOpacity = chargeLevel * 0.8;

  return (
    <GlassPanel hover glow="cyan" className="cursor-pointer" onClick={() => setExpanded(e => !e)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="font-orbitron font-semibold text-white tracking-wide text-sm">Capacitor</h3>
            <p className="text-xs text-white/40 font-mono">Charge Storage</p>
          </div>
        </div>
        <GlassBadge color="cyan">F / µF</GlassBadge>
      </div>

      {/* Capacitor SVG diagram */}
      <div className="bg-dark-900/60 rounded-xl p-4 mb-4 flex justify-center">
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* Left lead */}
          <line x1="0" y1="55" x2="80" y2="55" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          {/* Right lead */}
          <line x1="120" y1="55" x2="200" y2="55" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />

          {/* Left plate */}
          <rect x="76" y="15" width="8" height="80" rx="2"
            fill={plateColor}
            stroke={`rgba(0,229,255,${0.5 + chargeLevel * 0.5})`}
            strokeWidth="1.5"
          />
          {/* Right plate */}
          <rect x="116" y="15" width="8" height="80" rx="2"
            fill={plateColor}
            stroke={`rgba(0,229,255,${0.5 + chargeLevel * 0.5})`}
            strokeWidth="1.5"
          />

          {/* Electric field lines (only when charged) */}
          {chargeLevel > 0.1 && [30, 45, 55, 65, 80].map((y, i) => (
            <g key={i} opacity={fieldOpacity * (0.5 + i * 0.08)}>
              <line
                x1="84" y1={y}
                x2="116" y2={y}
                stroke="rgba(0,229,255,0.35)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Arrow head */}
              <polygon
                points={`114,${y-3} 116,${y} 114,${y+3}`}
                fill="rgba(0,229,255,0.5)"
              />
            </g>
          ))}

          {/* Charge accumulation indicators */}
          {chargeLevel > 0.05 && (
            <>
              {[25, 40, 55, 70, 85].map((y, i) => (
                <text key={i} x="70" y={y + 4} fontSize="10" fill="rgba(0,229,255,0.6)" textAnchor="middle"
                  opacity={chargeLevel * 0.9}>
                  −
                </text>
              ))}
              {[25, 40, 55, 70, 85].map((y, i) => (
                <text key={i} x="130" y={y + 4} fontSize="10" fill="rgba(255,100,100,0.7)" textAnchor="middle"
                  opacity={chargeLevel * 0.9}>
                  +
                </text>
              ))}
            </>
          )}

          {/* Voltage label */}
          <text x="100" y="108" fontSize="9" fill="rgba(0,229,255,0.5)" textAnchor="middle" fontFamily="monospace">
            V = {(voltage * chargeLevel).toFixed(1)} V
          </text>

          {/* Breakdown spark */}
          {breakdown && (
            <g>
              <path d="M 84 55 L 90 45 L 88 55 L 100 40 L 96 55 L 116 55"
                stroke="#ff2d55" strokeWidth="2" fill="none"
                opacity={Math.random() > 0.5 ? 1 : 0.3}
              />
              <circle cx="100" cy="55" r="8" fill="rgba(255,45,85,0.3)" />
            </g>
          )}
        </svg>
      </div>

      {/* Charge level bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="data-label">Charge Level</span>
          <span className="data-value">{(chargeLevel * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${chargeLevel * 100}%`,
              background: `linear-gradient(90deg, rgba(0,229,255,0.8), rgba(57,255,20,0.9))`,
              boxShadow: `0 0 8px rgba(0,229,255,${chargeLevel * 0.6})`,
            }}
          />
        </div>
      </div>

      {/* Charge/Discharge buttons */}
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button
          className="btn-neon flex-1 text-xs py-2"
          onClick={startCharge}
          disabled={isCharging}
        >
          {isCharging ? '⚡ Charging...' : '⚡ Charge'}
        </button>
        <button
          className="btn-neon-green flex-1 text-xs py-2"
          onClick={discharge}
          disabled={chargeLevel < 0.01}
        >
          ↓ Discharge
        </button>
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
            <div className="border-t border-white/[0.06] pt-4 mt-4 space-y-4">
              {/* Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="data-label">Voltage (V)</span>
                  <span className="data-value">{voltage} V</span>
                  <input type="range" min={1} max={50} step={1} value={voltage}
                    onChange={e => setVoltage(Number(e.target.value))}
                    className="accent-neon-cyan w-full h-1 cursor-pointer"
                  />
                  {voltage > BREAKDOWN_V && (
                    <span className="text-[10px] text-neon-red font-mono">⚠ Exceeds rating!</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="data-label">Capacitance (µF)</span>
                  <span className="data-value">{capacitance} µF</span>
                  <input type="range" min={1} max={1000} step={10} value={capacitance}
                    onChange={e => setCapacitance(Number(e.target.value))}
                    className="accent-neon-green w-full h-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* Derived values */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Energy',   value: `${(storedEnergy * 1e6).toFixed(2)} µJ`, color: 'text-neon-cyan'   },
                  { label: 'E-Field',  value: `${(fieldStrength).toFixed(0)} V/m`,     color: 'text-neon-purple' },
                  { label: 'τ (RC)',   value: `${(timeConst * 1000).toFixed(0)} ms`,    color: 'text-neon-green'  },
                ].map(item => (
                  <div key={item.label} className="bg-dark-900/50 rounded-lg p-2 text-center">
                    <div className="text-[9px] text-white/40 font-mono uppercase">{item.label}</div>
                    <div className={`text-sm font-mono font-semibold mt-0.5 ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Key formula */}
              <div className="bg-dark-900/50 rounded-lg p-3 font-mono text-xs text-center space-y-1.5">
                <div className="text-white/60">Q = CV &nbsp;|&nbsp; E = ½CV² &nbsp;|&nbsp; τ = RC</div>
                <div className="text-neon-cyan/70">Q = {(capacitance/1_000_000 * voltage * chargeLevel * 1000).toFixed(3)} mC</div>
              </div>

              <p className="text-xs text-white/40 font-body leading-relaxed">
                A capacitor stores energy in an electric field between two conductive plates separated by a
                dielectric. Charging follows Q = CV(1−e^(−t/RC)). Exceeding the breakdown voltage causes
                dielectric failure — the spark you see above.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mt-3">
        <span className="text-[10px] font-mono text-white/20">
          {expanded ? '▲ Collapse' : '▼ Expand details'}
        </span>
      </div>
    </GlassPanel>
  );
}

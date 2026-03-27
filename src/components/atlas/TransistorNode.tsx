import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel, GlassBadge } from '../ui/GlassPanel';

type Region = 'cutoff' | 'active' | 'saturation';

const REGIONS: Record<Region, { label: string; color: string; glowColor: string; description: string; condition: string }> = {
  cutoff:     { label:'Cut-off',    color:'text-neon-red',    glowColor:'rgba(255,45,85,0.5)',   description:'Both junctions reverse biased. No current. Transistor is OFF.', condition:'IB ≈ 0 → IC ≈ 0' },
  active:     { label:'Active',     color:'text-neon-cyan',   glowColor:'rgba(0,229,255,0.5)',   description:'Base-emitter forward biased. Collector-base reverse. Amplification mode.', condition:'IC = β × IB' },
  saturation: { label:'Saturation', color:'text-neon-green',  glowColor:'rgba(57,255,20,0.5)',   description:'Both junctions forward biased. Transistor fully ON. VCE ≈ 0.2V.', condition:'IC(sat) = VCC/RC' },
};

export function TransistorNode() {
  const [baseCurrent, setBaseCurrent] = useState(50);  // µA
  const [VCC, setVCC] = useState(9);
  const [RC, setRC]   = useState(1000);
  const [expanded, setExpanded] = useState(false);

  const beta     = 100;
  const IC       = Math.min((baseCurrent / 1e6) * beta, VCC / RC);
  const ICsat    = VCC / RC;
  const VCE      = Math.max(0.2, VCC - IC * RC);
  const IB_µA    = baseCurrent;

  const region: Region =
    IB_µA < 5       ? 'cutoff' :
    IC >= ICsat * 0.95 ? 'saturation' :
    'active';

  const reg    = REGIONS[region];
  const flowOpacity = region === 'cutoff' ? 0 : region === 'saturation' ? 1 : Math.min(1, IB_µA / 200);

  // NPN BJT SVG
  const BJT_SVG = (
    <svg width="220" height="130" viewBox="0 0 220 130">
      {/* Base lead */}
      <line x1="0" y1="65" x2="70" y2="65"
        stroke={IB_µA > 5 ? 'rgba(0,229,255,0.8)' : 'rgba(0,229,255,0.3)'} strokeWidth="2" />
      {/* Base label */}
      <text x="6" y="58" fill="rgba(0,229,255,0.6)" fontSize="10" fontFamily="monospace">B</text>

      {/* Base bar */}
      <rect x="68" y="30" width="6" height="70" rx="2"
        fill="rgba(0,229,255,0.3)"
        stroke="rgba(0,229,255,0.6)" strokeWidth="1.5" />

      {/* Emitter region (lower) */}
      <line x1="74" y1="80" x2="104" y2="100" stroke="rgba(57,255,20,0.7)" strokeWidth="3" />
      {/* Emitter arrow head */}
      <polygon
        points="100,96 108,102 102,108"
        fill="rgba(57,255,20,0.8)"
      />
      {/* Emitter lead */}
      <line x1="104" y1="100" x2="220" y2="100"
        stroke={region !== 'cutoff' ? 'rgba(57,255,20,0.7)' : 'rgba(57,255,20,0.2)'} strokeWidth="2" />
      <text x="195" y="115" fill="rgba(57,255,20,0.6)" fontSize="10" fontFamily="monospace">E</text>

      {/* Collector region (upper) */}
      <line x1="74" y1="50" x2="104" y2="30" stroke="rgba(255,107,53,0.7)" strokeWidth="3" />
      {/* Collector lead */}
      <line x1="104" y1="30" x2="220" y2="30"
        stroke={region === 'saturation' ? 'rgba(255,107,53,0.9)' : region === 'active' ? 'rgba(255,107,53,0.6)' : 'rgba(255,107,53,0.15)'}
        strokeWidth="2" />
      <text x="195" y="22" fill="rgba(255,107,53,0.7)" fontSize="10" fontFamily="monospace">C</text>

      {/* Current flow animations */}
      {region !== 'cutoff' && (
        <>
          {/* Base current (IB) — small */}
          <motion.circle cx="20" cy="65" r="3"
            fill="rgba(0,229,255,0.9)"
            animate={{ cx: [20, 65], opacity: [1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: 0 }}
          />
          {/* Collector current (IC) — larger */}
          {[0, 0.33, 0.66].map((delay, i) => (
            <motion.circle key={i} cx="220" cy="30" r={2.5 + flowOpacity * 1.5}
              fill="rgba(255,107,53,0.8)"
              animate={{ cx: [210, 120, 80], cy: [30, 30, 65], opacity: [1, 0.7, 0.3] }}
              transition={{ duration: 0.8 + flowOpacity * 0.4, repeat: Infinity, ease: 'linear', delay: delay * 0.8 }}
            />
          ))}
        </>
      )}

      {/* Region indicator */}
      <circle cx="71" cy="65" r="26" fill="none"
        stroke={reg.glowColor.replace('0.5', '0.2')} strokeWidth="1" strokeDasharray="4 3"
      />
    </svg>
  );

  return (
    <GlassPanel hover glow="orange" className="cursor-pointer" onClick={() => setExpanded(e => !e)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔌</span>
          <div>
            <h3 className="font-orbitron font-semibold text-white tracking-wide text-sm">Transistor</h3>
            <p className="text-xs text-white/40 font-mono">NPN BJT — β={beta}</p>
          </div>
        </div>
        <GlassBadge color="orange">BJT</GlassBadge>
      </div>

      {/* Diagram */}
      <div className="bg-dark-900/60 rounded-xl p-3 mb-4 flex justify-center overflow-hidden">
        {BJT_SVG}
      </div>

      {/* Operating region */}
      <motion.div
        key={region}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          text-center py-2.5 rounded-xl mb-3 border
          ${region === 'cutoff'     ? 'bg-neon-red/10 border-neon-red/30'     : ''}
          ${region === 'active'     ? 'bg-neon-cyan/10 border-neon-cyan/30'   : ''}
          ${region === 'saturation' ? 'bg-neon-green/10 border-neon-green/30' : ''}
        `}
      >
        <div className={`font-orbitron text-sm font-semibold tracking-wider ${reg.color}`} style={{ textShadow: `0 0 10px ${reg.glowColor}` }}>
          {reg.label.toUpperCase()}
        </div>
        <div className="font-mono text-[10px] text-white/40 mt-0.5">{reg.condition}</div>
      </motion.div>

      {/* Key values */}
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        {[
          { label:'IB', value:`${IB_µA} µA`, color:'text-neon-cyan'   },
          { label:'IC', value:`${(IC * 1000).toFixed(1)} mA`, color:'text-neon-orange' },
          { label:'VCE', value:`${VCE.toFixed(2)} V`, color:'text-neon-green'  },
        ].map(item => (
          <div key={item.label} className="bg-dark-900/50 rounded-lg py-1.5">
            <div className="data-label text-[9px]">{item.label}</div>
            <div className={`font-mono text-xs font-semibold ${item.color}`}>{item.value}</div>
          </div>
        ))}
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
              <p className="text-xs text-white/50 font-body leading-relaxed">
                {reg.description}
              </p>

              {/* Controls */}
              {[
                { label:'Base Current IB (µA)', min:0, max:200, step:5, value:baseCurrent, setter:setBaseCurrent, color:'accent-neon-cyan' },
                { label:'Supply VCC (V)',        min:1, max:15,  step:0.5, value:VCC,       setter:setVCC,         color:'accent-neon-orange' },
                { label:'Collector R (Ω)',       min:100, max:10000, step:100, value:RC,     setter:setRC,          color:'accent-neon-green' },
              ].map(ctrl => (
                <div key={ctrl.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="data-label text-[9px]">{ctrl.label}</span>
                    <span className={`font-mono text-xs font-semibold text-neon-cyan`}>{ctrl.value}</span>
                  </div>
                  <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step}
                    value={ctrl.value}
                    onChange={e => ctrl.setter(Number(e.target.value))}
                    className={`w-full h-1 cursor-pointer ${ctrl.color}`}
                  />
                </div>
              ))}

              {/* Load line visualization */}
              <div>
                <p className="data-label mb-2 text-[9px]">Output Characteristics (IC vs VCE)</p>
                <svg width="100%" height="80" viewBox="0 0 200 80">
                  <line x1="10" y1="70" x2="190" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="10" y1="5"  x2="10"  y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  {/* Operating curves */}
                  {[20, 50, 100, 150, 200].map((ib, i) => (
                    <path key={ib}
                      d={`M 10 ${70 - Math.min(ib * beta / 1e6 * RC * 6, 60)} L 180 ${70 - Math.min(ib * beta / 1e6 * RC * 5.5, 60)}`}
                      stroke={`rgba(0,229,255,${0.2 + i * 0.15})`} strokeWidth="1" fill="none"
                    />
                  ))}
                  {/* Load line */}
                  <line x1="10" y1="10" x2="170" y2="68" stroke="rgba(255,107,53,0.6)" strokeWidth="1.5" strokeDasharray="4 3" />
                  {/* Q-point */}
                  <circle cx={10 + VCE * 10} cy={70 - Math.min(IC * 1000 * 3, 60)} r="4"
                    fill={reg.glowColor.replace('0.5','0.9')} stroke="#fff" strokeWidth="1" />
                  <text x="175" y="78" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">VCE</text>
                  <text x="12" y="12" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">IC</text>
                </svg>
              </div>

              <div className="bg-dark-900/50 rounded-lg p-3 font-mono text-xs text-center">
                <div className="text-white/40">β = IC/IB = {beta}</div>
                <div className="text-neon-cyan/70 mt-1">IC = {(IC * 1000).toFixed(2)} mA = {beta} × {IB_µA} µA</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mt-3">
        <span className="text-[10px] font-mono text-white/20">
          {expanded ? '▲ Collapse' : '▼ Expand BJT Analysis'}
        </span>
      </div>
    </GlassPanel>
  );
}

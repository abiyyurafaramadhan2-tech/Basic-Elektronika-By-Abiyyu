import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentWrapper } from './ComponentWrapper';
import { COMPONENT_METAS } from '../../data/componentsMeta';
import { GlassPanel, GlassBadge } from '../ui/GlassPanel';
import { useLang } from '../../context/LanguageContext';

/* ─── LED ───────────────────────────────────────────────────────── */
export function LEDNode() {
  const meta = COMPONENT_METAS.led;
  const [wavelength, setWavelength] = useState(630); // nm
  const [current, setCurrent] = useState(20); // mA
  const MAX_MA = 30;

  const getLEDColor = (nm: number) => {
    if (nm < 430) return { hex:'#9900cc', name:'Violet', vf:3.5, material:'GaN' };
    if (nm < 470) return { hex:'#3333ff', name:'Blue',   vf:3.3, material:'InGaN' };
    if (nm < 520) return { hex:'#00aaff', name:'Cyan',   vf:3.0, material:'InGaN' };
    if (nm < 570) return { hex:'#00ff44', name:'Green',  vf:2.1, material:'GaP' };
    if (nm < 600) return { hex:'#ffdd00', name:'Yellow', vf:2.0, material:'GaAsP' };
    if (nm < 640) return { hex:'#ff6600', name:'Orange', vf:1.9, material:'GaAsP' };
    return { hex:'#ff2200', name:'Red', vf:1.8, material:'GaAlAs' };
  };

  const led = getLEDColor(wavelength);
  const brightness = Math.min(1, current / MAX_MA);
  const isBurnt = current > MAX_MA;

  return (
    <ComponentWrapper meta={meta}>
      {/* SVG LED */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-center">
          <svg width="180" height="110" viewBox="0 0 180 110">
            {/* Anode lead */}
            <line x1="0" y1="55" x2="50" y2="55" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
            {/* Cathode lead */}
            <line x1="130" y1="55" x2="180" y2="55" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
            {/* Triangle body */}
            <polygon points="50,30 50,80 100,55" fill={`${led.hex}55`} stroke={led.hex} strokeWidth="2" />
            {/* Vertical bar (cathode) */}
            <line x1="100" y1="30" x2="100" y2="80" stroke={led.hex} strokeWidth="3" />
            {/* Connect to right lead */}
            <line x1="100" y1="55" x2="130" y2="55" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
            {/* Light rays */}
            {brightness > 0.1 && [0,1,2].map(i => (
              <motion.line key={i}
                x1={110 + i*8} y1={35 - i*4}
                x2={125 + i*8} y2={20 - i*4}
                stroke={led.hex} strokeWidth="1.5"
                initial={{ opacity:0 }} animate={{ opacity: brightness * 0.9 }}
                transition={{ duration:0.5 }}
              />
            ))}
            {/* Glow */}
            {brightness > 0.3 && (
              <motion.circle cx="75" cy="55" r={30 * brightness} fill={led.hex}
                animate={{ opacity:[0.2, 0.35, 0.2] }}
                transition={{ duration:1.5, repeat:Infinity }}
                style={{ mixBlendMode:'screen', filter:`blur(${8*brightness}px)` }}
              />
            )}
            {/* Labels */}
            <text x="4" y="24" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">A</text>
            <text x="164" y="24" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">K</text>
            <text x="65" y="98" fill={led.hex} fontSize="9" fontFamily="monospace" textAnchor="middle">{wavelength}nm</text>
          </svg>
        </div>

        {/* Info chips */}
        <div className="flex gap-2 justify-center flex-wrap">
          <GlassBadge color="gold">{led.name}</GlassBadge>
          <GlassBadge color="cyan">Vf = {led.vf}V</GlassBadge>
          <GlassBadge color="green">{led.material}</GlassBadge>
        </div>

        {/* Sliders */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1.5 text-xs font-mono">
              <span className="text-white/40">Wavelength</span>
              <span className="text-neon-gold font-semibold">{wavelength} nm</span>
            </div>
            <input type="range" min={380} max={700} step={5}
              value={wavelength} onChange={e => setWavelength(+e.target.value)}
              className="w-full h-1.5 cursor-pointer rounded-full"
              style={{ accentColor: led.hex }}
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5 text-xs font-mono">
              <span className="text-white/40">Current (mA)</span>
              <span className={isBurnt ? 'text-neon-red' : 'text-neon-green'}>
                {current} mA {isBurnt ? '🔥 OVERLOAD' : ''}
              </span>
            </div>
            <input type="range" min={0} max={40} step={1}
              value={current} onChange={e => setCurrent(+e.target.value)}
              className="w-full h-1.5 cursor-pointer"
              style={{ accentColor: isBurnt ? '#ff2d55' : '#39ff14' }}
            />
          </div>
        </div>
      </div>
    </ComponentWrapper>
  );
}

/* ─── INDUCTOR ──────────────────────────────────────────────────── */
export function InductorNode() {
  const meta = COMPONENT_METAS.inductor;
  const [inductance, setInductance] = useState(10); // mH
  const [resistance, setResistance] = useState(100);
  const [isOn, setIsOn] = useState(false);
  const [current, setCurrent] = useState(0);
  const animRef = useRef<number>(0);
  const stateRef = useRef({ isOn: false, current: 0, inductance: 10, resistance: 100 });
  stateRef.current = { isOn, current, inductance, resistance };

  useEffect(() => {
    const V = 9, dt = 0.016;
    const tick = () => {
      const { isOn: on, inductance: L, resistance: R } = stateRef.current;
      const tau = (L / 1000) / R;
      const Imax = V / R;
      setCurrent(prev => {
        let next = on
          ? prev + (Imax - prev) * (1 - Math.exp(-dt / Math.max(tau, 0.001)))
          : prev * Math.exp(-dt / Math.max(tau * 0.5, 0.001));
        return Math.max(0, Math.min(next, Imax));
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const V = 9;
  const tau = (inductance / 1000) / resistance;
  const normalizedI = current / (V / resistance);

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-4">
        {/* SVG coil */}
        <svg width="100%" height="80" viewBox="0 0 260 80" className="block">
          <line x1="0" y1="40" x2="40" y2="40" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <line x1="220" y1="40" x2="260" y2="40" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          {[0,1,2,3,4].map(i => (
            <path key={i}
              d={`M ${40 + i*36} 40 Q ${58+i*36} 20 ${76+i*36} 40 Q ${58+i*36} 60 ${40+i*36} 40`}
              fill="none"
              stroke={isOn ? `rgba(0,229,255,${0.5+normalizedI*0.5})` : 'rgba(0,229,255,0.3)'}
              strokeWidth="2.5"
            />
          ))}
          {/* Magnetic field lines when current flows */}
          {normalizedI > 0.1 && [-18,-10,0,10,18].map((dy,i) => (
            <ellipse key={i}
              cx="130" cy={40 + dy}
              rx={20 + normalizedI * 30} ry="5"
              fill="none"
              stroke={`rgba(0,229,255,${0.1 + normalizedI * 0.2})`}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}
        </svg>

        {/* Current bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-white/40">Current</span>
            <span className="text-neon-cyan">{(current * 1000).toFixed(1)} mA</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-neon-cyan"
              style={{ width: `${normalizedI * 100}%`, boxShadow:'0 0 6px rgba(0,229,255,0.5)' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-dark-900/50 rounded-lg p-2 text-center">
            <div className="text-white/40">τ = L/R</div>
            <div className="text-neon-cyan font-bold">{(tau * 1000).toFixed(1)} ms</div>
          </div>
          <div className="bg-dark-900/50 rounded-lg p-2 text-center">
            <div className="text-white/40">Energy</div>
            <div className="text-neon-green font-bold">{(0.5 * (inductance/1000) * current * current * 1e6).toFixed(1)} µJ</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white/40">L (mH): {inductance}</span>
            <input type="range" min={1} max={100} step={1} value={inductance}
              onChange={e => setInductance(+e.target.value)}
              className="w-full h-1 accent-neon-cyan cursor-pointer" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white/40">R (Ω): {resistance}</span>
            <input type="range" min={10} max={1000} step={10} value={resistance}
              onChange={e => setResistance(+e.target.value)}
              className="w-full h-1 accent-neon-green cursor-pointer" />
          </div>
        </div>

        <button
          onClick={() => setIsOn(o => !o)}
          className={`w-full py-2.5 rounded-xl font-mono text-xs font-semibold border transition-all ${isOn ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan' : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80'}`}
        >
          {isOn ? '⚡ Switch OFF (watch back-EMF)' : '⚡ Switch ON'}
        </button>
      </div>
    </ComponentWrapper>
  );
}

/* ─── TRANSFORMER ───────────────────────────────────────────────── */
export function TransformerNode() {
  const meta = COMPONENT_METAS.transformer;
  const [n1, setN1] = useState(100);
  const [n2, setN2] = useState(10);
  const [vin, setVin] = useState(220);

  const vout = vin * (n2 / n1);
  const ratio = n2 / n1;
  const isStepDown = ratio < 1;
  const iin = 0.5;
  const iout = iin * (n1 / n2);

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-4">
        <svg width="100%" height="100" viewBox="0 0 280 100">
          {/* Primary coil */}
          {[0,1,2,3].map(i => (
            <path key={i} d={`M ${15+i*18} 50 Q ${24+i*18} 30 ${33+i*18} 50 Q ${24+i*18} 70 ${15+i*18} 50`}
              fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="2.5" />
          ))}
          {/* Core */}
          <rect x="88" y="20" width="8" height="60" rx="2" fill="rgba(180,100,40,0.5)" stroke="rgba(180,100,40,0.7)" strokeWidth="1.5" />
          <rect x="100" y="20" width="8" height="60" rx="2" fill="rgba(180,100,40,0.5)" stroke="rgba(180,100,40,0.7)" strokeWidth="1.5" />
          {/* Secondary coil */}
          {[0,1,2,3].map(i => (
            <path key={i} d={`M ${120+i*20} 50 Q ${130+i*20} 30 ${140+i*20} 50 Q ${130+i*20} 70 ${120+i*20} 50`}
              fill="none" stroke={isStepDown ? 'rgba(255,107,53,0.7)' : 'rgba(57,255,20,0.7)'} strokeWidth="2.5" />
          ))}
          {/* Leads */}
          <line x1="0" y1="38" x2="15" y2="38" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <line x1="0" y1="62" x2="15" y2="62" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <line x1="200" y1="38" x2="280" y2="38" stroke={isStepDown ? 'rgba(255,107,53,0.6)' : 'rgba(57,255,20,0.6)'} strokeWidth="2" />
          <line x1="200" y1="62" x2="280" y2="62" stroke={isStepDown ? 'rgba(255,107,53,0.6)' : 'rgba(57,255,20,0.6)'} strokeWidth="2" />
          {/* Labels */}
          <text x="45" y="18" fill="rgba(0,229,255,0.6)" fontSize="10" fontFamily="monospace" textAnchor="middle">N1={n1}</text>
          <text x="158" y="18" fill={isStepDown ? 'rgba(255,107,53,0.6)' : 'rgba(57,255,20,0.6)'} fontSize="10" fontFamily="monospace" textAnchor="middle">N2={n2}</text>
          <text x="5" y="34" fill="rgba(0,229,255,0.5)" fontSize="8" fontFamily="monospace">{vin}V</text>
          <text x="218" y="34" fill={isStepDown ? 'rgba(255,107,53,0.5)' : 'rgba(57,255,20,0.5)'} fontSize="8" fontFamily="monospace">{vout.toFixed(1)}V</text>
          <text x="140" y="96" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace" textAnchor="middle">
            {isStepDown ? 'STEP-DOWN' : 'STEP-UP'}
          </text>
        </svg>

        <div className="grid grid-cols-2 gap-3">
          {[['Vout',`${vout.toFixed(1)} V`,'cyan'],['Iout',`${iout.toFixed(2)} A`,'orange'],
            ['Pin',`${(vin*iin).toFixed(0)} W`,'green'],['Pout',`${(vout*iout).toFixed(0)} W`,'green']].map(([l,v,c]) => (
            <div key={l} className="bg-dark-900/50 rounded-lg p-2 text-center">
              <div className="text-[9px] font-mono text-white/40">{l}</div>
              <div className={`font-mono text-sm font-bold text-neon-${c}`}>{v}</div>
            </div>
          ))}
        </div>

        {[['N1 (Primary Turns)', n1, setN1, 1, 500, 'cyan'],
          ['N2 (Secondary Turns)', n2, setN2, 1, 500, 'orange'],
          ['Input Voltage (V)', vin, setVin, 1, 440, 'green']].map(([lbl, val, setter, min, max, color]) => (
          <div key={lbl as string} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/40">{lbl as string}</span>
              <span className={`text-neon-${color as string}`}>{val as number}</span>
            </div>
            <input type="range" min={min as number} max={max as number} step={1}
              value={val as number} onChange={e => (setter as (v:number)=>void)(+e.target.value)}
              className={`w-full h-1 accent-neon-${color as string} cursor-pointer`}
            />
          </div>
        ))}
      </div>
    </ComponentWrapper>
  );
}

/* ─── ZENER ─────────────────────────────────────────────────────── */
export function ZenerNode() {
  const meta = COMPONENT_METAS.zener;
  const [vin, setVin] = useState(5);
  const [vz, setVz] = useState(3.3);
  const [rl, setRl] = useState(1000);

  const rs = 470; // series resistor
  const isBreakdown = vin > vz;
  const vout = isBreakdown ? vz : vin;
  const iz = isBreakdown ? (vin - vz) / rs : 0;
  const il = vout / rl;
  const pz = vz * iz;

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-3">
        <svg width="100%" height="120" viewBox="0 0 260 120">
          {/* Circuit: Vin - Rs - Zener - GND, Rl in parallel with Zener */}
          <line x1="0" y1="30" x2="50" y2="30" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          {/* Rs */}
          {[0,1,2,3].map(i => (
            <line key={i} x1={50+i*10} y1={i%2===0?22:38} x2={50+(i+1)*10} y2={i%2===0?38:22} stroke="rgba(255,107,53,0.7)" strokeWidth="1.5" />
          ))}
          <line x1="90" y1="30" x2="140" y2="30" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          {/* Zener symbol */}
          <polygon points="140,15 140,45 165,30" fill="rgba(57,255,20,0.1)" stroke="rgba(57,255,20,0.7)" strokeWidth="2" />
          <path d="M 165 15 L 165 45 L 170 38 M 165 15 L 160 22" stroke={isBreakdown ? '#39ff14' : 'rgba(57,255,20,0.4)'} strokeWidth="2.5" fill="none" />
          <line x1="165" y1="30" x2="260" y2="30" stroke="rgba(0,229,255,0.4)" strokeWidth="2" />
          {/* GND */}
          <line x1="140" y1="45" x2="140" y2="90" stroke="rgba(0,229,255,0.4)" strokeWidth="2" />
          <line x1="260" y1="30" x2="260" y2="90" stroke="rgba(0,229,255,0.4)" strokeWidth="2" />
          <line x1="140" y1="90" x2="260" y2="90" stroke="rgba(0,229,255,0.4)" strokeWidth="2" />
          {/* Rl */}
          <rect x="215" y="30" width="30" height="60" fill="transparent" />
          <text x="226" y="65" fill="rgba(255,200,50,0.6)" fontSize="9" fontFamily="monospace">RL</text>
          {/* Labels */}
          <text x="5" y="24" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">{vin}V</text>
          <text x="50" y="16" fill="rgba(255,107,53,0.5)" fontSize="8" fontFamily="monospace">Rs={rs}Ω</text>
          <text x="155" y="16" fill="rgba(57,255,20,0.5)" fontSize="8" fontFamily="monospace">{vz}V</text>
          <text x="168" y="56" fill={isBreakdown ? '#39ff14' : 'rgba(57,255,20,0.3)'} fontSize="8" fontFamily="monospace">
            {isBreakdown ? 'BREAKDOWN' : 'OFF'}
          </text>
        </svg>

        <div className="grid grid-cols-2 gap-2 text-center">
          {[['Vout', `${vout.toFixed(2)} V`, isBreakdown?'green':'cyan'],
            ['Iz',   `${(iz*1000).toFixed(1)} mA`, 'purple'],
            ['Pz',   `${(pz*1000).toFixed(1)} mW`, pz>0.5?'orange':'green'],
            ['IL',   `${(il*1000).toFixed(1)} mA`, 'cyan']].map(([l,v,c]) => (
            <div key={l} className="bg-dark-900/50 rounded-lg p-2">
              <div className="text-[9px] font-mono text-white/40">{l}</div>
              <div className={`font-mono text-xs font-bold text-neon-${c}`}>{v}</div>
            </div>
          ))}
        </div>

        {[['Vin (V)', vin, setVin, 1, 15, 0.5, 'cyan'],
          ['Vz (V)', vz, setVz, 1.2, 12, 0.1, 'green'],
          ['RL (Ω)', rl, setRl, 100, 10000, 100, 'gold']].map(([lbl,val,setter,min,max,step,c]) => (
          <div key={lbl as string} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/40">{lbl as string}</span>
              <span className={`text-neon-${c as string}`}>{(val as number).toFixed(lbl==='Vz (V)'?1:0)}</span>
            </div>
            <input type="range" min={min as number} max={max as number} step={step as number}
              value={val as number} onChange={e => (setter as (v:number)=>void)(+e.target.value)}
              className={`w-full h-1 accent-neon-${c as string} cursor-pointer`}
            />
          </div>
        ))}
      </div>
    </ComponentWrapper>
  );
}

/* ─── MOSFET ────────────────────────────────────────────────────── */
export function MOSFETNode() {
  const meta = COMPONENT_METAS.mosfet;
  const [vgs, setVgs] = useState(2);
  const [vds, setVds] = useState(5);
  const VTH = 1.5, KN = 0.8;

  const region =
    vgs < VTH ? 'cutoff' :
    vds < vgs - VTH ? 'triode' : 'saturation';

  const id = region === 'cutoff' ? 0 :
    region === 'triode'
      ? KN * ((vgs - VTH) * vds - vds*vds/2)
      : 0.5 * KN * Math.pow(vgs - VTH, 2);

  const regionColor: Record<string, string> = {
    cutoff:'text-neon-red', triode:'text-neon-cyan', saturation:'text-neon-green',
  };

  const channelWidth = region === 'cutoff' ? 0 : Math.min(1, (vgs - VTH) / 3);

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-3">
        <svg width="100%" height="120" viewBox="0 0 260 120">
          {/* Gate oxide */}
          <rect x="80" y="20" width="8" height="80" rx="2" fill="rgba(150,120,80,0.4)" stroke="rgba(150,120,80,0.6)" strokeWidth="1" />
          {/* Gate metal */}
          <rect x="65" y="35" width="15" height="50" rx="2" fill="rgba(200,180,100,0.3)" stroke="rgba(200,180,100,0.5)" strokeWidth="1" />
          {/* P-type substrate */}
          <rect x="88" y="20" width="110" height="80" rx="4" fill="rgba(60,30,80,0.3)" stroke="rgba(100,60,150,0.3)" strokeWidth="1" />
          {/* N+ source */}
          <rect x="88" y="20" width="30" height="35" rx="2" fill="rgba(0,150,200,0.3)" stroke="rgba(0,200,255,0.5)" strokeWidth="1.5" />
          {/* N+ drain */}
          <rect x="168" y="20" width="30" height="35" rx="2" fill="rgba(0,150,200,0.3)" stroke="rgba(0,200,255,0.5)" strokeWidth="1.5" />
          {/* Inversion channel */}
          {channelWidth > 0 && (
            <rect x="118" y="20" width="50" height={8 * channelWidth + 5} rx="1"
              fill={`rgba(0,229,255,${channelWidth * 0.5})`}
              stroke={`rgba(0,229,255,${channelWidth * 0.7})`} strokeWidth="1"
            />
          )}
          {/* Leads */}
          <line x1="0" y1="60" x2="65" y2="60" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <line x1="103" y1="20" x2="103" y2="0" stroke="rgba(57,255,20,0.6)" strokeWidth="2" />
          <line x1="183" y1="20" x2="183" y2="0" stroke="rgba(255,107,53,0.6)" strokeWidth="2" />
          {/* Labels */}
          <text x="2" y="55" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">G</text>
          <text x="98" y="12" fill="rgba(57,255,20,0.5)" fontSize="9" fontFamily="monospace">S</text>
          <text x="178" y="12" fill="rgba(255,107,53,0.5)" fontSize="9" fontFamily="monospace">D</text>
          <text x="130" y="110" fill={regionColor[region].replace('text-','')} fontSize="8" fontFamily="monospace" textAnchor="middle">
            {region.toUpperCase()}
          </text>
        </svg>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[['Region', region, regionColor[region]],
            ['Id', `${(id*1000).toFixed(1)} mA`, 'text-neon-cyan'],
            ['gm', `${(KN*(vgs-VTH)).toFixed(2)} A/V`, 'text-neon-green']].map(([l,v,c]) => (
            <div key={l} className="bg-dark-900/50 rounded-lg p-2">
              <div className="text-[9px] font-mono text-white/40">{l}</div>
              <div className={`font-mono text-[11px] font-bold ${c}`}>{v}</div>
            </div>
          ))}
        </div>

        {[['Vgs (V)', vgs, setVgs, 0, 5, 0.1, 'cyan'],
          ['Vds (V)', vds, setVds, 0, 10, 0.1, 'orange']].map(([lbl,val,setter,min,max,step,c]) => (
          <div key={lbl as string} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/40">{lbl as string}</span>
              <span className={`text-neon-${c as string}`}>{(val as number).toFixed(1)}</span>
            </div>
            <input type="range" min={min as number} max={max as number} step={step as number}
              value={val as number} onChange={e => (setter as (v:number)=>void)(+e.target.value)}
              className={`w-full h-1 accent-neon-${c as string} cursor-pointer`}
            />
          </div>
        ))}
        <div className="bg-dark-900/50 rounded-lg p-2.5 font-mono text-xs text-center">
          <span className="text-white/40">Vth = {VTH}V  </span>
          <span className={regionColor[region]}>Vgs = {vgs.toFixed(1)}V → {vgs < VTH ? 'No channel' : `Channel width ×${channelWidth.toFixed(2)}`}</span>
        </div>
      </div>
    </ComponentWrapper>
  );
}

/* ─── OP-AMP ────────────────────────────────────────────────────── */
export function OpAmpNode() {
  const meta = COMPONENT_METAS.opamp;
  const [config, setConfig] = useState<'inverting'|'nonInverting'>('inverting');
  const [rf, setRf] = useState(100);
  const [rin, setRin] = useState(10);
  const [vin, setVin] = useState(1);
  const VCC = 15;

  const av = config === 'inverting' ? -(rf / rin) : 1 + rf / rin;
  const vout = Math.max(-VCC, Math.min(VCC, av * vin));
  const isSaturated = Math.abs(vout) >= VCC;

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {(['inverting','nonInverting'] as const).map(c => (
            <button key={c} onClick={() => setConfig(c)}
              className={`flex-1 py-2 rounded-lg font-mono text-[10px] font-semibold border transition-all uppercase tracking-wider ${
                config===c ? 'bg-neon-purple/20 border-neon-purple/50 text-neon-purple' : 'bg-white/[0.02] border-white/10 text-white/40'
              }`}
            >
              {c === 'inverting' ? 'Inverting' : 'Non-Inverting'}
            </button>
          ))}
        </div>

        <svg width="100%" height="100" viewBox="0 0 260 100">
          {/* Triangle op-amp symbol */}
          <polygon points="100,15 100,85 175,50" fill="rgba(191,90,242,0.08)" stroke="rgba(191,90,242,0.6)" strokeWidth="2" />
          {/* Leads */}
          <line x1="0" y1="35" x2="100" y2="35" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <line x1="0" y1="65" x2="100" y2="65" stroke="rgba(57,255,20,0.4)" strokeWidth="2" />
          <line x1="175" y1="50" x2="260" y2="50" stroke={isSaturated ? '#ff2d55' : 'rgba(191,90,242,0.8)'} strokeWidth="2" />
          {/* Rf feedback */}
          {config === 'inverting' && (
            <path d="M 260 50 L 260 10 L 50 10 L 50 35" fill="none" stroke="rgba(255,107,53,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
          )}
          {/* +/- labels */}
          <text x="108" y="40" fill="rgba(0,229,255,0.7)" fontSize="11" fontFamily="monospace">
            {config === 'inverting' ? '−' : '+'}
          </text>
          <text x="108" y="68" fill="rgba(57,255,20,0.5)" fontSize="11" fontFamily="monospace">
            {config === 'inverting' ? '+' : '−'}
          </text>
          {/* Values */}
          <text x="5" y="28" fill="rgba(0,229,255,0.5)" fontSize="8" fontFamily="monospace">Vin={vin}V</text>
          <text x="180" y="44" fill={isSaturated?'#ff2d55':'rgba(191,90,242,0.6)'} fontSize="8" fontFamily="monospace">
            {vout.toFixed(1)}V
          </text>
          <text x="120" y="95" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace" textAnchor="middle">
            Av = {av.toFixed(1)} {isSaturated ? '⚠ SATURATED' : ''}
          </text>
        </svg>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[['Av', av.toFixed(1), 'purple'],['Vout',`${vout.toFixed(2)}V`,isSaturated?'red':'cyan'],
            ['dB', `${(20*Math.log10(Math.abs(av))).toFixed(1)}`,  'green']].map(([l,v,c]) => (
            <div key={l} className="bg-dark-900/50 rounded-lg p-2">
              <div className="text-[9px] font-mono text-white/40">{l}</div>
              <div className={`font-mono text-sm font-bold text-neon-${c}`}>{v}</div>
            </div>
          ))}
        </div>

        {[['Vin (V)', vin, setVin, -5, 5, 0.1, 'cyan'],
          ['Rf (kΩ)', rf, setRf, 1, 1000, 1, 'purple'],
          ['Rin (kΩ)', rin, setRin, 1, 200, 1, 'orange']].map(([lbl,val,setter,min,max,step,c]) => (
          <div key={lbl as string} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/40">{lbl as string}</span>
              <span className={`text-neon-${c as string}`}>{(val as number).toFixed(lbl==='Vin (V)'?1:0)}</span>
            </div>
            <input type="range" min={min as number} max={max as number} step={step as number}
              value={val as number} onChange={e => (setter as (v:number)=>void)(+e.target.value)}
              className={`w-full h-1 accent-neon-${c as string} cursor-pointer`}
            />
          </div>
        ))}
      </div>
    </ComponentWrapper>
  );
}

/* ─── RELAY ─────────────────────────────────────────────────────── */
export function RelayNode() {
  const meta = COMPONENT_METAS.relay;
  const [coilOn, setCoilOn] = useState(false);
  const [armaturePos, setArmaturePos] = useState(0); // 0=open, 1=closed
  const [responseMs, setResponseMs] = useState(0);

  const engage = useCallback(() => {
    if (coilOn) return;
    const start = Date.now();
    setCoilOn(true);
    const tick = () => {
      const elapsed = Date.now() - start;
      const pos = Math.min(1, elapsed / 25);
      setArmaturePos(pos);
      setResponseMs(elapsed);
      if (pos < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [coilOn]);

  const disengage = useCallback(() => {
    if (!coilOn) return;
    const start = Date.now();
    setCoilOn(false);
    const tick = () => {
      const elapsed = Date.now() - start;
      const pos = Math.max(0, 1 - elapsed / 20);
      setArmaturePos(pos);
      if (pos > 0) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [coilOn]);

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-4">
        <svg width="100%" height="130" viewBox="0 0 280 130">
          {/* Coil */}
          {[0,1,2,3,4].map(i => (
            <path key={i} d={`M ${20+i*20} 80 Q ${30+i*20} 60 ${40+i*20} 80 Q ${30+i*20} 100 ${20+i*20} 80`}
              fill="none" stroke={coilOn ? 'rgba(0,229,255,0.8)' : 'rgba(0,229,255,0.3)'} strokeWidth="2" />
          ))}
          {/* Iron core */}
          <rect x="20" y="95" width="100" height="8" rx="2" fill={coilOn ? 'rgba(0,229,255,0.3)' : 'rgba(100,100,120,0.3)'} stroke="rgba(100,100,120,0.5)" strokeWidth="1" />
          {/* Magnetic field lines when on */}
          {coilOn && [0,1,2].map(i => (
            <motion.ellipse key={i} cx="70" cy="80" rx={20+i*15} ry={8+i*5}
              fill="none" stroke={`rgba(0,229,255,${0.15-i*0.04})`} strokeWidth="1" strokeDasharray="3 3"
              animate={{ rx:[20+i*15, 30+i*18, 20+i*15] }} transition={{ duration:1.5, repeat:Infinity }}
            />
          ))}
          {/* Armature (pivoting) */}
          <motion.rect
            x="130" y={65 - armaturePos * 20} width="110" height="6" rx="2"
            fill="rgba(180,160,100,0.4)" stroke="rgba(200,180,100,0.6)" strokeWidth="1.5"
            animate={{ y: 65 - armaturePos * 20 }}
            transition={{ type:'spring', stiffness:400, damping:20 }}
          />
          {/* Fixed contact */}
          <circle cx="230" cy="88" r="5" fill="rgba(200,180,100,0.5)" stroke="rgba(200,200,100,0.8)" strokeWidth="1.5" />
          {/* Moving contact */}
          <motion.circle cx="230" cy={68 - armaturePos * 19} r="5"
            fill={armaturePos > 0.8 ? 'rgba(57,255,20,0.7)' : 'rgba(200,180,100,0.4)'}
            stroke="rgba(200,200,100,0.8)" strokeWidth="1.5"
            animate={{ cy: 68 - armaturePos * 19 }}
            transition={{ type:'spring', stiffness:400, damping:20 }}
          />
          {/* Load circuit lines */}
          <line x1="230" y1="88" x2="280" y2="88" stroke="rgba(255,107,53,0.5)" strokeWidth="2" />
          <line x1="230" y1="20" x2="280" y2="20" stroke="rgba(255,107,53,0.5)" strokeWidth="2" />
          <line x1="280" y1="20" x2="280" y2="88" stroke={armaturePos > 0.8 ? 'rgba(57,255,20,0.8)' : 'rgba(255,107,53,0.2)'} strokeWidth="2" />
          {/* Isolation label */}
          <text x="140" y="125" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="monospace">LOW VOLTAGE CONTROL</text>
          <text x="225" y="14" fill="rgba(255,107,53,0.4)" fontSize="7" fontFamily="monospace">HIGH VOLTAGE LOAD</text>
          <line x1="125" y1="10" x2="125" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[['Status', coilOn ? 'ENERGIZED' : 'OFF', coilOn?'cyan':'red'],
            ['Contact', armaturePos > 0.8 ? 'CLOSED' : 'OPEN', armaturePos>0.8?'green':'orange'],
            ['Time', `${responseMs} ms`, 'gold']].map(([l,v,c]) => (
            <div key={l} className="bg-dark-900/50 rounded-lg p-2">
              <div className="text-[9px] font-mono text-white/40">{l}</div>
              <div className={`font-mono text-xs font-bold text-neon-${c}`}>{v}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={engage} disabled={coilOn}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-semibold border transition-all ${coilOn?'opacity-40 cursor-not-allowed border-white/10 text-white/30':'bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/20'}`}>
            🧲 Energize Coil
          </button>
          <button onClick={disengage} disabled={!coilOn}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-semibold border transition-all ${!coilOn?'opacity-40 cursor-not-allowed border-white/10 text-white/30':'bg-neon-red/10 border-neon-red/40 text-neon-red hover:bg-neon-red/20'}`}>
            ✗ De-energize
          </button>
        </div>
      </div>
    </ComponentWrapper>
  );
}

/* ─── POTENTIOMETER ─────────────────────────────────────────────── */
export function PotentiometerNode() {
  const meta = COMPONENT_METAS.potentiometer;
  const [wiper, setWiper] = useState(0.5); // 0-1
  const [vin, setVin] = useState(5);
  const [rl, setRl] = useState(10000);
  const [taper, setTaper] = useState<'linear'|'log'>('linear');
  const RTOTAL = 10000;

  const rawRatio   = taper === 'log' ? Math.pow(wiper, 2.5) : wiper;
  const rwiper     = rawRatio * RTOTAL;
  const rlower     = rwiper;
  const rload      = rl;
  const rpar       = (rlower * rload) / (rlower + rload);
  const vout       = vin * (rpar / (RTOTAL - rwiper + rpar));

  // Circular potentiometer
  const angle = wiper * 270 - 135;
  const rad   = (angle * Math.PI) / 180;
  const cx = 60, cy = 60, r = 40;
  const tx = cx + r * Math.cos(rad), ty = cy + r * Math.sin(rad);

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          {/* SVG rotary pot */}
          <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
            <circle cx={cx} cy={cy} r={r} fill="rgba(30,30,50,0.6)" stroke="rgba(212,168,67,0.3)" strokeWidth="2" />
            {/* Track arc */}
            <path d={`M ${cx + r*Math.cos(-225*Math.PI/180)} ${cy + r*Math.sin(-225*Math.PI/180)} A ${r} ${r} 0 1 1 ${cx + r*Math.cos(45*Math.PI/180)} ${cy + r*Math.sin(45*Math.PI/180)}`}
              fill="none" stroke="rgba(212,168,67,0.2)" strokeWidth="4" strokeLinecap="round" />
            {/* Wiper indicator */}
            <line x1={cx} y1={cy} x2={tx} y2={ty} stroke="rgba(212,168,67,0.8)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={tx} cy={ty} r="5" fill="rgba(212,168,67,0.6)" stroke="rgba(212,168,67,0.9)" strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r="6" fill="rgba(212,168,67,0.3)" stroke="rgba(212,168,67,0.6)" strokeWidth="1" />
            {/* Value */}
            <text x={cx} y={cy+18} fill="rgba(212,168,67,0.8)" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {(wiper*100).toFixed(0)}%
            </text>
          </svg>

          <div className="flex flex-col gap-2 flex-1">
            <div className="bg-dark-900/50 rounded-lg p-2.5 text-center">
              <div className="text-[9px] font-mono text-white/40">Vout</div>
              <div className="font-mono text-xl font-bold text-neon-gold">{vout.toFixed(3)} V</div>
            </div>
            <div className="bg-dark-900/50 rounded-lg p-2.5 text-center">
              <div className="text-[9px] font-mono text-white/40">Rwiper</div>
              <div className="font-mono text-sm font-bold text-neon-cyan">{(rwiper).toFixed(0)} Ω</div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5">
          {(['linear','log'] as const).map(t => (
            <button key={t} onClick={() => setTaper(t)}
              className={`flex-1 py-1.5 rounded-lg font-mono text-[10px] border transition-all ${taper===t?'bg-neon-gold/15 border-neon-gold/40 text-neon-gold':'bg-white/[0.02] border-white/10 text-white/40'}`}>
              {t === 'log' ? 'Log (Audio)' : 'Linear'}
            </button>
          ))}
        </div>

        {[['Wiper Position', wiper, setWiper, 0, 1, 0.01, 'gold'],
          ['Vin (V)', vin, setVin, 1, 12, 0.5, 'cyan'],
          ['Load RL (Ω)', rl, setRl, 1000, 100000, 1000, 'green']].map(([lbl,val,setter,min,max,step,c]) => (
          <div key={lbl as string} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/40">{lbl as string}</span>
              <span className={`text-neon-${c as string}`}>
                {lbl==='Wiper Position' ? `${((val as number)*100).toFixed(0)}%` : (val as number)}
              </span>
            </div>
            <input type="range" min={min as number} max={max as number} step={step as number}
              value={val as number} onChange={e => (setter as (v:number)=>void)(+e.target.value)}
              className={`w-full h-1 accent-neon-${c as string} cursor-pointer`}
            />
          </div>
        ))}
      </div>
    </ComponentWrapper>
  );
}

/* ─── FUSE ──────────────────────────────────────────────────────── */
export function FuseNode() {
  const meta = COMPONENT_METAS.fuse;
  const [current, setCurrent] = useState(1);
  const [rating, setRating] = useState(2);
  const [blown, setBlown] = useState(false);
  const [tempC, setTempC] = useState(25);

  useEffect(() => {
    if (current > rating && !blown) {
      const overRatio = current / rating;
      const blowTime  = 500 / overRatio;
      const t = setTimeout(() => setBlown(true), blowTime);
      return () => clearTimeout(t);
    }
  }, [current, rating, blown]);

  const reset = () => { setBlown(false); setCurrent(1); };
  const energy = current * current * (blown ? 0 : 1) * 0.1;
  const tempRise = (current / rating) * 40;
  const actTemp = Math.min(600, tempC + (blown ? 0 : tempRise));

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-3">
        <svg width="100%" height="80" viewBox="0 0 280 80">
          <line x1="0" y1="40" x2="60" y2="40" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <line x1="220" y1="40" x2="280" y2="40" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <rect x="60" y="22" width="160" height="36" rx="6" fill="rgba(30,25,15,0.8)" stroke="rgba(200,180,100,0.4)" strokeWidth="1.5" />
          {/* Filament */}
          {blown ? (
            <>
              <line x1="80" y1="40" x2="130" y2="40" stroke="rgba(200,180,100,0.4)" strokeWidth="1.5" />
              <line x1="160" y1="40" x2="200" y2="40" stroke="rgba(200,180,100,0.4)" strokeWidth="1.5" />
              <path d="M 130 40 L 140 30 M 155 40 L 145 30" stroke="rgba(255,50,50,0.5)" strokeWidth="1.5" />
              <text x="140" y="68" fill="rgba(255,50,50,0.7)" fontSize="9" fontFamily="monospace" textAnchor="middle">BLOWN</text>
            </>
          ) : (
            <motion.path
              d="M 80 40 L 100 30 L 120 50 L 140 30 L 160 50 L 180 30 L 200 40"
              fill="none"
              stroke={current > rating ? '#ff6600' : current > rating * 0.8 ? '#ffaa00' : 'rgba(200,180,100,0.7)'}
              strokeWidth="2"
              animate={current > rating ? { filter:['brightness(1)','brightness(3)','brightness(1)'] } : {}}
              transition={{ duration:0.3, repeat:Infinity }}
            />
          )}
          <text x="5" y="24" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">{current}A</text>
          <text x="80" y="16" fill="rgba(200,180,100,0.5)" fontSize="9" fontFamily="monospace">{rating}A FUSE</text>
          <text x="140" y="75" fill={actTemp > 200 ? '#ff6600' : 'rgba(255,255,255,0.2)'} fontSize="8" fontFamily="monospace" textAnchor="middle">
            {actTemp.toFixed(0)}°C
          </text>
        </svg>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[['I/Irated', `${(current/rating).toFixed(2)}×`, current>rating?'red':current>rating*0.8?'orange':'green'],
            ['I²t', `${(current*current*0.1).toFixed(1)}`,  'cyan'],
            ['Status', blown?'BLOWN':'OK', blown?'red':'green']].map(([l,v,c]) => (
            <div key={l} className="bg-dark-900/50 rounded-lg p-2">
              <div className="text-[9px] font-mono text-white/40">{l}</div>
              <div className={`font-mono text-xs font-bold text-neon-${c}`}>{v}</div>
            </div>
          ))}
        </div>

        {[['Current (A)', current, setCurrent, 0, 10, 0.1, 'cyan'],
          ['Fuse Rating (A)', rating, setRating, 0.5, 10, 0.5, 'orange']].map(([lbl,val,setter,min,max,step,c]) => (
          <div key={lbl as string} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-white/40">{lbl as string}</span>
              <span className={`text-neon-${c as string}`}>{(val as number).toFixed(1)}</span>
            </div>
            <input type="range" min={min as number} max={max as number} step={step as number}
              value={val as number} onChange={e => (setter as (v:number)=>void)(+e.target.value)}
              className={`w-full h-1 accent-neon-${c as string} cursor-pointer`}
              disabled={blown}
            />
          </div>
        ))}

        {blown && (
          <button onClick={reset} className="w-full py-2.5 rounded-xl font-mono text-xs font-semibold bg-neon-green/10 border border-neon-green/40 text-neon-green hover:bg-neon-green/20 transition-all">
            🔄 Replace Fuse
          </button>
        )}
      </div>
    </ComponentWrapper>
  );
}

/* ─── CRYSTAL ───────────────────────────────────────────────────── */
export function CrystalNode() {
  const meta = COMPONENT_METAS.crystal;
  const [freqIdx, setFreqIdx] = useState(1);
  const [tempC, setTempC] = useState(25);

  const freqs = [
    { hz:32768,    label:'32.768 kHz', use:'RTC / Watch', ppm:20 },
    { hz:1000000,  label:'1 MHz',      use:'Microcontroller', ppm:10 },
    { hz:8000000,  label:'8 MHz',      use:'Arduino/MCU', ppm:15 },
    { hz:20000000, label:'20 MHz',     use:'High-speed MCU', ppm:10 },
  ];

  const freq = freqs[freqIdx];
  const tempDrift = ((tempC - 25) * 0.04).toFixed(2);
  const period = 1 / freq.hz;

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-3">
        <svg width="100%" height="90" viewBox="0 0 260 90">
          <line x1="0" y1="45" x2="55" y2="45" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <line x1="205" y1="45" x2="260" y2="45" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          <rect x="55" y="20" width="150" height="50" rx="8" fill="rgba(220,220,255,0.06)" stroke="rgba(150,180,255,0.4)" strokeWidth="2" />
          {/* Crystal lattice */}
          {[0,1,2,3,4,5].map(i => (
            <line key={i} x1={75+i*20} y1="25" x2={75+i*20} y2="65" stroke="rgba(150,180,255,0.25)" strokeWidth="1" />
          ))}
          {/* Waveform */}
          <path
            d={`M 60 45 ${Array.from({length:20},(_,i)=>{
              const x = 60+i*7;
              const y = 45 - Math.sin(i * 0.8) * 14;
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="1.5"
          />
          <text x="130" y="85" fill="rgba(150,180,255,0.5)" fontSize="8" fontFamily="monospace" textAnchor="middle">
            {freq.label} · {freq.use}
          </text>
        </svg>

        <div className="flex gap-1 flex-wrap">
          {freqs.map((f,i) => (
            <button key={f.hz} onClick={() => setFreqIdx(i)}
              className={`px-2 py-1 rounded font-mono text-[9px] border transition-all ${freqIdx===i?'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan':'bg-white/[0.02] border-white/10 text-white/35'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          {[['Period', period < 1e-6 ? `${(period*1e9).toFixed(0)} ns` : `${(period*1e6).toFixed(0)} µs`, 'cyan'],
            ['Stability', `±${freq.ppm} ppm`, 'green'],
            ['Temp Drift', `${tempDrift} ppm`, 'gold'],
            ['Use Case', freq.use, 'purple']].map(([l,v,c]) => (
            <div key={l} className="bg-dark-900/50 rounded-lg p-2">
              <div className="text-[9px] font-mono text-white/40">{l}</div>
              <div className={`font-mono text-xs font-bold text-neon-${c}`}>{v}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-white/40">Temperature (°C)</span>
            <span className="text-neon-gold">{tempC}°C</span>
          </div>
          <input type="range" min={-40} max={85} step={1} value={tempC}
            onChange={e => setTempC(+e.target.value)}
            className="w-full h-1 accent-neon-gold cursor-pointer" />
        </div>
      </div>
    </ComponentWrapper>
  );
}

/* ─── SCR ───────────────────────────────────────────────────────── */
export function SCRNode() {
  const meta = COMPONENT_METAS.scr;
  const [latched, setLatched] = useState(false);
  const [ia, setIa] = useState(2);
  const IH = 0.5; // holding current
  const [firingAngle, setFiringAngle] = useState(90);

  const vout_avg = (ia > IH && latched) ? ia * 10 : 0;
  const vout_phase = 0.45 * 220 * (1 + Math.cos(firingAngle * Math.PI / 180));

  return (
    <ComponentWrapper meta={meta}>
      <div className="space-y-3">
        <svg width="100%" height="100" viewBox="0 0 260 100">
          {/* Anode */}
          <line x1="0" y1="50" x2="70" y2="50" stroke="rgba(0,229,255,0.6)" strokeWidth="2" />
          {/* SCR symbol */}
          <polygon points="70,30 70,70 110,50" fill={latched?'rgba(0,229,255,0.15)':'rgba(100,100,150,0.1)'} stroke={latched?'rgba(0,229,255,0.7)':'rgba(100,100,150,0.4)'} strokeWidth="2" />
          <line x1="110" y1="30" x2="110" y2="70" stroke={latched?'rgba(0,229,255,0.8)':'rgba(100,100,150,0.4)'} strokeWidth="2.5" />
          {/* Gate */}
          <line x1="110" y1="70" x2="150" y2="95" stroke={latched?'rgba(57,255,20,0.6)':'rgba(100,100,100,0.4)'} strokeWidth="2" />
          {/* Cathode */}
          <line x1="110" y1="50" x2="260" y2="50" stroke={latched?'rgba(0,229,255,0.7)':'rgba(0,229,255,0.2)'} strokeWidth="2" />
          {/* Gate label */}
          <text x="155" y="100" fill="rgba(57,255,20,0.5)" fontSize="9" fontFamily="monospace">G</text>
          <text x="2" y="44" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">A</text>
          <text x="242" y="44" fill="rgba(0,229,255,0.5)" fontSize="9" fontFamily="monospace">K</text>
          {latched && (
            <motion.text x="130" y="30" fill="rgba(0,229,255,0.7)" fontSize="8" fontFamily="monospace" textAnchor="middle"
              animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1, repeat:Infinity }}>
              CONDUCTING
            </motion.text>
          )}
        </svg>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[['State', latched?'LATCHED':'OFF', latched?'green':'red'],
            ['Ia', `${ia.toFixed(1)} A`, ia<IH?'orange':'cyan'],
            ['Vout(avg)', `${vout_phase.toFixed(0)} V`, 'purple']].map(([l,v,c]) => (
            <div key={l} className="bg-dark-900/50 rounded-lg p-2">
              <div className="text-[9px] font-mono text-white/40">{l}</div>
              <div className={`font-mono text-xs font-bold text-neon-${c}`}>{v}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setLatched(true)} disabled={latched}
            className={`flex-1 py-2 rounded-xl font-mono text-xs border transition-all ${latched?'opacity-40 cursor-not-allowed border-white/10 text-white/30':'bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/20'}`}>
            🔱 Gate Pulse
          </button>
          <button onClick={() => ia <= IH && setLatched(false)} disabled={!latched}
            className={`flex-1 py-2 rounded-xl font-mono text-xs border transition-all ${!latched?'opacity-40 cursor-not-allowed border-white/10 text-white/30':'bg-neon-red/10 border-neon-red/40 text-neon-red hover:bg-neon-red/20'}`}>
            ↓ Reduce Ia
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-white/40">Anode Current Ia (A)</span>
            <span className={ia <= IH && latched ? 'text-neon-red' : 'text-neon-cyan'}>{ia.toFixed(1)} A {ia<=IH&&latched?'(< Ih, SCR will turn off)':''}</span>
          </div>
          <input type="range" min={0} max={10} step={0.1} value={ia}
            onChange={e => { const v = +e.target.value; setIa(v); if (v <= IH) setLatched(false); }}
            className="w-full h-1 accent-neon-cyan cursor-pointer" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-white/40">Firing Angle α (AC Control)</span>
            <span className="text-neon-purple">{firingAngle}°</span>
          </div>
          <input type="range" min={0} max={180} step={1} value={firingAngle}
            onChange={e => setFiringAngle(+e.target.value)}
            className="w-full h-1 accent-neon-purple cursor-pointer" />
          <div className="text-[10px] font-mono text-neon-purple/60 text-center">
            Avg Output ≈ {vout_phase.toFixed(0)} V (Phase Control Mode)
          </div>
        </div>
      </div>
    </ComponentWrapper>
  );
}

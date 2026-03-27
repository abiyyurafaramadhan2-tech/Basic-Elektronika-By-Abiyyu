import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { GlassPanel, GlassBadge } from '../components/ui/GlassPanel';
import { CurrentFlowVisualizer } from '../components/visualizers/CurrentFlowVisualizer';
import { useApp } from '../context/AppContext';
import type { TheorySection } from '../types';

const SECTIONS: TheorySection[] = [
  {
    id: 'charge',
    title: 'Electric Charge',
    icon: '⚛',
    color: 'cyan',
    content: 'Electric charge is a fundamental property of matter. Electrons carry negative charge (−1.6×10⁻¹⁹ C). Like charges repel, opposite charges attract — this force governs all electrical phenomena.',
    formula: 'F = k·q₁·q₂ / r²  (Coulomb\'s Law)',
    keyPoints: [
      'Charge is quantized: Q = n·e',
      'Conservation: total charge is always constant',
      'Electron charge: e = 1.602 × 10⁻¹⁹ C',
      'SI Unit: Coulomb (C)',
    ],
  },
  {
    id: 'voltage',
    title: 'Voltage (EMF)',
    icon: '⚡',
    color: 'gold',
    content: 'Voltage is the electric potential difference between two points — the "pressure" that drives current. It represents the energy required to move one coulomb of charge between points. Without voltage, no current flows.',
    formula: 'V = W / Q  →  Volt = Joule / Coulomb',
    keyPoints: [
      'Unit: Volt (V) = J/C',
      'Created by EMF sources: batteries, generators',
      'KVL: sum of voltages in a loop = 0',
      'Reference point is always relative (GND = 0V)',
    ],
  },
  {
    id: 'current',
    title: 'Electric Current',
    icon: '〜',
    color: 'green',
    content: 'Current is the rate of charge flow — the number of electrons passing a cross-section per second. Conventional current flows from + to −, while electron flow is opposite. Both describe the same physical phenomenon.',
    formula: 'I = dQ/dt  →  Ampere = Coulomb / Second',
    keyPoints: [
      'Unit: Ampere (A)',
      'DC: constant direction  |  AC: alternating direction',
      'KCL: sum of currents at a node = 0',
      '1A = 6.24 × 10¹⁸ electrons/second',
    ],
  },
  {
    id: 'ohm',
    title: "Ohm's Law",
    icon: 'Ω',
    color: 'orange',
    content: "Ohm's Law is the cornerstone of circuit analysis. It states that for a linear conductor, voltage is directly proportional to current. The constant of proportionality is resistance — a measure of how much a material opposes current flow.",
    formula: 'V = I × R  ⟺  I = V/R  ⟺  R = V/I',
    keyPoints: [
      'Valid for linear (ohmic) conductors',
      'Resistance ↑ → Current ↓ (at constant V)',
      'Watt\'s extension: P = V·I = I²R = V²/R',
      'Non-ohmic: diodes, transistors, thermistors',
    ],
  },
  {
    id: 'power',
    title: 'Electrical Power',
    icon: 'W',
    color: 'purple',
    content: 'Power is the rate at which electrical energy is converted. In resistors, all power dissipates as heat (Joule heating). In motors it becomes mechanical work. Managing power is critical — exceeding ratings destroys components.',
    formula: 'P = V·I = I²·R = V²/R  (unit: Watt)',
    keyPoints: [
      'Unit: Watt (W) = J/s = V·A',
      'Joule heating: P = I²R (heat in resistors)',
      '1 kWh = 3.6 × 10⁶ J (energy billing)',
      'Power factor (AC): P = V·I·cos(φ)',
    ],
  },
  {
    id: 'circuits',
    title: 'Series vs Parallel',
    icon: '⊕',
    color: 'cyan',
    content: 'Components can be connected in series (one after another, same current) or parallel (side by side, same voltage). Each topology has unique properties for resistance, current distribution, and voltage division.',
    formula: 'Series: R_T = R₁+R₂+...  |  Parallel: 1/R_T = 1/R₁+1/R₂+...',
    keyPoints: [
      'Series: I same, V divides proportionally',
      'Parallel: V same, I divides proportionally',
      'Series opens → whole circuit breaks',
      'Parallel opens → other branches still work',
    ],
  },
];

const colorMap: Record<string, string> = {
  cyan:   'text-neon-cyan   border-neon-cyan/40   bg-neon-cyan/10',
  gold:   'text-neon-gold   border-neon-gold/40   bg-neon-gold/10',
  green:  'text-neon-green  border-neon-green/40  bg-neon-green/10',
  orange: 'text-neon-orange border-neon-orange/40 bg-neon-orange/10',
  purple: 'text-neon-purple border-neon-purple/40 bg-neon-purple/10',
};

function SectionCard({ section, index }: { section: TheorySection; index: number }) {
  const [open, setOpen] = useState(false);
  const col = colorMap[section.color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
    >
      <GlassPanel hover glow={section.color as 'cyan'} className="overflow-hidden">
        <button
          className="w-full flex items-center gap-4 text-left p-0 bg-transparent border-0 cursor-pointer"
          onClick={() => setOpen(o => !o)}
        >
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${col} flex-shrink-0`}>
            {section.icon}
          </div>

          {/* Title */}
          <div className="flex-1">
            <h3 className="font-orbitron font-semibold text-white tracking-wide">{section.title}</h3>
            <p className="font-mono text-xs text-white/40 mt-0.5 truncate">{section.formula}</p>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40 text-sm flex-shrink-0"
          >
            ▾
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-4">
                {/* Content */}
                <p className="text-sm text-white/60 leading-relaxed font-body">{section.content}</p>

                {/* Formula box */}
                <div className={`rounded-xl p-3 font-mono text-sm border ${col} text-center`}>
                  {section.formula}
                </div>

                {/* Key points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {section.keyPoints.map((pt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-2 text-xs text-white/50 font-body"
                    >
                      <span className={`${col.split(' ')[0]} mt-0.5 flex-shrink-0`}>▸</span>
                      {pt}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </motion.div>
  );
}

export function TheoryPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const { currentFlow, setCurrentFlow } = useApp();

  return (
    <div className="relative h-full flex flex-col" ref={scrollRef}>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-dark-900">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-cyan via-neon-green to-neon-purple"
          style={{ width: progressWidth }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-10 overflow-y-auto scrollbar-none flex-1">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center space-y-3"
        >
          <GlassBadge color="cyan">📐 Fundamentals · Module 01</GlassBadge>
          <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white tracking-tight">
            Electrical{' '}
            <span className="neon-text-cyan">Theory</span>
          </h1>
          <p className="text-white/40 text-sm font-body max-w-xl mx-auto">
            From fundamental charge to circuit analysis — explore the physical laws that govern all electronics.
          </p>
        </motion.div>

        {/* Live Current Flow Visualizer */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-xs">⚡</span>
            <h2 className="font-orbitron text-sm font-semibold text-white/80 tracking-wider uppercase">
              Live Current Flow
            </h2>
          </div>
          <CurrentFlowVisualizer
            voltage={currentFlow.voltage}
            resistance={currentFlow.resistance}
            showControls
            onVoltageChange={v => setCurrentFlow({ ...currentFlow, voltage: v })}
            onResistanceChange={r => setCurrentFlow({ ...currentFlow, resistance: r })}
          />
        </section>

        {/* Theory Cards */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center text-xs">📖</span>
            <h2 className="font-orbitron text-sm font-semibold text-white/80 tracking-wider uppercase">
              Core Concepts
            </h2>
          </div>
          <div className="space-y-3">
            {SECTIONS.map((s, i) => (
              <SectionCard key={s.id} section={s} index={i} />
            ))}
          </div>
        </section>

        {/* Reference table */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded bg-neon-gold/15 border border-neon-gold/30 flex items-center justify-center text-xs">📋</span>
            <h2 className="font-orbitron text-sm font-semibold text-white/80 tracking-wider uppercase">
              Quick Reference
            </h2>
          </div>
          <GlassPanel padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/[0.06]">
                    {['Quantity','Symbol','Unit','Formula'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-mono text-xs text-neon-cyan/60 uppercase tracking-widest font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-sm">
                  {[
                    ['Charge',     'Q',  'Coulomb (C)',  'Q = I·t'],
                    ['Voltage',    'V',  'Volt (V)',     'V = I·R'],
                    ['Current',    'I',  'Ampere (A)',   'I = V/R'],
                    ['Resistance', 'R',  'Ohm (Ω)',      'R = V/I'],
                    ['Power',      'P',  'Watt (W)',     'P = V·I'],
                    ['Energy',     'E',  'Joule (J)',    'E = P·t'],
                    ['Frequency',  'f',  'Hertz (Hz)',   'f = 1/T'],
                    ['Capacitance','C',  'Farad (F)',    'Q = C·V'],
                    ['Inductance', 'L',  'Henry (H)',    'V = L·dI/dt'],
                  ].map(([q, s, u, f], i) => (
                    <tr key={q} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                      <td className="px-4 py-2.5 text-white/70">{q}</td>
                      <td className="px-4 py-2.5 text-neon-cyan font-bold">{s}</td>
                      <td className="px-4 py-2.5 text-white/50">{u}</td>
                      <td className="px-4 py-2.5 text-neon-green/80">{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </section>
      </div>
    </div>
  );
          }

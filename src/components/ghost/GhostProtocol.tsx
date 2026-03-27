import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../context/LanguageContext';

interface Props { onClose: () => void; }

const SKILLS = ['Three.js / WebGL','React + TypeScript','Electronics Engineering','Circuit Analysis','PCB Design','UI/UX Architecture','Python / Embedded C','Next.js / Vite'];

export function GhostProtocol({ onClose }: Props) {
  const { t } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(20,15,5,0.97) 0%, rgba(4,6,16,0.99) 100%)' }}
    >
      {/* Subtle grid overlay — gold */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(212,168,67,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Corner ornaments */}
      {[['top-6 left-6', '┌'],['top-6 right-6', '┐'],['bottom-6 left-6', '└'],['bottom-6 right-6', '┘']].map(([pos, char]) => (
        <div key={pos} className={`absolute ${pos} font-mono text-neon-gold/20 text-2xl pointer-events-none`}>{char}</div>
      ))}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24, delay: 0.1 }}
        className="relative max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.div
              initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
              className="font-orbitron text-xs font-bold tracking-[0.35em] text-neon-gold/60 uppercase mb-1"
            >
              {t('ghost_title')}
            </motion.div>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
              className="font-mono text-[10px] text-neon-gold/25 tracking-widest uppercase">
              {t('ghost_sub')}
            </motion.div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl border border-neon-gold/20 bg-neon-gold/5 hover:bg-neon-gold/10 flex items-center justify-center text-neon-gold/50 hover:text-neon-gold transition-all font-mono text-lg">
            ×
          </button>
        </div>

        {/* Bio card */}
        <div className="rounded-2xl border border-neon-gold/20 overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(20,18,8,0.95) 0%, rgba(10,8,4,0.98) 100%)' }}>

          {/* Gold accent bar */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.6), rgba(212,168,67,0.8), rgba(212,168,67,0.4), transparent)' }} />

          <div className="p-8 space-y-6">
            {/* Avatar + Name */}
            <div className="flex items-start gap-5">
              <motion.div
                initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.3, type:'spring' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-orbitron font-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.05))', border: '1.5px solid rgba(212,168,67,0.35)', boxShadow:'0 0 30px rgba(212,168,67,0.1)' }}
              >
                <span className="text-neon-gold">AR</span>
              </motion.div>
              <div>
                <motion.h2
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
                  className="font-orbitron text-xl font-bold text-white leading-tight"
                  style={{ textShadow:'0 0 20px rgba(212,168,67,0.2)' }}
                >
                  {t('ghost_name')}
                </motion.h2>
                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
                  className="font-mono text-xs text-neon-gold/60 mt-1 tracking-wider uppercase">
                  {t('ghost_role')}
                </motion.p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest">2026 · Purwakarta, Indonesia</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
              className="text-sm font-body text-white/55 leading-relaxed border-l-2 pl-4"
              style={{ borderColor:'rgba(212,168,67,0.25)' }}>
              {t('ghost_bio')}
            </motion.p>

            {/* Education & Certs */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: t('ghost_edu'),  value: t('ghost_edu_val') },
                { label: t('ghost_cert'), value: `${t('ghost_cert1')}  ·  ${t('ghost_cert2')}` },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-15 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.55 + i*0.1 }}
                  className="rounded-xl p-3" style={{ background:'rgba(212,168,67,0.04)', border:'1px solid rgba(212,168,67,0.1)' }}>
                  <div className="text-[9px] font-mono text-neon-gold/40 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-xs text-white/60 font-body">{item.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Skills */}
            <div>
              <p className="text-[9px] font-mono text-neon-gold/40 uppercase tracking-widest mb-3">{t('ghost_skills')}</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILLS.map((s, i) => (
                  <motion.span key={s}
                    initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.7 + i*0.04 }}
                    className="font-mono text-[10px] px-2.5 py-1 rounded-full"
                    style={{ border:'1px solid rgba(212,168,67,0.2)', background:'rgba(212,168,67,0.06)', color:'rgba(212,168,67,0.65)' }}
                    whileHover={{ borderColor:'rgba(212,168,67,0.5)', color:'rgba(212,168,67,0.9)' }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Vision quote */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
              className="text-center py-3 rounded-xl"
              style={{ background:'rgba(212,168,67,0.04)', border:'1px solid rgba(212,168,67,0.08)' }}>
              <p className="font-body italic text-sm text-neon-gold/50">{t('ghost_vision')}</p>
            </motion.div>
          </div>

          <div className="h-px w-full" style={{ background:'linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent)' }} />
        </div>

        {/* Exit */}
        <motion.button
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}
          onClick={onClose}
          className="w-full mt-5 py-3 font-orbitron text-xs font-semibold tracking-[0.2em] uppercase text-neon-gold/40 hover:text-neon-gold/70 transition-colors border border-neon-gold/10 hover:border-neon-gold/25 rounded-xl"
        >
          {t('ghost_exit')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
            }

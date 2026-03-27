import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel, GlassBadge } from '../ui/GlassPanel';
import { useLang } from '../../context/LanguageContext';
import type { GlowColor } from '../../types';

export interface ComponentMeta {
  id:          string;
  name:        string;
  nameId:      string;        // Indonesian name
  symbol:      string;
  icon:        string;
  color:       GlowColor;
  unit:        string;
  category:    string;
  categoryId:  string;
  history: {
    year:    string;
    inventor:string;
    event:   string;
    eventId: string;
    detail:  string;
    detailId:string;
  };
  learningFeatures: Array<{
    icon:    string;
    title:   string;
    titleId: string;
    desc:    string;
    descId:  string;
  }>;
}

interface Props {
  meta: ComponentMeta;
  children: React.ReactNode;         // Interactive visualization
  extraInfo?: React.ReactNode;       // Extra expandable content
  defaultOpen?: boolean;
}

export function ComponentWrapper({ meta, children, extraInfo, defaultOpen = false }: Props) {
  const { t, lang } = useLang();
  const [expanded, setExpanded] = useState(defaultOpen);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const colorAccent: Record<GlowColor, string> = {
    cyan:   'text-neon-cyan   border-neon-cyan/30   bg-neon-cyan/10',
    green:  'text-neon-green  border-neon-green/30  bg-neon-green/10',
    purple: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
    orange: 'text-neon-orange border-neon-orange/30 bg-neon-orange/10',
    gold:   'text-neon-gold   border-neon-gold/30   bg-neon-gold/10',
  };

  const acc = colorAccent[meta.color];

  return (
    <GlassPanel hover glow={meta.color} className="overflow-hidden">
      {/* Header — always visible */}
      <button
        className="w-full flex items-center gap-3 text-left bg-transparent border-0 cursor-pointer p-0"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border ${acc} flex-shrink-0`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-orbitron font-semibold text-white text-sm tracking-wide">
              {lang === 'id' ? meta.nameId : meta.name}
            </h3>
            <GlassBadge color={meta.color}>{meta.unit}</GlassBadge>
          </div>
          <p className="text-xs text-white/35 font-mono mt-0.5">
            {lang === 'id' ? meta.categoryId : meta.category}
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/30 text-xs flex-shrink-0"
        >
          ▾
        </motion.div>
      </button>

      {/* Interactive area — always visible */}
      <div className="mt-4">{children}</div>

      {/* Expandable section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05] mt-4 pt-4 space-y-3">

              {/* Extra info */}
              {extraInfo && <div>{extraInfo}</div>}

              {/* History accordion */}
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border-0"
                  onClick={() => setHistoryOpen(h => !h)}
                >
                  <span className="font-mono text-xs font-semibold text-white/70">
                    {t('history_title')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[10px] border px-2 py-0.5 rounded-full ${acc}`}>
                      {meta.history.year}
                    </span>
                    <motion.span
                      animate={{ rotate: historyOpen ? 180 : 0 }}
                      className="text-white/30 text-xs"
                    >▾</motion.span>
                  </div>
                </button>
                <AnimatePresence>
                  {historyOpen && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-3 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono text-xs font-bold ${acc.split(' ')[0]}`}>
                            {meta.history.year}
                          </span>
                          <span className="text-white/50 text-xs">·</span>
                          <span className="font-mono text-xs text-neon-gold/70">{meta.history.inventor}</span>
                        </div>
                        <p className="text-sm font-semibold text-white/80">
                          {lang === 'id' ? meta.history.eventId : meta.history.event}
                        </p>
                        <p className="text-xs text-white/45 font-body leading-relaxed">
                          {lang === 'id' ? meta.history.detailId : meta.history.detail}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Learning Features accordion */}
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border-0"
                  onClick={() => setFeaturesOpen(f => !f)}
                >
                  <span className="font-mono text-xs font-semibold text-white/70">
                    {t('features_title')}
                  </span>
                  <motion.span animate={{ rotate: featuresOpen ? 180 : 0 }} className="text-white/30 text-xs">▾</motion.span>
                </button>
                <AnimatePresence>
                  {featuresOpen && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-3 space-y-3">
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                          {t('how_to_use')}
                        </p>
                        {meta.learningFeatures.map((feat, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="flex items-start gap-3 bg-white/[0.02] rounded-xl p-3"
                          >
                            <span className="text-xl flex-shrink-0 mt-0.5">{feat.icon}</span>
                            <div>
                              <p className="text-xs font-semibold text-white/80 font-mono">
                                {lang === 'id' ? feat.titleId : feat.title}
                              </p>
                              <p className="text-xs text-white/40 font-body mt-0.5 leading-relaxed">
                                {lang === 'id' ? feat.descId : feat.desc}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand hint */}
      <div className="text-center mt-3">
        <span className="text-[9px] font-mono text-white/15">
          {expanded ? t('collapse') : t('expand')}
        </span>
      </div>
    </GlassPanel>
  );
                                                }

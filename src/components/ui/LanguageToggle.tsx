import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../context/LanguageContext';
import type { Lang } from '../../i18n/translations';

export function LanguageToggle() {
  const { lang, setLang } = useLang();

  const options: { id: Lang; flag: string; label: string }[] = [
    { id: 'en', flag: '🇬🇧', label: 'EN' },
    { id: 'id', flag: '🇮🇩', label: 'ID' },
  ];

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm"
      role="radiogroup"
      aria-label="Language selector"
    >
      {options.map(opt => (
        <motion.button
          key={opt.id}
          onClick={() => setLang(opt.id)}
          className={`
            relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg
            font-mono text-xs font-semibold tracking-wider uppercase
            transition-colors duration-150 cursor-pointer
            ${lang === opt.id
              ? 'text-dark-900'
              : 'text-white/40 hover:text-white/70'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={lang === opt.id}
        >
          {/* Active background */}
          {lang === opt.id && (
            <motion.div
              layoutId="lang-pill"
              className="absolute inset-0 rounded-lg bg-neon-cyan z-0"
              style={{ boxShadow: '0 0 10px rgba(0,229,255,0.4)' }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10">{opt.flag}</span>
          <span className="relative z-10">{opt.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

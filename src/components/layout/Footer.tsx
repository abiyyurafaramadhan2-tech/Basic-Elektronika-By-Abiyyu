import { motion } from 'framer-motion';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-white/[0.05] overflow-hidden">
      {/* Circuit trace decoration */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo mark */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
            <span className="text-neon-cyan text-sm">⚡</span>
          </div>
          <span className="font-orbitron text-xs font-semibold tracking-widest text-white/50">
            ELECTROVERSE
          </span>
        </div>

        {/* Copyright — animated */}
        <motion.p
          className="font-mono text-xs text-white/30 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          © {year}{' '}
          <motion.span
            className="text-neon-gold/70 font-medium"
            whileHover={{ color: '#ffd700', textShadow: '0 0 8px rgba(255,215,0,0.5)' }}
          >
            Abiyyu Rafa Ramadhan
          </motion.span>
          .{' '}
          <span className="text-neon-cyan/40">Engineering the Future of Knowledge.</span>
        </motion.p>

        {/* Version tag */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">
            v1.0.0 · STABLE
          </span>
        </div>
      </div>
    </footer>
  );
}

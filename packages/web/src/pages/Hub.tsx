import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Flame } from "lucide-react";

function RouletteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      {[...Array(8)].map((_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return <line key={i} x1={12 + 7 * Math.cos(a)} y1={12 + 7 * Math.sin(a)} x2={12 + 10 * Math.cos(a)} y2={12 + 10 * Math.sin(a)} />;
      })}
    </svg>
  );
}

const LOGO_SRC = "/logogallos.png";

export function Hub() {
  return (
    <>
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-32 md:pb-40">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-96 bg-gradient-to-b from-gold/15 via-gold/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-arena-red/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-arena-red/8 to-transparent" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold/40 rounded-full"
              style={{ left: `${(i * 13) % 100}%`, top: `${15 + (i % 8) * 10}%` }}
              animate={{ y: [0, -25, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2.5 + (i % 5) * 0.3, repeat: Infinity, delay: (i * 0.15) % 2 }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="flex flex-col items-center gap-6 mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <img
              src={LOGO_SRC}
              alt=""
              className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_0_30px_rgba(255,184,0,0.4)]"
              aria-hidden
            />
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.15em] uppercase">
              <span className="text-gold drop-shadow-[0_0_40px_rgba(255,184,0,0.5)]">PALENQUE</span>
              <span className="text-arena-red drop-shadow-[0_0_30px_rgba(255,61,61,0.4)]"> ARENA</span>
            </h1>
          </motion.div>
          <motion.p
            className="text-gray-400 text-lg md:text-xl max-w-xl mb-14 font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Mexican coliseum meets Vegas. Choose your game.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Link to="/arena-clasica">
              <motion.div
                className="rounded-2xl border-2 border-gold/30 bg-charcoal/90 backdrop-blur p-8 text-center hover:border-gold hover:shadow-gold-glow transition-all duration-300 h-full flex flex-col items-center justify-center min-h-[220px]"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="rounded-xl bg-gold/10 p-4 mb-4 border border-gold/20">
                  <Swords className="w-12 h-12 text-gold" />
                </div>
                <h2 className="font-display text-2xl text-gold tracking-wider uppercase mb-2">Classic Arena</h2>
                <p className="text-gray-400 text-sm">Fast rounds. Bet MON on A or B. High tension.</p>
                <span className="mt-4 inline-block text-gold text-sm font-semibold">Enter →</span>
              </motion.div>
            </Link>

            <Link to="/elemental">
              <motion.div
                className="rounded-2xl border-2 border-arena-red/30 bg-charcoal/90 backdrop-blur p-8 text-center hover:border-arena-red hover:shadow-red-glow transition-all duration-300 h-full flex flex-col items-center justify-center min-h-[220px]"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="rounded-xl bg-arena-red/10 p-4 mb-4 border border-arena-red/20">
                  <Flame className="w-12 h-12 text-arena-red" />
                </div>
                <h2 className="font-display text-2xl text-arena-red tracking-wider uppercase mb-2">Elemental</h2>
                <p className="text-gray-400 text-sm">Fire, Water, Air, Earth. Strategic battles.</p>
                <span className="mt-4 inline-block text-arena-red text-sm font-semibold">Play →</span>
              </motion.div>
            </Link>

            <Link to="/ruleta">
              <motion.div
                className="rounded-2xl border-2 border-emerald/30 bg-charcoal/90 backdrop-blur p-8 text-center hover:border-emerald hover:shadow-emerald-glow transition-all duration-300 h-full flex flex-col items-center justify-center min-h-[220px]"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="rounded-xl bg-emerald/10 p-4 mb-4 border border-emerald/20">
                  <RouletteIcon className="w-12 h-12 text-emerald" />
                </div>
                <h2 className="font-display text-2xl text-emerald tracking-wider uppercase mb-2">Roulette</h2>
                <p className="text-gray-400 text-sm">Palenque Roulette. Jaguar, Eagle, Serpent, Fire, Skull.</p>
                <span className="mt-4 inline-block text-emerald text-sm font-semibold">Play →</span>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}

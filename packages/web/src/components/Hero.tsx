import { motion } from "framer-motion";

const LOGO_SRC = "/logogallos.png";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-96 bg-gradient-to-b from-gold/15 via-gold/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-arena-red/5 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold/30 rounded-full"
            style={{
              left: `${10 + i * 7}%`,
              top: `${20 + (i % 5) * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
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
          className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          High-stakes rooster battles on-chain.
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <a
            href="#arena"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-obsidian bg-gold hover:bg-gold/90 shadow-gold-glow hover:shadow-[0_0_40px_rgba(255,184,0,0.6)] transition-all duration-300 hover:scale-[1.02]"
          >
            Enter Arena
          </a>
          <a
            href="#arena"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-gold border-2 border-gold bg-transparent hover:bg-gold/10 shadow-[0_0_20px_rgba(255,184,0,0.2)] transition-all duration-300 hover:scale-[1.02]"
          >
            Watch Live Match
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

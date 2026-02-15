import { motion } from "framer-motion";

interface LiveOddsProps {
  pA: bigint;
  pB: bigint;
  roosterA: string;
  roosterB: string;
}

export function LiveOdds({ pA, pB, roosterA, roosterB }: LiveOddsProps) {
  const pAPercent = (Number(pA) / 1e6 * 100);
  const pBPercent = (Number(pB) / 1e6 * 100);

  return (
    <motion.div
      className="rounded-2xl overflow-hidden border-2 border-gold/30 bg-gradient-to-b from-emerald/20 to-emerald/5 shadow-[0_0_30px_rgba(10,94,74,0.15)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h4 className="px-6 py-4 font-display text-gold tracking-[0.15em] uppercase border-b border-gold/20 bg-black/20">
        Current Odds
      </h4>
      <div className="grid grid-cols-2 gap-4 p-6">
        <motion.div
          className="rounded-xl p-6 text-center bg-charcoal/60 border border-gold/20 hover:border-gold/50 hover:shadow-[0_0_20px_rgba(255,184,0,0.15)] transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <p className="font-display text-lg text-white mb-2">{roosterA}</p>
          <p className="font-numeric text-4xl font-bold text-gold">{pAPercent.toFixed(1)}%</p>
          <div className="mt-3 h-2 rounded-full bg-black/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${pAPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
        <motion.div
          className="rounded-xl p-6 text-center bg-charcoal/60 border border-gold/20 hover:border-gold/50 hover:shadow-[0_0_20px_rgba(255,184,0,0.15)] transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <p className="font-display text-lg text-white mb-2">{roosterB}</p>
          <p className="font-numeric text-4xl font-bold text-gold">{pBPercent.toFixed(1)}%</p>
          <div className="mt-3 h-2 rounded-full bg-black/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${pBPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";

interface SettledMatchDetailsProps {
  roosterA: string;
  roosterB: string;
  winner: "A" | "B";
  poolA: bigint;
  poolB: bigint;
  boostA: bigint;
  boostB: bigint;
}

export function SettledMatchDetails({
  roosterA,
  roosterB,
  winner,
  poolA,
  poolB,
  boostA,
  boostB,
}: SettledMatchDetailsProps) {
  const totalPool = poolA + poolB;
  const totalBoosts = boostA + boostB;
  const winningRooster = winner === "A" ? roosterA : roosterB;
  const losingRooster = winner === "A" ? roosterB : roosterA;

  // Format MON (divide by 1e18)
  const formatMon = (val: bigint) => (Number(val) / 1e18).toFixed(2);
  // Format PAL (divide by 1e18)
  const formatPal = (val: bigint) => (Number(val) / 1e18).toFixed(2);

  return (
    <motion.div
      className="rounded-xl border-2 border-emerald/40 bg-gradient-to-br from-charcoal/95 to-black/80 p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Winner */}
      <div className="text-center space-y-2">
        <motion.div
          className="inline-block px-4 py-2 bg-emerald/20 border border-emerald/40 rounded-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-emerald font-semibold text-sm">🏆 MATCH COMPLETE</p>
        </motion.div>
        <h3 className="text-3xl font-display text-gold tracking-wider">{winningRooster}</h3>
        <p className="text-gray-400 text-sm">defeated {losingRooster}</p>
      </div>

      {/* Pool Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-black/40 p-4 border border-white/5">
          <p className="text-gray-500 text-sm mb-1">Team A Bets</p>
          <p className="text-white font-semibold text-lg">{formatMon(poolA)} MON</p>
          <p className="text-gray-600 text-xs mt-2">Boosts: {formatPal(boostA)} PAL</p>
        </div>

        <div className="rounded-lg bg-black/40 p-4 border border-white/5">
          <p className="text-gray-500 text-sm mb-1">Team B Bets</p>
          <p className="text-white font-semibold text-lg">{formatMon(poolB)} MON</p>
          <p className="text-gray-600 text-xs mt-2">Boosts: {formatPal(boostB)} PAL</p>
        </div>
      </div>

      {/* Total Pool */}
      <div className="rounded-lg bg-gradient-to-r from-gold/20 to-gold/10 p-4 border border-gold/30">
        <p className="text-gray-400 text-sm mb-2">Total Pool (MON + PAL Value)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gold font-display tracking-wider text-2xl">{formatMon(totalPool)}</p>
            <p className="text-gray-500 text-xs">MON Wagered</p>
          </div>
          <div>
            <p className="text-cyan-300 font-semibold text-xl">{formatPal(totalBoosts)}</p>
            <p className="text-gray-500 text-xs">PAL Boosted</p>
          </div>
        </div>
      </div>

      {/* Action Required */}
      <motion.div
        className="text-center pt-4 border-t border-white/10"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-gray-400 text-sm">
          ↓ Scroll down to claim your payout ↓
        </p>
      </motion.div>
    </motion.div>
  );
}

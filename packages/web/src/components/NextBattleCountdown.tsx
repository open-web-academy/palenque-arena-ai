import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";

/** Seconds after closeTime when the next match is expected to open (operator creates it in the next tick). */
const NEXT_BATTLE_OFFSET_SEC = 20;

interface NextBattleCountdownProps {
  closeTime: bigint;
  onExpired?: () => void;
}

export function NextBattleCountdown({ closeTime, onExpired }: NextBattleCountdownProps) {
  const targetTime = closeTime + BigInt(NEXT_BATTLE_OFFSET_SEC);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const diff = Number(targetTime - now);
      if (diff <= 0) {
        setSeconds(0);
        onExpired?.();
        clearInterval(interval);
      } else {
        setSeconds(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime, onExpired]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <motion.div
      className="rounded-xl px-6 py-4 bg-charcoal/60 border border-gold/20 flex items-center justify-center gap-3"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Swords className="w-5 h-5 text-gold/80 shrink-0" />
      <p className="text-gray-300 text-sm md:text-base">
        Siguiente batalla en{" "}
        <span className="font-numeric font-semibold text-gold">
          {mins}m {secs}s
        </span>
      </p>
    </motion.div>
  );
}

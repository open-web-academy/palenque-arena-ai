import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  closeTime: bigint;
  onExpired?: () => void;
}

export function CountdownTimer({ closeTime, onExpired }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const diff = Number(closeTime - now);
      if (diff <= 0) {
        setSeconds(0);
        onExpired?.();
        clearInterval(interval);
      } else {
        setSeconds(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [closeTime, onExpired]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isCritical = seconds > 0 && seconds <= 30;

  return (
    <motion.div
      className={`rounded-xl px-8 py-5 text-center ${
        isCritical
          ? "bg-arena-red/10 border-2 border-arena-red shadow-red-glow"
          : "bg-charcoal/80 border-2 border-gold/30"
      }`}
      animate={isCritical ? { scale: [1, 1.01, 1] } : {}}
      transition={{ duration: 1, repeat: isCritical ? Infinity : 0 }}
    >
      <p className={`font-numeric text-3xl md:text-4xl font-bold ${isCritical ? "text-arena-red" : "text-gold"}`}>
        {mins}m {secs}s remaining
      </p>
    </motion.div>
  );
}

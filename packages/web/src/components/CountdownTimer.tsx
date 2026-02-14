import { useEffect, useState } from "react";

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

  return (
    <div className="countdown">
      <p>{mins}m {secs}s remaining</p>
    </div>
  );
}

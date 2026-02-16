import { useState, useEffect, useCallback } from "react";

export const RULETA_SYMBOLS = ["Jaguar", "Eagle", "Serpent", "Fire", "Skull"];
const ROUND_DURATION_SEC = 60;

export interface RuletaRoundState {
  roundId: number;
  state: number;
  closeTime: bigint;
  winningSymbol: number;
  pools: bigint[];
  userBets: bigint[];
}

export function useRuletaDemo() {
  const [round, setRound] = useState<RuletaRoundState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startNewRound = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    setRound({
      roundId: 0,
      state: 0,
      closeTime: BigInt(now + ROUND_DURATION_SEC),
      winningSymbol: 0,
      pools: [0n, 0n, 0n, 0n, 0n],
      userBets: [0n, 0n, 0n, 0n, 0n],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  useEffect(() => {
    if (!round || round.state !== 0) return;
    const nowSec = () => Math.floor(Date.now() / 1000);
    const closeSec = Number(round.closeTime);
    const t = setTimeout(() => {
      setRound((r) => {
        if (!r || r.state !== 0) return r;
        if (nowSec() < Number(r.closeTime)) return r;
        const winner = Math.floor(Math.random() * 5);
        return { ...r, state: 2, winningSymbol: winner };
      });
    }, Math.max(100, (closeSec - nowSec() + 1) * 1000));
    return () => clearTimeout(t);
  }, [round?.state, round?.closeTime]);

  const placeBet = useCallback((symbolIndex: number, amountWei: bigint) => {
    setRound((r) => {
      if (!r || r.state !== 0) return r;
      const newPools = [...r.pools];
      newPools[symbolIndex] += amountWei;
      const newUserBets = [...r.userBets];
      newUserBets[symbolIndex] += amountWei;
      return { ...r, pools: newPools, userBets: newUserBets };
    });
  }, []);

  const claimAndStartNew = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    setRound({
      roundId: 0,
      state: 0,
      closeTime: BigInt(now + ROUND_DURATION_SEC),
      winningSymbol: 0,
      pools: [0n, 0n, 0n, 0n, 0n],
      userBets: [0n, 0n, 0n, 0n, 0n],
    });
  }, []);

  return { round, symbols: RULETA_SYMBOLS, loading, error, isDemo: true, placeBet, claimAndStartNew };
}

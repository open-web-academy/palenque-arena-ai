import { useState, useEffect, useCallback } from "react";

const ELEMENTS = ["Fire", "Water", "Air", "Earth"];
const ROUND_DURATION_SEC = 60;

export interface ElementalMatchState {
  address: string;
  state: number;
  closeTime: bigint;
  betPools: bigint[];
  winnerElement: number;
  userBets: bigint[];
  odds: bigint[];
}

export function useElementalDemo() {
  const [match, setMatch] = useState<ElementalMatchState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startNewRound = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    const closeTime = BigInt(now + ROUND_DURATION_SEC);
    setMatch({
      address: "0x-demo",
      state: 0,
      closeTime,
      betPools: [0n, 0n, 0n, 0n],
      winnerElement: 0,
      userBets: [0n, 0n, 0n, 0n],
      odds: [250000n, 250000n, 250000n, 250000n],
    });
  }, []);

  useEffect(() => {
    startNewRound();
    setLoading(false);
  }, [startNewRound]);

  useEffect(() => {
    if (!match || match.state !== 0) return;
    const nowSec = () => Math.floor(Date.now() / 1000);
    const closeSec = Number(match.closeTime);
    if (nowSec() >= closeSec) {
      setMatch((m) => {
        if (!m || m.state !== 0) return m;
        const total = m.betPools.reduce((a, b) => a + b, 0n);
        const winner = total > 0n ? Number(BigInt(Math.floor(Math.random() * 4)) % 4n) : Math.floor(Math.random() * 4);
        return { ...m, state: 2, winnerElement: winner };
      });
      return;
    }
    const t = setTimeout(() => {
      setMatch((m) => {
        if (!m || m.state !== 0) return m;
        const now = nowSec();
        if (now < Number(m.closeTime)) return m;
        const winner = Math.floor(Math.random() * 4);
        return { ...m, state: 2, winnerElement: winner };
      });
    }, (closeSec - nowSec() + 1) * 1000);
    return () => clearTimeout(t);
  }, [match?.state, match?.closeTime]);

  const placeBet = useCallback((elementIndex: number, amountWei: bigint) => {
    setMatch((m) => {
      if (!m || m.state !== 0) return m;
      const newPools = [...m.betPools];
      newPools[elementIndex] += amountWei;
      const total = newPools.reduce((a, b) => a + b, 0n);
      const odds = newPools.map((p) => (total > 0n ? (p * 1000000n) / total : 250000n));
      const newUserBets = [...m.userBets];
      newUserBets[elementIndex] += amountWei;
      return {
        ...m,
        betPools: newPools,
        userBets: newUserBets,
        odds: odds as [bigint, bigint, bigint, bigint],
      };
    });
  }, []);

  const claimAndStartNew = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    setMatch({
      address: "0x-demo",
      state: 0,
      closeTime: BigInt(now + ROUND_DURATION_SEC),
      betPools: [0n, 0n, 0n, 0n],
      winnerElement: 0,
      userBets: [0n, 0n, 0n, 0n],
      odds: [250000n, 250000n, 250000n, 250000n],
    });
  }, []);

  return { match, elements: ELEMENTS, loading, error, isDemo: true, placeBet, claimAndStartNew };
}

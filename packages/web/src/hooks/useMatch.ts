import { useEffect, useState, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http, parseAbi } from "viem";
import { monad } from "viem/chains";

const FACTORY_ABI = parseAbi([
  "function matchCount() view returns (uint256)",
  "function getLastMatch() view returns (address)",
]);

const MATCH_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function roosterA() view returns (string)",
  "function roosterB() view returns (string)",
  "function closeTime() view returns (uint256)",
  "function betPoolA() view returns (uint256)",
  "function betPoolB() view returns (uint256)",
  "function boostPoolA() view returns (uint256)",
  "function boostPoolB() view returns (uint256)",
  "function currentOdds() view returns (uint256 pA, uint256 pB)",
  "function winnerA() view returns (bool)",
  "function betsA(address) view returns (uint256)",
  "function betsB(address) view returns (uint256)",
]);

export interface Match {
  address: string;
  roosterA: string;
  roosterB: string;
  state: number;
  closeTime: bigint;
  betPoolA: bigint;
  betPoolB: bigint;
  boostPoolA: bigint;
  boostPoolB: bigint;
  winnerA?: boolean;
  userBetA?: bigint;
  userBetB?: bigint;
}

export interface Odds {
  pA: bigint;
  pB: bigint;
}

const POLL_OPEN_MS = 12000;   // 12s when match is open
const POLL_OTHER_MS = 6000;   // 6s when closed/settled so we pick up the next OPEN match quickly
const POLL_NO_MATCH_MS = 10000; // 10s when no match (recover faster when operator creates one)
const POLL_ERROR_MS = 15000; // 15s retry after error
const BACKOFF_AFTER_429_MS = 60000; // 1 min backoff after rate limit

function is429(e: unknown): boolean {
  const s = String(e ?? "");
  return s.includes("429") || s.includes("Too Many Requests") || s.includes("rate limit");
}

export function useMatch() {
  const { address: userAddress } = useAccount();
  const [match, setMatch] = useState<Match | null>(null);
  const [odds, setOdds] = useState<Odds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backoffUntil = useRef<number>(0);
  const fetchRef = useRef<() => void>(() => {});

  const rpcUrl = import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz";
  const factoryAddress = import.meta.env.VITE_FACTORY_ADDRESS;

  const refetch = useCallback(() => {
    backoffUntil.current = 0;
    fetchRef.current();
  }, []);

  useEffect(() => {
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    if (!factoryAddress || factoryAddress === zeroAddress) {
      setError("Set VITE_FACTORY_ADDRESS in .env (packages/web).");
      setLoading(false);
      return;
    }

    const publicClient = createPublicClient({
      chain: monad,
      transport: http(rpcUrl),
    });

    let pollTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const scheduleNext = (state?: number, afterError?: boolean) => {
      const now = Date.now();
      let delay: number;
      if (now < backoffUntil.current) {
        delay = backoffUntil.current - now;
      } else if (afterError) {
        delay = POLL_ERROR_MS;
      } else if (state === undefined || state === -1) {
        delay = POLL_NO_MATCH_MS;
      } else if (state === 0) {
        delay = POLL_OPEN_MS;
      } else {
        delay = POLL_OTHER_MS;
      }
      pollTimeout = setTimeout(() => fetchMatch(), delay);
    };

    const fetchMatch = async () => {
      if (!isMounted) return;
      if (Date.now() < backoffUntil.current) {
        scheduleNext(match?.state);
        return;
      }

      try {
        // 1 RPC: matchCount only (getLastMatch reverts when count=0)
        const count = (await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "matchCount",
        })) as bigint;

        if (count === 0n) {
          if (isMounted) {
            setMatch(null);
            setOdds(null);
            setError(null);
            setLoading(false);
          }
          scheduleNext(-1);
          return;
        }

        // 1 RPC: getLastMatch
        const matchAddr = (await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "getLastMatch",
        })) as string;

        if (!matchAddr || matchAddr === zeroAddress) {
          if (isMounted) {
            setMatch(null);
            setOdds(null);
            setError(null);
            setLoading(false);
          }
          scheduleNext(-1);
          return;
        }

        // 1 RPC: all match reads in one multicall (instead of 10–12 separate calls)
        const baseCalls = [
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "state" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "roosterA" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "roosterB" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "closeTime" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "betPoolA" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "betPoolB" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "boostPoolA" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "boostPoolB" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "currentOdds" as const },
          { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "winnerA" as const },
        ];
        const withUser = userAddress
          ? [
              ...baseCalls,
              { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "betsA" as const, args: [userAddress as `0x${string}`] },
              { address: matchAddr as `0x${string}`, abi: MATCH_ABI, functionName: "betsB" as const, args: [userAddress as `0x${string}`] },
            ]
          : baseCalls;

        const results = await publicClient.multicall({
          contracts: withUser as any,
          allowFailure: false,
        });

        const state = results[0] as number;
        const roosterA = results[1] as string;
        const roosterB = results[2] as string;
        const closeTime = results[3] as bigint;
        const betPoolA = results[4] as bigint;
        const betPoolB = results[5] as bigint;
        const boostPoolA = results[6] as bigint;
        const boostPoolB = results[7] as bigint;
        const oddsResult = results[8] as [bigint, bigint];
        const winnerA = results[9] as boolean;
        const userBetA = userAddress ? (results[10] as bigint) : undefined;
        const userBetB = userAddress ? (results[11] as bigint) : undefined;

        const matchPayload: Match = {
          address: matchAddr,
          roosterA,
          roosterB,
          state,
          closeTime,
          betPoolA,
          betPoolB,
          boostPoolA,
          boostPoolB,
          winnerA,
        };
        if (userBetA !== undefined) matchPayload.userBetA = userBetA;
        if (userBetB !== undefined) matchPayload.userBetB = userBetB;

        if (isMounted) {
          setMatch(matchPayload);
          setOdds({ pA: oddsResult[0], pB: oddsResult[1] });
          setError(null);
          setLoading(false);
        }
        scheduleNext(state);
      } catch (err) {
        if (!isMounted) return;
        setLoading(false);
        if (is429(err)) {
          backoffUntil.current = Date.now() + BACKOFF_AFTER_429_MS;
          setError("RPC rate limit (429). Use an RPC with API key in VITE_RPC_URL or wait 1 minute.");
        } else {
          setError(String(err));
        }
        scheduleNext(match?.state, true);
      }
    };

    fetchRef.current = () => fetchMatch();
    fetchMatch();

    return () => {
      isMounted = false;
      clearTimeout(pollTimeout);
    };
  }, [factoryAddress, rpcUrl, userAddress]);

  return { match, odds, loading, error, refetch };
}

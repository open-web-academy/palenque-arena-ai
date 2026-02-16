import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http, parseAbi } from "viem";
import { monad } from "viem/chains";

const ELEMENTAL_FACTORY_ABI = parseAbi([
  "function matchCount() view returns (uint256)",
  "function getLastMatch() view returns (address)",
]);

const ELEMENTAL_MATCH_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function closeTime() view returns (uint256)",
  "function betPool(uint256) view returns (uint256)",
  "function winnerElement() view returns (uint256)",
  "function currentOdds(uint256) view returns (uint256)",
  "function bets(address, uint256) view returns (uint256)",
]);

const ELEMENTS = ["Fire", "Water", "Air", "Earth"];
const POLL_MS = 12000;
const BACKOFF_429_MS = 60000;

function is429(e: unknown): boolean {
  const s = String(e ?? "");
  return s.includes("429") || s.includes("rate limit");
}

export interface ElementalMatchState {
  address: string;
  state: number;
  closeTime: bigint;
  betPools: bigint[];
  winnerElement: number;
  userBets: bigint[];
  odds: bigint[];
}

export function useElementalMatch() {
  const { address: userAddress } = useAccount();
  const [match, setMatch] = useState<ElementalMatchState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backoffUntil = useRef(0);

  const rpcUrl = import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz";
  const factoryAddress = import.meta.env.VITE_ELEMENTAL_FACTORY_ADDRESS;

  useEffect(() => {
    if (!factoryAddress || factoryAddress === "0x0000000000000000000000000000000000000000") {
      setError("VITE_ELEMENTAL_FACTORY_ADDRESS not set. Deploy Elemental contracts and set in .env.");
      setLoading(false);
      return;
    }

    const publicClient = createPublicClient({
      chain: monad,
      transport: http(rpcUrl),
    });

    let timeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const fetchMatch = async () => {
      if (!isMounted) return;
      if (Date.now() < backoffUntil.current) {
        timeout = setTimeout(fetchMatch, BACKOFF_429_MS);
        return;
      }

      try {
        const count = (await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: ELEMENTAL_FACTORY_ABI,
          functionName: "matchCount",
        })) as bigint;

        if (count === 0n) {
          setMatch(null);
          setLoading(false);
          timeout = setTimeout(fetchMatch, POLL_MS);
          return;
        }

        const matchAddr = (await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: ELEMENTAL_FACTORY_ABI,
          functionName: "getLastMatch",
        })) as string;

        const [state, closeTime, pool0, pool1, pool2, pool3, winnerElement, odds0, odds1, odds2, odds3] = await Promise.all([
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "state" }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "closeTime" }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "betPool", args: [0n] }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "betPool", args: [1n] }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "betPool", args: [2n] }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "betPool", args: [3n] }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "winnerElement" }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "currentOdds", args: [0n] }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "currentOdds", args: [1n] }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "currentOdds", args: [2n] }),
          publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "currentOdds", args: [3n] }),
        ]);

        let userBets: bigint[] = [0n, 0n, 0n, 0n];
        if (userAddress) {
          userBets = await Promise.all([
            publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "bets", args: [userAddress, 0n] }),
            publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "bets", args: [userAddress, 1n] }),
            publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "bets", args: [userAddress, 2n] }),
            publicClient.readContract({ address: matchAddr as `0x${string}`, abi: ELEMENTAL_MATCH_ABI, functionName: "bets", args: [userAddress, 3n] }),
          ]);
        }

        setMatch({
          address: matchAddr,
          state: Number(state),
          closeTime: closeTime as bigint,
          betPools: [pool0 as bigint, pool1 as bigint, pool2 as bigint, pool3 as bigint],
          winnerElement: Number(winnerElement),
          userBets,
          odds: [odds0 as bigint, odds1 as bigint, odds2 as bigint, odds3 as bigint],
        });
        setError(null);
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          if (is429(err)) {
            backoffUntil.current = Date.now() + BACKOFF_429_MS;
            setError("RPC rate limit. Wait 1 minute or use API key.");
          } else setError(String(err));
        }
      }
      setLoading(false);
      if (isMounted) timeout = setTimeout(fetchMatch, POLL_MS);
    };

    fetchMatch();
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [factoryAddress, rpcUrl, userAddress]);

  return { match, elements: ELEMENTS, loading, error };
}

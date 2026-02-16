import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http, parseAbi } from "viem";
import { monad } from "viem/chains";

const RULETA_ABI = parseAbi([
  "function roundCount() view returns (uint256)",
  "function roundState(uint256) view returns (uint8)",
  "function closeTime(uint256) view returns (uint256)",
  "function winningSymbol(uint256) view returns (uint256)",
  "function getPool(uint256 roundId, uint256 symbol) view returns (uint256)",
  "function getMyBet(uint256 roundId, address user, uint256 symbol) view returns (uint256)",
]);

export const RULETA_SYMBOLS = ["Jaguar", "Eagle", "Serpent", "Fire", "Skull"];
const POLL_MS = 12000;
const BACKOFF_429_MS = 60000;

function is429(e: unknown): boolean {
  const s = String(e ?? "");
  return s.includes("429") || s.includes("rate limit");
}

export interface RuletaRoundState {
  roundId: number;
  state: number;
  closeTime: bigint;
  winningSymbol: number;
  pools: bigint[];
  userBets: bigint[];
}

export function useRuleta() {
  const { address: userAddress } = useAccount();
  const [round, setRound] = useState<RuletaRoundState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backoffUntil = useRef(0);

  const rpcUrl = import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz";
  const ruletaAddress = import.meta.env.VITE_RULETA_ADDRESS;

  useEffect(() => {
    if (!ruletaAddress || ruletaAddress === "0x0000000000000000000000000000000000000000") {
      setError("VITE_RULETA_ADDRESS not set. Deploy Ruleta contract and set in .env.");
      setLoading(false);
      return;
    }

    const publicClient = createPublicClient({
      chain: monad,
      transport: http(rpcUrl),
    });

    let timeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const fetchRound = async () => {
      if (!isMounted) return;
      if (Date.now() < backoffUntil.current) {
        timeout = setTimeout(fetchRound, BACKOFF_429_MS);
        return;
      }

      try {
        const count = (await publicClient.readContract({
          address: ruletaAddress as `0x${string}`,
          abi: RULETA_ABI,
          functionName: "roundCount",
        })) as bigint;

        const n = Number(count);
        if (n === 0) {
          setRound(null);
          setLoading(false);
          timeout = setTimeout(fetchRound, POLL_MS);
          return;
        }

        const roundId = n - 1;
        const [state, closeTime, winningSymbol, pool0, pool1, pool2, pool3, pool4] = await Promise.all([
          publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "roundState", args: [BigInt(roundId)] }),
          publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "closeTime", args: [BigInt(roundId)] }),
          publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "winningSymbol", args: [BigInt(roundId)] }),
          publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getPool", args: [BigInt(roundId), 0n] }),
          publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getPool", args: [BigInt(roundId), 1n] }),
          publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getPool", args: [BigInt(roundId), 2n] }),
          publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getPool", args: [BigInt(roundId), 3n] }),
          publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getPool", args: [BigInt(roundId), 4n] }),
        ]);

        let userBets: bigint[] = [0n, 0n, 0n, 0n, 0n];
        if (userAddress) {
          userBets = await Promise.all([
            publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getMyBet", args: [BigInt(roundId), userAddress, 0n] }),
            publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getMyBet", args: [BigInt(roundId), userAddress, 1n] }),
            publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getMyBet", args: [BigInt(roundId), userAddress, 2n] }),
            publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getMyBet", args: [BigInt(roundId), userAddress, 3n] }),
            publicClient.readContract({ address: ruletaAddress as `0x${string}`, abi: RULETA_ABI, functionName: "getMyBet", args: [BigInt(roundId), userAddress, 4n] }),
          ]);
        }

        setRound({
          roundId,
          state: Number(state),
          closeTime: closeTime as bigint,
          winningSymbol: Number(winningSymbol),
          pools: [pool0 as bigint, pool1 as bigint, pool2 as bigint, pool3 as bigint, pool4 as bigint],
          userBets,
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
      if (isMounted) timeout = setTimeout(fetchRound, POLL_MS);
    };

    fetchRound();
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [ruletaAddress, rpcUrl, userAddress]);

  return { round, symbols: RULETA_SYMBOLS, loading, error };
}

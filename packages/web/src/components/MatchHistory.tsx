import { useState, useEffect, useRef } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { monad } from "viem/chains";
import { motion } from "framer-motion";
import { Trophy, Clock, AlertCircle } from "lucide-react";

const MATCH_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function roosterA() view returns (string)",
  "function roosterB() view returns (string)",
  "function winnerA() view returns (bool)",
  "function betPoolA() view returns (uint256)",
  "function betPoolB() view returns (uint256)",
  "function boostPoolA() view returns (uint256)",
  "function boostPoolB() view returns (uint256)",
]);

const FACTORY_ABI = parseAbi([
  "function matchCount() view returns (uint256)",
  "function matches(uint256) view returns (address)",
]);

interface MatchRecord {
  address: string;
  roosterA: string;
  roosterB: string;
  state: number;
  winner?: string;
  poolA: bigint;
  poolB: bigint;
  boostA: bigint;
  boostB: bigint;
}

const LAST_N = 5;
const HISTORY_POLL_MS = 60000; // 1 min to avoid hammering public RPC
const RPC_TIMEOUT_MS = 15000;
const BACKOFF_AFTER_RATE_LIMIT_MS = 90000; // 1.5 min after 429/timeout

function isRateLimitOrTimeout(e: unknown): boolean {
  const s = String(e ?? "").toLowerCase();
  return s.includes("429") || s.includes("too many") || s.includes("rate limit") || s.includes("timeout") || s.includes("took too long");
}

export function MatchHistory() {
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [rpcError, setRpcError] = useState<string | null>(null);
  const backoffUntil = useRef<number>(0);

  useEffect(() => {
    const rpcUrl = import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz";
    const factoryAddress = import.meta.env.VITE_FACTORY_ADDRESS;
    if (!factoryAddress) return;

    const publicClient = createPublicClient({
      chain: monad,
      transport: http(rpcUrl, { timeout: RPC_TIMEOUT_MS }),
    });

    const fetchHistory = async () => {
      if (Date.now() < backoffUntil.current) return;
      try {
        setRpcError(null);
        const matchCount = (await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "matchCount",
        })) as bigint;

        const total = Number(matchCount);
        if (total === 0) {
          setHistory([]);
          return;
        }

        const start = Math.max(0, total - LAST_N);
        const count = Math.min(LAST_N, total - start);

        const matchAddrs = await publicClient.multicall({
          contracts: Array.from({ length: count }, (_, i) => ({
            address: factoryAddress as `0x${string}`,
            abi: FACTORY_ABI,
            functionName: "matches" as const,
            args: [BigInt(start + i)] as const,
          })),
          allowFailure: false,
        }) as string[];

        const allCalls = matchAddrs.flatMap((addr) => [
          { address: addr as `0x${string}`, abi: MATCH_ABI, functionName: "state" as const },
          { address: addr as `0x${string}`, abi: MATCH_ABI, functionName: "roosterA" as const },
          { address: addr as `0x${string}`, abi: MATCH_ABI, functionName: "roosterB" as const },
          { address: addr as `0x${string}`, abi: MATCH_ABI, functionName: "winnerA" as const },
          { address: addr as `0x${string}`, abi: MATCH_ABI, functionName: "betPoolA" as const },
          { address: addr as `0x${string}`, abi: MATCH_ABI, functionName: "betPoolB" as const },
          { address: addr as `0x${string}`, abi: MATCH_ABI, functionName: "boostPoolA" as const },
          { address: addr as `0x${string}`, abi: MATCH_ABI, functionName: "boostPoolB" as const },
        ]);
        const results = await publicClient.multicall({ contracts: allCalls, allowFailure: false });

        const records: MatchRecord[] = [];
        for (let i = 0; i < matchAddrs.length; i++) {
          const base = i * 8;
          const state = results[base] as number;
          const roosterA = results[base + 1] as string;
          const roosterB = results[base + 2] as string;
          const winnerA = results[base + 3] as boolean;
          const poolA = results[base + 4] as bigint;
          const poolB = results[base + 5] as bigint;
          const boostA = results[base + 6] as bigint;
          const boostB = results[base + 7] as bigint;
          records.push({
            address: matchAddrs[i],
            roosterA,
            roosterB,
            state: Number(state),
            winner: state === 2 ? (winnerA ? roosterA : roosterB) : undefined,
            poolA,
            poolB,
            boostA,
            boostB,
          });
        }
        setHistory(records.reverse());
      } catch (error) {
        if (isRateLimitOrTimeout(error)) {
          backoffUntil.current = Date.now() + BACKOFF_AFTER_RATE_LIMIT_MS;
          setRpcError("RPC rate limit or timeout. History will retry in ~1 min. Use an RPC with API key in VITE_RPC_URL to avoid this.");
        } else {
          setRpcError("Could not load history.");
        }
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, HISTORY_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mt-12" id="history">
      <h2 className="section-title">Last 5 matches</h2>
      {rpcError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{rpcError}</span>
        </div>
      )}
      {history.length === 0 && !rpcError ? (
        <p className="text-gray-500 py-8 text-center">No matches yet.</p>
      ) : history.length === 0 ? null : (
        <ul className="space-y-2 max-w-2xl mx-auto list-none p-0 m-0">
          {history.map((m, i) => (
            <motion.li
              key={m.address}
              className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-charcoal/80 border border-gold/20"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className={`font-medium truncate ${m.winner === m.roosterA ? "text-emerald" : "text-gray-400"}`}
                >
                  {m.roosterA}
                </span>
                <span className="text-arena-red font-bold text-xs flex-shrink-0">VS</span>
                <span
                  className={`font-medium truncate ${m.winner === m.roosterB ? "text-emerald" : "text-gray-400"}`}
                >
                  {m.roosterB}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 text-sm">
                {m.winner ? (
                  <>
                    <Trophy className="w-4 h-4 text-gold" />
                    <span className="text-gold font-semibold">Winner: {m.winner}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-500">Pending</span>
                  </>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}

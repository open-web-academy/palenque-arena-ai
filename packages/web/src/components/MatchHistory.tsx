import { useState, useEffect } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { monad } from "viem/chains";
import { motion } from "framer-motion";

const MATCH_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function roosterA() view returns (string)",
  "function roosterB() view returns (string)",
  "function winnerA() view returns (bool)",
  "function poolA() view returns (uint256)",
  "function poolB() view returns (uint256)",
  "function totalBoostA() view returns (uint256)",
  "function totalBoostB() view returns (uint256)",
]);

const FACTORY_ABI = parseAbi([
  "function matchCount() view returns (uint256)",
  "function matches(uint256) view returns (address)",
]);

interface MatchRecord {
  address: string;
  roosterA: string;
  roosterB: string;
  winner?: string;
  poolA: bigint;
  poolB: bigint;
  boostA: bigint;
  boostB: bigint;
}

export function MatchHistory() {
  const [history, setHistory] = useState<MatchRecord[]>([]);

  useEffect(() => {
    const publicClient = createPublicClient({
      chain: monad,
      transport: http(import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz"),
    });

    const fetchHistory = async () => {
      try {
        const factoryAddress = import.meta.env.VITE_FACTORY_ADDRESS;
        if (!factoryAddress) return;

        const matchCount = (await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "matchCount",
        })) as bigint;

        const records: MatchRecord[] = [];
        const limit = Math.min(Number(matchCount), 10);

        for (let i = Math.max(0, Number(matchCount) - limit); i < Number(matchCount); i++) {
          const matchAddr = (await publicClient.readContract({
            address: factoryAddress as `0x${string}`,
            abi: FACTORY_ABI,
            functionName: "matches",
            args: [BigInt(i)],
          })) as string;

          const [state, roosterA, roosterB, winnerA, poolA, poolB, boostA, boostB] = await Promise.all([
            publicClient.readContract({
              address: matchAddr as `0x${string}`,
              abi: MATCH_ABI,
              functionName: "state",
            }),
            publicClient.readContract({
              address: matchAddr as `0x${string}`,
              abi: MATCH_ABI,
              functionName: "roosterA",
            }),
            publicClient.readContract({
              address: matchAddr as `0x${string}`,
              abi: MATCH_ABI,
              functionName: "roosterB",
            }),
            publicClient.readContract({
              address: matchAddr as `0x${string}`,
              abi: MATCH_ABI,
              functionName: "winnerA",
            }),
            publicClient.readContract({
              address: matchAddr as `0x${string}`,
              abi: MATCH_ABI,
              functionName: "poolA",
            }),
            publicClient.readContract({
              address: matchAddr as `0x${string}`,
              abi: MATCH_ABI,
              functionName: "poolB",
            }),
            publicClient.readContract({
              address: matchAddr as `0x${string}`,
              abi: MATCH_ABI,
              functionName: "totalBoostA",
            }),
            publicClient.readContract({
              address: matchAddr as `0x${string}`,
              abi: MATCH_ABI,
              functionName: "totalBoostB",
            }),
          ]) as [number, string, string, boolean, bigint, bigint, bigint, bigint];

          records.push({
            address: matchAddr,
            roosterA,
            roosterB,
            winner: state === 2 ? (winnerA ? roosterA : roosterB) : undefined,
            poolA,
            poolB,
            boostA,
            boostB,
          });
        }

        setHistory(records.reverse());
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  if (history.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="section-title">Match History</h2>
        <div className="flex overflow-x-auto gap-6 pb-4 scroll-snap-x scroll-smooth">
          <p className="text-gray-500 py-8">No matches yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="section-title">Match History</h2>
      <div className="flex overflow-x-auto gap-6 pb-4 scroll-snap-x scroll-smooth snap-x snap-mandatory -mx-2 px-2">
        {history.map((m, i) => {
          const totalPool = (m.poolA + m.poolB) / BigInt(1e16);
          return (
            <motion.div
              key={m.address}
              className="flex-shrink-0 w-72 snap-start rounded-xl overflow-hidden border-2 border-gold/20 bg-charcoal/90 hover:border-gold/50 hover:shadow-gold-glow transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <div className="p-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center justify-between gap-2 text-sm mb-2">
                  <span className={m.winner === m.roosterA ? "text-emerald font-semibold" : "text-gray-400"}>{m.roosterA}</span>
                  <span className="text-arena-red font-bold text-xs">VS</span>
                  <span className={m.winner === m.roosterB ? "text-emerald font-semibold" : "text-gray-400"}>{m.roosterB}</span>
                </div>
              </div>
              <div className="p-4 space-y-2 text-xs">
                {m.winner && (
                  <div className="mb-3 pb-3 border-b border-gold/20">
                    <p className="text-gray-400">🏆 Winner</p>
                    <p className="font-display text-gold tracking-wider">{m.winner}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500">Team A Bets</p>
                    <p className="text-white font-semibold">{(m.poolA / BigInt(1e16)).toString()} MON</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Team B Bets</p>
                    <p className="text-white font-semibold">{(m.poolB / BigInt(1e16)).toString()} MON</p>
                  </div>
                  <div>
                    <p className="text-gray-500">A Boosts</p>
                    <p className="text-cyan-300 text-xs">{(m.boostA / BigInt(1e16)).toString()} PAL</p>
                  </div>
                  <div>
                    <p className="text-gray-500">B Boosts</p>
                    <p className="text-cyan-300 text-xs">{(m.boostB / BigInt(1e16)).toString()} PAL</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gold/20">
                  <p className="text-gold font-semibold text-center">Pool: {totalPool.toString()} MON</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

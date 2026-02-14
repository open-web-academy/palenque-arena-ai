import { useState, useEffect } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { monad } from "viem/chains";

const MATCH_ABI = parseAbi([
  "function roosterA() view returns (string)",
  "function roosterB() view returns (string)",
  "function winnerA() view returns (bool)",
  "event Settled(bool indexed winnerIsA)",
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
}

export function MatchHistory() {
  const [history, setHistory] = useState<MatchRecord[]>([]);

  useEffect(() => {
    const publicClient = createPublicClient({
      chain: monad,
      transport: http(process.env.REACT_APP_RPC_URL || "https://rpc.monad.xyz"),
    });

    const fetchHistory = async () => {
      try {
        const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS;
        if (!factoryAddress) return;

        const matchCount = (await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "matchCount",
        })) as bigint;

        const records: MatchRecord[] = [];
        const limit = Math.min(Number(matchCount), 10); // Last 10 matches

        for (let i = Math.max(0, Number(matchCount) - limit); i < Number(matchCount); i++) {
          const matchAddr = (await publicClient.readContract({
            address: factoryAddress as `0x${string}`,
            abi: FACTORY_ABI,
            functionName: "matches",
            args: [BigInt(i)],
          })) as string;

          const [roosterA, roosterB, winnerA] = await Promise.all([
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
          ]) as any;

          records.push({
            address: matchAddr,
            roosterA,
            roosterB,
            winner: winnerA ? roosterA : roosterB,
          });
        }

        setHistory(records.reverse());
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (history.length === 0) {
    return <div className="match-history"><p>No match history yet</p></div>;
  }

  return (
    <div className="match-history">
      <h4>Recent Matches</h4>
      {history.map(m => (
        <div key={m.address} className="history-item">
          <p>{m.roosterA} vs {m.roosterB}</p>
          {m.winner && <p className="winner">✓ {m.winner}</p>}
        </div>
      ))}
    </div>
  );
}

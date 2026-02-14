import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { monad } from "viem/chains";

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

    // Placeholder: In production, fetch from indexer or contract logs
    const fetchHistory = async () => {
      try {
        const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS;
        if (!factoryAddress) return;

        // TODO: Implement proper history fetching from contract events
        setHistory([]);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
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
          {m.winner && <p className="winner">Winner: {m.winner}</p>}
        </div>
      ))}
    </div>
  );
}

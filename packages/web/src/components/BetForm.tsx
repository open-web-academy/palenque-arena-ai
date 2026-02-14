import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import "./BetForm.css";

const MATCH_ABI = parseAbi([
  "function betOn(bool isA) payable",
]);

interface BetFormProps {
  matchAddress: string | null;
  matchState: number;
  roosterA: string;
  roosterB: string;
}

export function BetForm({ matchAddress, matchState, roosterA, roosterB }: BetFormProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleBet = async (isA: boolean) => {
    if (!amount || !matchAddress || !address) return;
    
    const monAmount = BigInt(parseFloat(amount) * 1e18);
    writeContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "betOn",
      args: [isA],
      value: monAmount,
    });
  };

  const isDisabled = matchState !== 0 || !address || isPending || isConfirming;

  return (
    <div className="bet-form">
      <h3>Place Your Bet (MON)</h3>
      <input
        type="number"
        placeholder="Amount in MON"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isDisabled}
        step="0.01"
      />
      <div className="buttons">
        <button
          onClick={() => { setSelected("A"); handleBet(true); }}
          disabled={isDisabled || !amount}
          className={selected === "A" ? "active" : ""}
        >
          Bet on {roosterA}
        </button>
        <button
          onClick={() => { setSelected("B"); handleBet(false); }}
          disabled={isDisabled || !amount}
          className={selected === "B" ? "active" : ""}
        >
          Bet on {roosterB}
        </button>
      </div>
      {isPending && <p className="status">Signing transaction...</p>}
      {isConfirming && <p className="status">Confirming on chain...</p>}
      {hash && <p className="success">Bet placed! tx: {hash.slice(0, 6)}</p>}
    </div>
  );
}

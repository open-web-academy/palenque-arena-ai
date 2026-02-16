import { useState } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";

const MATCH_ABI = parseAbi(["function betOn(bool isA) payable"]);

interface SideBetFormProps {
  isA: boolean;
  roosterName: string;
  matchAddress: string;
  matchState: number;
  variant: "gold" | "red";
}

export function SideBetForm({ isA, roosterName, matchAddress, matchState, variant }: SideBetFormProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [amount, setAmount] = useState("");
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const monAmount = amount ? BigInt(Math.floor(parseFloat(amount) * 1e18)) : 0n;
  const insufficientBalance = balance ? monAmount > balance.value : false;
  const isDisabled = matchState !== 0 || !address || isPending || isConfirming || insufficientBalance || !amount;

  const handleBet = () => {
    if (!amount || !matchAddress || !address || insufficientBalance) return;
    writeContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "betOn",
      args: [isA],
      value: monAmount,
    });
  };

  const btnClass =
    variant === "gold"
      ? "bg-gold text-obsidian hover:bg-gold/90 shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed"
      : "bg-arena-red text-white hover:bg-arena-red/90 shadow-red-glow disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col gap-2 w-full mt-3">
      <input
        type="number"
        placeholder="MON"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={matchState !== 0 || !address}
        step="0.01"
        min="0"
        className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gold/20 text-white text-sm font-mono placeholder-gray-500 focus:border-gold focus:outline-none"
      />
      <button
        onClick={handleBet}
        disabled={isDisabled}
        className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${btnClass}`}
      >
        Bet on {roosterName}
      </button>
      {isPending && <p className="text-xs text-gray-400">Confirm in wallet…</p>}
      {isConfirming && <p className="text-xs text-gold">Confirming…</p>}
      {isError && <p className="text-xs text-arena-red">{error?.message ?? "Error"}</p>}
      {hash && <p className="text-xs text-emerald">Done. TX: {hash.slice(0, 8)}…</p>}
    </div>
  );
}

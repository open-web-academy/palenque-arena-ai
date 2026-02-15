import { useState } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { motion } from "framer-motion";

const MATCH_ABI = parseAbi([
  "function betOn(bool isA) payable",
]);

interface BetFormProps {
  matchAddress: string | null;
  matchState: number;
  roosterA: string;
  roosterB: string;
  betPoolA?: bigint;
  betPoolB?: bigint;
}

export function BetForm({ matchAddress, matchState, roosterA, roosterB, betPoolA = 0n, betPoolB = 0n }: BetFormProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const monAmount = amount ? BigInt(Math.floor(parseFloat(amount) * 1e18)) : 0n;
  const insufficientBalance = balance ? monAmount > balance.value : false;

  const totalPool = betPoolA + betPoolB;
  const estPayoutA = totalPool > 0n && betPoolA > 0n && selected === "A" && monAmount > 0n
    ? (monAmount * totalPool) / betPoolA
    : null;
  const estPayoutB = totalPool > 0n && betPoolB > 0n && selected === "B" && monAmount > 0n
    ? (monAmount * totalPool) / betPoolB
    : null;
  const estPayout = estPayoutA ?? estPayoutB;

  const handleBet = async (isA: boolean) => {
    if (!amount || !matchAddress || !address || insufficientBalance) return;
    writeContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "betOn",
      args: [isA],
      value: monAmount,
    });
  };

  const isDisabled = matchState !== 0 || !address || isPending || isConfirming || insufficientBalance;

  return (
    <motion.div
      className="rounded-2xl border-2 border-gold/30 bg-gradient-to-b from-charcoal to-charcoal/80 p-8 shadow-[0_0_30px_rgba(255,184,0,0.08)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="font-display text-gold tracking-[0.15em] uppercase mb-4">Place Bet</h3>
      {balance && (
        <p className="text-sm text-gray-400 mb-4">Available: <strong className="text-gold">{(Number(balance.value) / 1e18).toFixed(2)} MON</strong></p>
      )}
      <input
        type="number"
        placeholder="Amount in MON"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={matchState !== 0 || !address}
        step="0.01"
        min="0"
        className="w-full px-4 py-3 rounded-xl bg-obsidian border-2 border-gold/20 text-white font-mono placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all mb-4"
      />
      {estPayout !== null && (
        <p className="text-sm text-gray-400 mb-4">Est. payout: <span className="font-numeric text-gold font-semibold">{(Number(estPayout) / 1e18).toFixed(2)} MON</span></p>
      )}
      {insufficientBalance && <p className="text-arena-red text-sm mb-4">Insufficient balance</p>}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => { setSelected("A"); handleBet(true); }}
          disabled={isDisabled || !amount}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
            selected === "A"
              ? "bg-gold text-obsidian shadow-gold-glow"
              : "bg-gold/90 text-obsidian hover:bg-gold hover:shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          BET ON {roosterA.toUpperCase()}
        </button>
        <button
          onClick={() => { setSelected("B"); handleBet(false); }}
          disabled={isDisabled || !amount}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
            selected === "B"
              ? "bg-arena-red text-white shadow-red-glow"
              : "bg-arena-red/90 text-white hover:bg-arena-red hover:shadow-red-glow disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          BET ON {roosterB.toUpperCase()}
        </button>
      </div>
      {isPending && <p className="text-sm text-gray-400 mt-4">Confirm in wallet…</p>}
      {isConfirming && <p className="text-sm text-gold mt-4">Confirming…</p>}
      {isError && <p className="text-arena-red text-sm mt-4">{error?.message ?? "Transaction failed"}</p>}
      {hash && <p className="text-emerald text-sm mt-4">Bet placed. TX: {hash.slice(0, 10)}…</p>}
    </motion.div>
  );
}

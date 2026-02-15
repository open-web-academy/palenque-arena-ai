import { useState } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const PAL_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
]);

const MATCH_ABI = parseAbi([
  "function boost(bool isA, uint256 amount)",
]);

interface BoostFormProps {
  matchAddress: string | null;
  matchState: number;
  roosterA: string;
  roosterB: string;
  palTokenAddress: string;
}

export function BoostForm({
  matchAddress,
  matchState,
  roosterA,
  roosterB,
  palTokenAddress,
}: BoostFormProps) {
  const { address } = useAccount();
  const { data: palBalance } = useBalance({
    address,
    token: palTokenAddress ? (palTokenAddress as `0x${string}`) : undefined,
  });
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [step, setStep] = useState<"approve" | "boost">("approve");
  const { writeContract: approve, data: approveTx, isPending: approvePending, isError: approveError, error: approveErr } = useWriteContract();
  const { writeContract: boost, data: boostTx, isPending: boostPending, isError: boostError, error: boostErr } = useWriteContract();
  const { isLoading: approveConfirming } = useWaitForTransactionReceipt({ hash: approveTx });
  const { isLoading: boostConfirming } = useWaitForTransactionReceipt({ hash: boostTx });

  const palAmount = amount ? BigInt(Math.floor(parseFloat(amount) * 1e18)) : 0n;
  const insufficientPal = palBalance ? palAmount > palBalance.value : false;

  const handleApprove = async () => {
    if (!amount || !address) return;
    const palAmount = BigInt(parseFloat(amount) * 1e18);
    approve({
      address: palTokenAddress as `0x${string}`,
      abi: PAL_ABI,
      functionName: "approve",
      args: [matchAddress as `0x${string}`, palAmount],
    });
  };

  const handleBoost = async (isA: boolean) => {
    if (!amount || !matchAddress) return;
    const palAmount = BigInt(parseFloat(amount) * 1e18);
    boost({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "boost",
      args: [isA, palAmount],
    });
  };

  const isDisabled = matchState !== 0 || !address;

  return (
    <motion.div
      className="rounded-2xl border-2 border-arena-red/40 bg-gradient-to-b from-charcoal to-charcoal/80 p-8 shadow-[0_0_30px_rgba(255,61,61,0.1)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <h3 className="font-display text-arena-red tracking-[0.15em] uppercase mb-2 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Boost with PAL
      </h3>
      <p className="text-sm text-gray-500 mb-4">Boost your fighter with PAL power.</p>
      {palBalance && (
        <p className="text-sm text-gray-400 mb-4">Available: <strong className="text-gold">{(Number(palBalance.value) / 1e18).toFixed(2)} PAL</strong></p>
      )}
      <input
        type="number"
        placeholder="Amount in PAL"
        className="w-full px-4 py-3 rounded-xl bg-obsidian border-2 border-gold/20 text-white font-mono placeholder-gray-500 focus:border-arena-red focus:outline-none focus:ring-2 focus:ring-arena-red/30 transition-all mb-4"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isDisabled}
        step="0.01"
        min="0"
      />
      {insufficientPal && <p className="text-arena-red text-sm mb-4">Insufficient PAL balance</p>}

      {step === "approve" && (
        <>
          <button
            onClick={handleApprove}
            disabled={isDisabled || !amount || insufficientPal || approvePending || approveConfirming}
            className="w-full px-6 py-4 rounded-xl font-semibold bg-arena-red text-white hover:bg-arena-red/90 shadow-red-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {approveConfirming ? "Approving…" : "Approve PAL"}
          </button>
          {approveError && <p className="text-arena-red text-sm mt-4">{approveErr?.message ?? "Error"}</p>}
          {approveTx && (
            <button
              onClick={() => setStep("boost")}
              className="w-full mt-3 px-6 py-3 rounded-xl font-semibold border-2 border-gold text-gold hover:bg-gold/10 transition-all"
            >
              Next: Boost
            </button>
          )}
        </>
      )}

      {step === "boost" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { setSelected("A"); handleBoost(true); }}
            disabled={isDisabled || !amount || boostPending || boostConfirming}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
              selected === "A" ? "bg-gold text-obsidian shadow-gold-glow" : "bg-arena-red/90 text-white hover:bg-arena-red disabled:opacity-50"
            }`}
          >
            Boost {roosterA}
          </button>
          <button
            onClick={() => { setSelected("B"); handleBoost(false); }}
            disabled={isDisabled || !amount || boostPending || boostConfirming}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
              selected === "B" ? "bg-gold text-obsidian shadow-gold-glow" : "bg-arena-red/90 text-white hover:bg-arena-red disabled:opacity-50"
            }`}
          >
            Boost {roosterB}
          </button>
        </div>
      )}

      {boostError && <p className="text-arena-red text-sm mt-4">{boostErr?.message ?? "Boost failed"}</p>}
      {boostTx && <p className="text-emerald text-sm mt-4">Boost sent. TX: {boostTx.slice(0, 10)}…</p>}
    </motion.div>
  );
}

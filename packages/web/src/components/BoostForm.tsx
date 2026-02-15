// packages/web/src/components/BoostForm.tsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseAbi, parseUnits } from "viem";

import { ApprovalModal } from "./ApprovalModal";

const PAL_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);

const MATCH_ABI = parseAbi(["function boost(bool isA, uint256 amount)"]);

type Step = "approve" | "boost";

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

  const [step, setStep] = useState<Step>("approve");
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [amount, setAmount] = useState<string>(""); // user input (PAL)
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Basic guards
  const disabledByState = matchState !== 0; // adjust if your OPEN state differs (0 assumed = OPEN)

  // Parse PAL amount (18 decimals assumed)
  const palAmount = useMemo(() => {
    try {
      if (!amount) return 0n;
      return parseUnits(amount, 18);
    } catch {
      return 0n;
    }
  }, [amount]);

  // Read user PAL balance (for "insufficientPal")
  const { data: palBal } = useBalance({
    address,
    token: palTokenAddress ? (palTokenAddress as `0x${string}`) : undefined,
    query: { enabled: !!address && !!palTokenAddress },
  });

  const insufficientPal =
    palAmount > 0n && palBal?.value !== undefined ? palBal.value < palAmount : false;

  // Allowance check (Step 4)
  const { data: allowance } = useReadContract({
    address: palTokenAddress as `0x${string}`,
    abi: PAL_ABI,
    functionName: "allowance",
    args: address && matchAddress ? [address, matchAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!matchAddress && !!palTokenAddress && step === "boost",
    },
  });

  const isAllowanceEnough =
    allowance !== undefined && palAmount > 0n ? allowance >= palAmount : false;

  // Boost TX (write)
  const { writeContract, data: boostHash, isPending: boostPending } = useWriteContract();

  const { isLoading: boostConfirming } = useWaitForTransactionReceipt({
    hash: boostHash,
    query: { enabled: !!boostHash },
  });

  const isDisabled =
    disabledByState || !address || !matchAddress || !palTokenAddress || boostPending || boostConfirming;

  const handleApprove = () => {
    if (isDisabled) return;
    if (!amount || palAmount <= 0n) return;
    if (insufficientPal) return;
    setShowApprovalModal(true);
  };

  const handleBoost = (isA: boolean) => {
    if (isDisabled) return;
    if (!amount || palAmount <= 0n) return;
    if (!matchAddress) return;
    if (!isAllowanceEnough) return;

    writeContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "boost",
      args: [isA, palAmount],
    });
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gold/20 bg-black/40 p-5 shadow-gold-glow"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-xl bg-gold/10 p-2 border border-gold/20">
            <Zap className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Boost (PAL)</h3>
            <p className="text-sm text-white/70">
              Approve PAL once, then boost either fighter.
            </p>
          </div>
        </div>

        {/* Amount input */}
        <div className="space-y-2 mb-4">
          <label className="text-sm text-white/80">PAL amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            inputMode="decimal"
            className="w-full rounded-xl bg-black/60 border border-gold/20 px-4 py-3 text-white outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
            disabled={isDisabled}
          />
          {insufficientPal && (
            <p className="text-sm text-red-400">Insufficient PAL balance.</p>
          )}
          {disabledByState && (
            <p className="text-sm text-white/60">Boosting is only available while betting is open.</p>
          )}
        </div>

        {/* Step: Approve */}
        {step === "approve" && (
          <div className="space-y-3">
            <button
              onClick={handleApprove}
              disabled={isDisabled || !amount || palAmount <= 0n || insufficientPal}
              className="w-full px-6 py-4 rounded-xl font-semibold bg-arena-red text-white hover:bg-arena-red/90 shadow-red-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Approve PAL
            </button>

            <p className="text-xs text-white/60">
              This will allow the match contract to spend your PAL for boosting.
            </p>
          </div>
        )}

        {/* Step: Boost */}
        {step === "boost" && (
          <div className="space-y-3">
            {palAmount <= 0n ? (
              <p className="text-gold">Enter an amount to continue.</p>
            ) : !isAllowanceEnough ? (
              <p className="text-gold">Re-checking allowance...</p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSelected("A");
                    handleBoost(true);
                  }}
                  disabled={isDisabled || !amount || palAmount <= 0n || insufficientPal}
                  className={`flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all ${
                    selected === "A" ? "bg-arena-red" : "bg-arena-red/90 hover:bg-arena-red"
                  }`}
                >
                  Boost {roosterA}
                </button>

                <button
                  onClick={() => {
                    setSelected("B");
                    handleBoost(false);
                  }}
                  disabled={isDisabled || !amount || palAmount <= 0n || insufficientPal}
                  className={`flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all ${
                    selected === "B" ? "bg-arena-red" : "bg-arena-red/90 hover:bg-arena-red"
                  }`}
                >
                  Boost {roosterB}
                </button>
              </div>
            )}

            {(boostPending || boostConfirming) && (
              <p className="text-sm text-white/70">Boost transaction pending...</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Approval modal */}
      <ApprovalModal
        palTokenAddress={palTokenAddress as `0x${string}`}
        matchAddress={matchAddress as `0x${string}`}
        amount={palAmount}
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onSuccess={() => {
          // Move to boost step after successful approve
          setShowApprovalModal(false);
          setStep("boost");
        }}


      />
    </div>
  );
}


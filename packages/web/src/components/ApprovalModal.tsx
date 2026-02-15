import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";

const PAL_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
]);

interface ApprovalModalProps {
  palTokenAddress: `0x${string}`;
  matchAddress: `0x${string}`;
  amount: bigint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApprovalModal({
  palTokenAddress,
  matchAddress,
  amount,
  isOpen,
  onClose,
  onSuccess,
}: ApprovalModalProps) {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: confirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  if (!isOpen) return null;

  if (isSuccess) {
    onSuccess();
    return null;
  }

  const handleApprove = () => {
    writeContract({
      address: palTokenAddress,
      abi: PAL_ABI,
      functionName: "approve",
      args: [matchAddress, amount],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[420px] rounded-2xl border border-gold/25 bg-black/90 p-6 shadow-gold-glow">
        <h3 className="text-lg font-semibold text-white">Approve PAL</h3>
        <p className="mt-2 text-sm text-white/70">
          Allow the match contract to use your PAL tokens for boosting.
        </p>

        {isError && (
          <p className="mt-3 text-sm text-red-400">Approval failed. Please retry.</p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-semibold text-white hover:bg-white/15 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleApprove}
            disabled={isPending || confirming || amount <= 0n}
            className="flex-1 rounded-xl bg-arena-red px-4 py-3 font-semibold text-white hover:bg-arena-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isPending || confirming ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

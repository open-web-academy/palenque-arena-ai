import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const MATCH_ABI = parseAbi([
  "function claimPayout()",
]);

interface PayoutClaimProps {
  matchAddress: string | null;
  matchState: number;
  winner: "A" | "B" | null;
  winnerName?: string;
  userHasWinningBet: boolean;
}

export function PayoutClaim({
  matchAddress,
  matchState,
  winner,
  winnerName,
  userHasWinningBet,
}: PayoutClaimProps) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleClaim = async () => {
    if (!matchAddress || !address) return;
    writeContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "claimPayout",
    });
  };

  if (matchState !== 2) {
    return <div className="rounded-xl bg-charcoal/50 border border-bronze p-6 text-center text-gray-400"><p>Match not settled yet</p></div>;
  }

  return (
    <motion.div
      className="rounded-2xl border-2 border-emerald/50 bg-gradient-to-b from-emerald/10 to-charcoal/80 p-8 shadow-emerald-glow"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="font-display text-emerald tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6" />
        Payout
      </h3>
      <p className="text-gray-300 mb-4">Match settled! Winner: <strong className="text-gold">{winnerName ?? winner}</strong></p>
      {userHasWinningBet ? (
        <>
          <p className="text-emerald font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            You have a winning bet!
          </p>
          <button
            onClick={handleClaim}
            disabled={isPending || isConfirming || !address}
            className="px-8 py-4 rounded-xl font-semibold bg-gold text-obsidian hover:bg-gold/90 shadow-gold-glow disabled:opacity-50 transition-all"
          >
            {isConfirming ? "Claiming..." : "Claim Winnings"}
          </button>
          {hash && <p className="text-emerald text-sm mt-4">Claimed! tx: {hash.slice(0, 6)}…</p>}
        </>
      ) : (
        <p className="text-gray-500">No winning bet on this rooster</p>
      )}
    </motion.div>
  );
}

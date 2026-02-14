import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";

const MATCH_ABI = parseAbi([
  "function claimPayout()",
]);

interface PayoutClaimProps {
  matchAddress: string | null;
  matchState: number;
  winner: "A" | "B" | null;
  userHasWinningBet: boolean;
}

export function PayoutClaim({
  matchAddress,
  matchState,
  winner,
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
    return <div className="payout"><p>Match not settled yet</p></div>;
  }

  return (
    <div className="payout">
      <h3>Payout</h3>
      <p>Match settled! Winner: <strong>{winner}</strong></p>
      {userHasWinningBet ? (
        <>
          <p className="winning">🎉 You have a winning bet!</p>
          <button
            onClick={handleClaim}
            disabled={isPending || isConfirming || !address}
            className="claim-button"
          >
            {isConfirming ? "Claiming..." : "Claim Winnings"}
          </button>
          {hash && <p className="success">Claimed! tx: {hash.slice(0, 6)}</p>}
        </>
      ) : (
        <p className="losing">No winning bet on this rooster</p>
      )}
    </div>
  );
}

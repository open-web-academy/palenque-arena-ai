import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";

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
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [step, setStep] = useState<"approve" | "boost">("approve");
  const { writeContract: approve, data: approveTx, isPending: approvePending } = useWriteContract();
  const { writeContract: boost, data: boostTx, isPending: boostPending } = useWriteContract();
  const { isLoading: approveConfirming } = useWaitForTransactionReceipt({ hash: approveTx });
  const { isLoading: boostConfirming } = useWaitForTransactionReceipt({ hash: boostTx });

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
    <div className="boost-form">
      <h3>Boost Your Rooster (PAL)</h3>
      <input
        type="number"
        placeholder="Amount in PAL"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isDisabled}
        step="0.01"
      />
      <p className="note">⚠️ First approve PAL, then boost</p>

      {step === "approve" && (
        <>
          <button
            onClick={handleApprove}
            disabled={isDisabled || !amount || approvePending || approveConfirming}
          >
            {approveConfirming ? "Approving..." : "Approve PAL"}
          </button>
          {approveTx && (
            <button
              onClick={() => setStep("boost")}
              className="next-button"
            >
              Next: Boost
            </button>
          )}
        </>
      )}

      {step === "boost" && (
        <div className="buttons">
          <button
            onClick={() => {
              setSelected("A");
              handleBoost(true);
            }}
            disabled={isDisabled || !amount || boostPending || boostConfirming}
            className={selected === "A" ? "active" : ""}
          >
            Boost {roosterA}
          </button>
          <button
            onClick={() => {
              setSelected("B");
              handleBoost(false);
            }}
            disabled={isDisabled || !amount || boostPending || boostConfirming}
            className={selected === "B" ? "active" : ""}
          >
            Boost {roosterB}
          </button>
        </div>
      )}

      {boostTx && <p className="success">Boost sent! tx: {boostTx.slice(0, 6)}</p>}
    </div>
  );
}

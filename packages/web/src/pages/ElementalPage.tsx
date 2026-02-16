import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Droplets, Wind, Mountain, ArrowLeft, Loader2, Trophy } from "lucide-react";
import { useElementalMatch } from "../hooks/useElementalMatch";
import { useElementalDemo } from "../hooks/useElementalDemo";
import { CountdownTimer } from "../components/CountdownTimer";

const ELEMENTAL_MATCH_ABI = parseAbi([
  "function betOn(uint256 element) payable",
  "function claimPayout()",
]);

const ELEMENT_ICONS = [Flame, Droplets, Wind, Mountain];
const ELEMENT_COLORS = ["text-orange-500", "text-blue-400", "text-cyan-300", "text-amber-700"];

const hasElementalContract = !!import.meta.env.VITE_ELEMENTAL_FACTORY_ADDRESS;

export function ElementalPage() {
  const real = useElementalMatch();
  const demo = useElementalDemo();
  const isDemo = !hasElementalContract;
  const { match, elements, loading, error } = isDemo ? demo : real;

  const [refreshKey, setRefreshKey] = useState(0);
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: betHash, isPending: betPending, isError: betError, error: betErr } = useWriteContract();
  const { isLoading: betConfirming } = useWaitForTransactionReceipt({ hash: betHash });
  const { writeContract: writeClaim, data: claimHash, isPending: claimPending } = useWriteContract();
  const { isLoading: claimConfirming } = useWaitForTransactionReceipt({ hash: claimHash });

  const [amount, setAmount] = useState("");
  const monAmount = amount ? BigInt(Math.floor(parseFloat(amount) * 1e18)) : 0n;
  const insufficientBalance = !isDemo && balance ? monAmount > balance.value : false;
  const canBet = match?.state === 0 && (isDemo ? monAmount > 0n : (address && !betPending && !betConfirming && !insufficientBalance && monAmount > 0n));
  const winnerName = match && match.state === 2 ? elements[match.winnerElement] : null;
  const userWon = match && match.state === 2 && match.userBets[match.winnerElement] > 0n;
  const totalPool = match?.betPools.reduce((a, b) => a + b, 0n) ?? 0n;
  const userWinShare = userWon && match && match.betPools[match.winnerElement] > 0n
    ? (match.userBets[match.winnerElement] * totalPool) / match.betPools[match.winnerElement]
    : 0n;

  const handleBet = (elementIndex: number) => {
    if (!canBet || !match) return;
    if (isDemo) {
      (demo as any).placeBet(elementIndex, monAmount);
      setAmount("");
    } else {
      writeContract({
        address: match.address as `0x${string}`,
        abi: ELEMENTAL_MATCH_ABI,
        functionName: "betOn",
        args: [BigInt(elementIndex)],
        value: monAmount,
      });
    }
  };

  const handleClaim = () => {
    if (!userWon) return;
    if (isDemo) {
      (demo as any).claimAndStartNew();
    } else if (match?.address) {
      writeClaim({
        address: match.address as `0x${string}`,
        abi: ELEMENTAL_MATCH_ABI,
        functionName: "claimPayout",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-16 pt-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="text-gray-400 hover:text-gold transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl md:text-3xl text-arena-red tracking-wider uppercase">Elemental</h1>
        {isDemo && (
          <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40">Simulated</span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-8">
        Bet MON on Fire, Water, Air, or Earth. One element wins at random each round.
      </p>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="load" className="flex flex-col items-center justify-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="w-12 h-12 text-arena-red animate-spin mb-4" />
            <p className="text-gray-400">Loading round…</p>
          </motion.div>
        )}
        {error && !isDemo && (
          <motion.div key="err" className="rounded-xl bg-arena-red/10 border border-arena-red p-6 text-center text-arena-red">
            {error}
          </motion.div>
        )}
        {!loading && !match && !error && (
          <motion.div key="empty" className="rounded-xl bg-charcoal/80 border border-gold/20 p-12 text-center text-gray-400">
            No active round. {isDemo ? "Starting…" : "The operator creates one every ~60s."}
          </motion.div>
        )}
        {match && !loading && (
          <motion.div key="match" className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {match.state === 0 && (
              <CountdownTimer closeTime={match.closeTime} onExpired={() => setRefreshKey((k) => k + 1)} />
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {elements.map((name, i) => {
                const Icon = ELEMENT_ICONS[i];
                const pool = match.betPools[i];
                const odds = match.odds[i] ? (Number(match.odds[i]) / 1e4).toFixed(1) : "25";
                const isWinner = match.state === 2 && match.winnerElement === i;
                return (
                  <motion.div
                    key={name}
                    className={`rounded-2xl border-2 p-6 text-center transition-all ${
                      isWinner ? "border-emerald shadow-emerald-glow bg-emerald/10" : "border-gold/20 bg-charcoal/80 hover:border-gold/40"
                    }`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Icon className={`w-12 h-12 mx-auto mb-2 ${ELEMENT_COLORS[i]}`} />
                    <h3 className="font-display text-lg text-white uppercase">{name}</h3>
                    <p className="text-sm text-gray-400 mt-1">Pool: {(Number(pool) / 1e18).toFixed(2)} MON</p>
                    <p className="text-xs text-gold mt-0.5">{odds}%</p>
                    {match.state === 0 && (
                      <button
                        onClick={() => handleBet(i)}
                        disabled={!canBet}
                        className="mt-4 w-full py-2 rounded-lg font-semibold bg-arena-red/80 hover:bg-arena-red text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Bet on {name}
                      </button>
                    )}
                    {match.state === 2 && isWinner && (
                      <p className="mt-4 text-emerald font-semibold flex items-center justify-center gap-1">
                        <Trophy className="w-4 h-4" /> Winner
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {match.state === 0 && (
              <div className="rounded-2xl border border-gold/20 bg-charcoal/80 p-6">
                <p className="text-sm text-gray-400 mb-2">Amount (MON){isDemo ? " — simulated" : ""}</p>
                <input
                  type="number"
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full max-w-xs px-4 py-3 rounded-xl bg-obsidian border border-gold/20 text-white font-mono focus:border-gold outline-none"
                />
                {!isDemo && balance && <p className="text-xs text-gray-500 mt-2">Balance: {(Number(balance.value) / 1e18).toFixed(2)} MON</p>}
                {!isDemo && insufficientBalance && <p className="text-arena-red text-sm mt-2">Insufficient balance</p>}
                {(betPending || betConfirming) && !isDemo && <p className="text-gold text-sm mt-2">Confirm in wallet…</p>}
                {betError && <p className="text-arena-red text-sm mt-2">{betErr?.message ?? "Tx failed"}</p>}
              </div>
            )}

            {match.state === 2 && winnerName && (
              <div className="rounded-2xl border-2 border-emerald/50 bg-emerald/10 p-8 text-center">
                <h3 className="font-display text-xl text-emerald uppercase mb-2">Round settled</h3>
                <p className="text-white text-lg">Winner: <strong className="text-gold">{winnerName}</strong></p>
                {userWon && (
                  <>
                    <p className="text-gray-400 mt-2">Your share: {(Number(userWinShare) / 1e18).toFixed(2)} MON {isDemo && "(simulated)"}</p>
                    <button
                      onClick={handleClaim}
                      disabled={!isDemo && (claimPending || claimConfirming)}
                      className="mt-6 px-8 py-4 rounded-xl font-semibold bg-gold text-obsidian hover:bg-gold/90 disabled:opacity-50"
                    >
                      {isDemo ? "Next round" : (claimPending || claimConfirming ? "Claiming…" : "Claim Winnings")}
                    </button>
                    {!isDemo && claimHash && <p className="text-emerald text-sm mt-4">Claimed. TX: {claimHash.slice(0, 10)}…</p>}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

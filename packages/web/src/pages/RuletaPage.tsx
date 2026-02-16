import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { useRuleta } from "../hooks/useRuleta";
import { useRuletaDemo } from "../hooks/useRuletaDemo";
import { CountdownTimer } from "../components/CountdownTimer";

const RULETA_ABI = parseAbi([
  "function placeBet(uint256 roundId, uint256 symbol) payable",
  "function claimPayout(uint256 roundId)",
]);

const SYMBOL_COLORS = ["#E8B923", "#4A90D9", "#2ECC71", "#E74C3C", "#8E44AD"];

const hasRuletaContract = !!import.meta.env.VITE_RULETA_ADDRESS;

export function RuletaPage() {
  const real = useRuleta();
  const demo = useRuletaDemo();
  const isDemo = !hasRuletaContract;
  const { round, symbols, loading, error } = isDemo ? demo : real;

  const [refreshKey, setRefreshKey] = useState(0);
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: betHash, isPending: betPending, isError: betError, error: betErr } = useWriteContract();
  const { isLoading: betConfirming } = useWaitForTransactionReceipt({ hash: betHash });
  const { writeContract: writeClaim, data: claimHash, isPending: claimPending } = useWriteContract();
  const { isLoading: claimConfirming } = useWaitForTransactionReceipt({ hash: claimHash });

  const [amount, setAmount] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<number | null>(null);
  const monAmount = amount ? BigInt(Math.floor(parseFloat(amount) * 1e18)) : 0n;
  const insufficientBalance = !isDemo && balance ? monAmount > balance.value : false;
  const ruletaAddress = import.meta.env.VITE_RULETA_ADDRESS;
  const canBet = round?.state === 0 && (isDemo ? (monAmount > 0n && selectedSymbol !== null) : (address && !betPending && !betConfirming && !insufficientBalance && monAmount > 0n && selectedSymbol !== null));
  const userWon = round && round.state === 2 && round.userBets[round.winningSymbol] > 0n;
  const totalPool = round?.pools.reduce((a, b) => a + b, 0n) ?? 0n;
  const winPool = round && round.pools[round.winningSymbol] > 0n ? round.pools[round.winningSymbol] : 1n;
  const userWinShare = userWon && round ? (round.userBets[round.winningSymbol] * totalPool) / winPool : 0n;

  const handleBet = () => {
    if (!canBet || round === null || selectedSymbol === null) return;
    if (isDemo) {
      (demo as any).placeBet(selectedSymbol, monAmount);
      setAmount("");
    } else if (ruletaAddress) {
      writeContract({
        address: ruletaAddress as `0x${string}`,
        abi: RULETA_ABI,
        functionName: "placeBet",
        args: [BigInt(round.roundId), BigInt(selectedSymbol)],
        value: monAmount,
      });
    }
  };

  const handleClaim = () => {
    if (!userWon) return;
    if (isDemo) {
      (demo as any).claimAndStartNew();
    } else if (ruletaAddress && round) {
      writeClaim({
        address: ruletaAddress as `0x${string}`,
        abi: RULETA_ABI,
        functionName: "claimPayout",
        args: [BigInt(round.roundId)],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16 pt-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="text-gray-400 hover:text-gold transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl md:text-3xl text-emerald tracking-wider uppercase">Roulette</h1>
        {isDemo && (
          <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40">Simulated</span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-8">
        Palenque Roulette. Bet MON on a symbol. When the round closes, the wheel resolves. Match the result to win.
      </p>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="load" className="flex flex-col items-center justify-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="w-12 h-12 text-emerald animate-spin mb-4" />
            <p className="text-gray-400">Loading round…</p>
          </motion.div>
        )}
        {error && !isDemo && (
          <motion.div key="err" className="rounded-xl bg-arena-red/10 border border-arena-red p-6 text-center text-arena-red">
            {error}
          </motion.div>
        )}
        {!loading && !round && !error && (
          <motion.div key="empty" className="rounded-xl bg-charcoal/80 border border-gold/20 p-12 text-center text-gray-400">
            No active round. {isDemo ? "Starting…" : "The operator starts one every ~60s."}
          </motion.div>
        )}
        {round && !loading && (
          <motion.div key="round" className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {round.state === 0 && (
              <CountdownTimer closeTime={round.closeTime} onExpired={() => setRefreshKey((k) => k + 1)} />
            )}

            <div className="flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-gold/40 overflow-hidden"
                  style={{ background: `conic-gradient(${symbols.map((_, i) => `${SYMBOL_COLORS[i]} ${(i * 360) / 5}deg ${((i + 1) * 360) / 5}deg`).join(", ")})` }}
                  animate={round.state === 2 ? { rotate: 360 * 3 + (round.winningSymbol * 360) / 5 + 36 } : {}}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-obsidian border-4 border-gold flex items-center justify-center">
                    {round.state === 2 ? (
                      <span className="font-display text-lg text-gold uppercase">{symbols[round.winningSymbol]}</span>
                    ) : (
                      <span className="text-gray-500 text-xs">?</span>
                    )}
                  </div>
                </div>
                {symbols.map((name, i) => (
                  <div
                    key={name}
                    className="absolute text-xs font-semibold text-white mix-blend-difference"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `rotate(${(i * 360) / 5 + 36}deg) translateY(-70%)`,
                    }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            {round.state === 0 && (
              <div className="rounded-2xl border border-gold/20 bg-charcoal/80 p-6 space-y-4">
                <p className="text-sm text-gray-400">Choose symbol and amount (MON){isDemo ? " — simulated" : ""}</p>
                <div className="flex flex-wrap gap-2">
                  {symbols.map((name, i) => (
                    <button
                      key={name}
                      onClick={() => setSelectedSymbol(i)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedSymbol === i
                          ? "ring-2 ring-gold bg-gold/20 text-gold"
                          : "bg-obsidian border border-gold/20 text-gray-300 hover:border-gold/50"
                      }`}
                      style={selectedSymbol === i ? { borderColor: SYMBOL_COLORS[i] } : {}}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full max-w-xs px-4 py-3 rounded-xl bg-obsidian border border-gold/20 text-white font-mono focus:border-gold outline-none"
                />
                {!isDemo && balance && <p className="text-xs text-gray-500">Balance: {(Number(balance.value) / 1e18).toFixed(2)} MON</p>}
                {!isDemo && insufficientBalance && <p className="text-arena-red text-sm">Insufficient balance</p>}
                <button
                  onClick={handleBet}
                  disabled={!canBet}
                  className="w-full max-w-xs py-4 rounded-xl font-semibold bg-emerald text-white hover:bg-emerald/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {!isDemo && (betPending || betConfirming) ? "Confirm in wallet…" : "Place Bet"}
                </button>
                {!isDemo && (betPending || betConfirming) && <p className="text-gold text-sm">Confirm in wallet…</p>}
                {betError && <p className="text-arena-red text-sm">{betErr?.message ?? "Tx failed"}</p>}
              </div>
            )}

            {round.state === 2 && (
              <div className="rounded-2xl border-2 border-emerald/50 bg-emerald/10 p-8 text-center">
                <h3 className="font-display text-xl text-emerald uppercase mb-2">Round settled</h3>
                <p className="text-white text-lg flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-gold" /> Winner: <strong className="text-gold">{symbols[round.winningSymbol]}</strong>
                </p>
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

            <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
              {round.pools.map((p, i) => (
                <span key={i}>{symbols[i]}: {(Number(p) / 1e18).toFixed(2)} MON</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

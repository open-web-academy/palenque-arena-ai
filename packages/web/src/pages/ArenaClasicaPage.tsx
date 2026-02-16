import React, { useState } from "react";
import { useMatch } from "../hooks/useMatch";
import { useMatchEvents } from "../hooks/useMatchEvents";
import { useToast } from "../hooks/useToast";
import { MatchCard } from "../components/MatchCard";
import { BoostForm } from "../components/BoostForm";
import { PayoutClaim } from "../components/PayoutClaim";
import { CountdownTimer } from "../components/CountdownTimer";
import { NextBattleCountdown } from "../components/NextBattleCountdown";
import { LiveOdds } from "../components/LiveOdds";
import { MatchHistory } from "../components/MatchHistory";
import { ToastContainer } from "../components/ToastContainer";
import { Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ArenaClasicaPage() {
  const { match, odds, loading, error, refetch } = useMatch();
  const [refreshKey, setRefreshKey] = useState(0);
  const { toasts, remove } = useToast();

  useMatchEvents(
    () => setRefreshKey((k) => k + 1),
    () => setRefreshKey((k) => k + 1)
  );

  const palTokenAddress = import.meta.env.VITE_PAL_TOKEN_ADDRESS || "";
  const matchState = match?.state ?? -1;
  const winner =
    match && matchState === 2 && match.winnerA !== undefined
      ? match.winnerA
        ? "A"
        : "B"
      : null;
  const userHasWinningBet =
    !!match &&
    matchState === 2 &&
    match.winnerA !== undefined &&
    ((match.winnerA && (match.userBetA ?? 0n) > 0n) ||
      (!match.winnerA && (match.userBetB ?? 0n) > 0n));

  return (
    <>
      <main className="arena-main max-w-6xl mx-auto px-6 pb-16 pt-8" id="arena">
        <h1 className="font-display text-2xl md:text-3xl text-gold tracking-[0.15em] uppercase mb-2">
          Classic Arena
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Fast rounds. Bet MON on Side A or B. Countdown, then winner resolved. Pro-rata payout.
        </p>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              className="arena-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="animate-spin text-gold" size={48} />
              <p className="text-gray-400">Loading match…</p>
            </motion.div>
          )}
          {error && (
            <motion.div
              key="error"
              className="arena-error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p>{error}</p>
              <p className="arena-error-hint">
                {error.includes("429") || error.includes("rate limit")
                  ? (
                    <>Use an RPC with API key in <code>VITE_RPC_URL</code> (e.g. Monad dashboard) or wait 1 minute.</>
                  )
                  : (
                    <>Check <code>.env</code> (VITE_RPC_URL, VITE_FACTORY_ADDRESS). For matches: <code>cd packages/operator && npm start</code>.</>
                  )}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 px-6 py-2 rounded-xl bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </motion.div>
          )}
          {!loading && !error && !match && (
            <motion.div
              key="empty"
              className="arena-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p>No active match.</p>
              <p className="arena-empty-hint">
                The operator creates one every ~60s. Is it running? <code>cd packages/operator && npm start</code>
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 px-6 py-2 rounded-xl bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </motion.div>
          )}
          {match && odds && !loading && (
            <motion.div
              key="match"
              className="flex flex-col gap-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="section-title">Live Match</h2>
              <MatchCard match={match} odds={odds} loading={false} />

              {matchState === 0 && (
                <CountdownTimer
                  closeTime={match.closeTime}
                  onExpired={() => {
                    setRefreshKey((k) => k + 1);
                    refetch();
                  }}
                />
              )}

              <NextBattleCountdown
                closeTime={match.closeTime}
                onExpired={() => {
                  setRefreshKey((k) => k + 1);
                  refetch();
                }}
              />

              {match.roosterA && match.roosterB && (
                <LiveOdds
                  pA={odds.pA}
                  pB={odds.pB}
                  roosterA={match.roosterA}
                  roosterB={match.roosterB}
                />
              )}

              {matchState === 0 ? (
                <div className="max-w-xl">
                  <BoostForm
                    matchAddress={match.address}
                    matchState={matchState}
                    roosterA={match.roosterA}
                    roosterB={match.roosterB}
                    palTokenAddress={palTokenAddress}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-gold/30 bg-charcoal/80 p-8 text-center">
                  <p className="text-gold font-semibold mb-2">Betting closed for this match</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Bet buttons for A or B only appear when the match is <strong className="text-gold">OPEN</strong>.
                    The next match will appear here in a moment — the page refreshes automatically, or tap Retry.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="px-6 py-2 rounded-xl bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 transition-colors inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                </div>
              )}

              {matchState === 2 && winner && (
                <PayoutClaim
                  matchAddress={match.address}
                  matchState={matchState}
                  winner={winner as "A" | "B"}
                  winnerName={match.winnerA ? match.roosterA : match.roosterB}
                  userHasWinningBet={userHasWinningBet}
                />
              )}

              <MatchHistory key={refreshKey} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <ToastContainer toasts={toasts} onRemove={remove} />
    </>
  );
}

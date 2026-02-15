import React, { useState, useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { monad } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMatch } from "./hooks/useMatch";
import { useMatchEvents } from "./hooks/useMatchEvents";
import { useToast } from "./hooks/useToast";
import { MatchCard } from "./components/MatchCard";
import { BetForm } from "./components/BetForm";
import { BoostForm } from "./components/BoostForm";
import { PayoutClaim } from "./components/PayoutClaim";
import { CountdownTimer } from "./components/CountdownTimer";
import { LiveOdds } from "./components/LiveOdds";
import { MatchHistory } from "./components/MatchHistory";
import { ToastContainer } from "./components/ToastContainer";
import { WalletBalance } from "./components/WalletBalance";
import { Hero } from "./components/Hero";
import { Loader2 } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css";

const config = createConfig(
  getDefaultConfig({
    appName: "Palenque Arena",
    appDescription: "Cyber Rooster League on Monad",
    appUrl: "https://palenque-arena.vercel.app",
    appIcon: "",
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "",
    chains: [monad],
    transports: {
      [monad.id]: http(import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz"),
    },
  })
);

function AppContent() {
  const { match, odds, loading, error } = useMatch();
  const [refreshKey, setRefreshKey] = useState(0);
  const { toasts, remove } = useToast();

  useMatchEvents(
    () => setRefreshKey(k => k + 1),
    () => setRefreshKey(k => k + 1)
  );

  const palTokenAddress = import.meta.env.VITE_PAL_TOKEN_ADDRESS || "";
  const matchState = match?.state ?? -1;
  const winner =
    match && matchState === 2 && match.winnerA !== undefined
      ? (match.winnerA ? "A" : "B")
      : null;
  const userHasWinningBet =
    !!match &&
    matchState === 2 &&
    match.winnerA !== undefined &&
    ((match.winnerA && (match.userBetA ?? 0n) > 0n) ||
      (!match.winnerA && (match.userBetB ?? 0n) > 0n));

  return (
    <>
      <Hero />
      <div className="arena-app">
        <header className="sticky top-0 z-50 flex items-center justify-between flex-wrap gap-4 py-6 bg-obsidian/95 backdrop-blur-xl border-b-2 border-bronze shadow-[0_4px_0_rgba(255,184,0,0.12)]">
          <h1 className="flex items-center gap-4 font-display text-2xl md:text-3xl font-normal tracking-[0.18em] text-gold">
            <img src="/logogallos.png" alt="" className="w-12 h-12 object-contain" aria-hidden />
            <span>Palenque <span className="text-arena-red">Arena</span></span>
          </h1>
          <div className="flex items-center gap-6">
            <WalletBalance />
            <ConnectKitButton />
          </div>
        </header>

        <main className="arena-main" id="arena">
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
                    ? <>Usa un RPC con API key en <code>VITE_RPC_URL</code> (ej. Monad dashboard) o espera 1 minuto.</>
                    : <>Revisa <code>.env</code> (VITE_RPC_URL, VITE_FACTORY_ADDRESS). Para partidos: <code>cd packages/operator && npm start</code>.</>}
                </p>
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
                <p>No hay partido activo.</p>
                <p className="arena-empty-hint">El operator crea uno cada ~60s. ¿Está corriendo? <code>cd packages/operator && npm start</code></p>
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
                    onExpired={() => setRefreshKey(k => k + 1)}
                  />
                )}

                {match.roosterA && match.roosterB && (
                  <LiveOdds
                    pA={odds.pA}
                    pB={odds.pB}
                    roosterA={match.roosterA}
                    roosterB={match.roosterB}
                  />
                )}

                {matchState === 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <BetForm
                      matchAddress={match.address}
                      matchState={matchState}
                      roosterA={match.roosterA}
                      roosterB={match.roosterB}
                      betPoolA={match.betPoolA}
                      betPoolB={match.betPoolB}
                    />
                    <BoostForm
                      matchAddress={match.address}
                      matchState={matchState}
                      roosterA={match.roosterA}
                      roosterB={match.roosterB}
                      palTokenAddress={palTokenAddress}
                    />
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
      </div>
      <ToastContainer toasts={toasts} onRemove={remove} />
    </>
  );
}

function App() {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ConnectKitProvider>
          <AppContent />
        </ConnectKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;

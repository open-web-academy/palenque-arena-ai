import React, { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { monad } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useMatch } from "./hooks/useMatch";
import { useMatchEvents } from "./hooks/useMatchEvents";
import { MatchCard } from "./components/MatchCard";
import { BetForm } from "./components/BetForm";
import { BoostForm } from "./components/BoostForm";
import { PayoutClaim } from "./components/PayoutClaim";
import { CountdownTimer } from "./components/CountdownTimer";
import { LiveOdds } from "./components/LiveOdds";
import { MatchHistory } from "./components/MatchHistory";
import "./index.css";

const config = createConfig(
  getDefaultConfig({
    appName: "Palenque Arena",
    appDescription: "Cyber Rooster League on Monad",
    appUrl: "https://palenque-arena.vercel.app",
    appIcon: "",
    chains: [monad],
    transports: {
      [monad.id]: http(process.env.REACT_APP_RPC_URL || "https://rpc.monad.xyz"),
    },
  })
);

function AppContent() {
  const { match, odds, loading, error } = useMatch();
  const [refreshKey, setRefreshKey] = useState(0);

  useMatchEvents(
    () => setRefreshKey(k => k + 1),
    () => setRefreshKey(k => k + 1)
  );

  const palTokenAddress = process.env.REACT_APP_PAL_TOKEN_ADDRESS || "";
  const matchState = match?.state ?? -1;
  const winner = match && matchState === 2
    ? (match.boostPoolA > match.boostPoolB ? "A" : "B")
    : null;

  return (
    <div className="app">
      <h1>🐓 Palenque Arena</h1>

      {loading && <p className="status">Loading match...</p>}
      {error && <p className="error">Error: {error}</p>}

      {match && odds && !loading && (
        <>
          <MatchCard
            match={match}
            odds={odds}
            loading={false}
          />

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
            <>
              <BetForm
                matchAddress={match.address}
                matchState={matchState}
                roosterA={match.roosterA}
                roosterB={match.roosterB}
              />

              <BoostForm
                matchAddress={match.address}
                matchState={matchState}
                roosterA={match.roosterA}
                roosterB={match.roosterB}
                palTokenAddress={palTokenAddress}
              />
            </>
          )}

          {matchState === 2 && winner && (
            <PayoutClaim
              matchAddress={match.address}
              matchState={matchState}
              winner={winner as "A" | "B"}
              userHasWinningBet={true}
            />
          )}

          <MatchHistory key={refreshKey} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <ConnectKitProvider>
        <AppContent />
      </ConnectKitProvider>
    </WagmiProvider>
  );
}

import React from "react";
import { Match, OddsData } from "../types";
import "./MatchCard.css";
import "./MatchCard.css";

interface MatchCardProps {
  match: Match | null;
  odds: OddsData | null;
  loading: boolean;
}

export function MatchCard({ match, odds, loading }: MatchCardProps) {
  if (loading) return <div className="match-card loading">Loading match...</div>;
  if (!match) return <div className="match-card empty">No active match</div>;

  const pAPercent = odds ? (Number(odds.pA) / 1e6 * 100).toFixed(1) : "50.0";
  const pBPercent = odds ? (Number(odds.pB) / 1e6 * 100).toFixed(1) : "50.0";

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = Math.max(0, Number(match.closeTime) - now);

  const getStateLabel = () => {
    if (match.state === 0) return "🟢 LIVE";
    if (match.state === 1) return "🔴 CLOSED";
    return "✓ SETTLED";
  };

  return (
    <div className="match-card">
      <div className="match-header">
        <h2>{getStateLabel()}</h2>
        {timeLeft > 0 && <span className="timer">{timeLeft}s</span>}
      </div>

      <div className="match-arena">
        <div className="rooster rooster-a">
          <h3>{match.roosterA}</h3>
          <p className="odds">{pAPercent}%</p>
          <p className="pool">Pool: {(Number(match.betPoolA) / 1e18).toFixed(2)} MON</p>
          <p className="boost">Boosts: {(Number(match.boostPoolA) / 1e18).toFixed(0)} PAL</p>
        </div>

        <div className="versus">VS</div>

        <div className="rooster rooster-b">
          <h3>{match.roosterB}</h3>
          <p className="odds">{pBPercent}%</p>
          <p className="pool">Pool: {(Number(match.betPoolB) / 1e18).toFixed(2)} MON</p>
          <p className="boost">Boosts: {(Number(match.boostPoolB) / 1e18).toFixed(0)} PAL</p>
        </div>
      </div>

      <div className="match-footer">
        <p className="total-pool">
          Total Pool: {((Number(match.betPoolA) + Number(match.betPoolB)) / 1e18).toFixed(2)} MON
        </p>
      </div>
    </div>
  );
}

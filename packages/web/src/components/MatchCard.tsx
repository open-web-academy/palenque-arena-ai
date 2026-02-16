import React from "react";
import { Match, OddsData } from "../types";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { SideBetForm } from "./SideBetForm";

interface MatchCardProps {
  match: Match | null;
  odds: OddsData | null;
  loading: boolean;
}

export function MatchCard({ match, odds, loading }: MatchCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-charcoal/80 border-2 border-bronze p-12 text-center text-gray-400">
        Loading match...
      </div>
    );
  }
  if (!match) {
    return (
      <div className="rounded-2xl bg-charcoal/80 border-2 border-bronze p-12 text-center text-gray-400">
        No active match
      </div>
    );
  }

  const pAPercent = odds ? (Number(odds.pA) / 1e6 * 100).toFixed(1) : "50.0";
  const pBPercent = odds ? (Number(odds.pB) / 1e6 * 100).toFixed(1) : "50.0";
  const getStateLabel = () => {
    if (match.state === 0) return "OPEN";
    if (match.state === 1) return "CLOSED";
    return "SETTLED";
  };
  const stateStyles =
    match.state === 0
      ? "border-gold shadow-gold-glow"
      : match.state === 1
      ? "border-arena-red shadow-red-glow"
      : "border-emerald shadow-emerald-glow";
  const avatarA = match.roosterA?.charAt(0)?.toUpperCase() ?? "A";
  const avatarB = match.roosterB?.charAt(0)?.toUpperCase() ?? "B";

  return (
    <motion.div
      className={`rounded-2xl bg-charcoal/90 border-2 ${stateStyles} overflow-hidden transition-shadow duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
        <span className="font-display text-sm tracking-[0.2em] text-gold uppercase">{getStateLabel()}</span>
      </div>

      {/* Arena ring — two fighters facing each other */}
      <div className="relative px-6 py-10 md:py-14">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-gold/30 border-dashed opacity-40" />
          <div className="absolute w-48 h-48 md:w-60 md:h-60 rounded-full border border-gold/20 opacity-30" />
        </div>

        <div className="relative flex items-center justify-between gap-4 md:gap-8">
          <div className="flex-1 flex flex-col items-center gap-3 p-4 rounded-xl bg-black/30 border border-gold/20 backdrop-blur-sm">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-bronze flex items-center justify-center text-2xl font-display text-gold border-2 border-gold/40">
              {avatarA}
            </div>
            <h3 className="font-display text-xl md:text-2xl tracking-wider text-white">{match.roosterA}</h3>
            <p className="font-numeric text-2xl text-gold">{pAPercent}%</p>
            <p className="text-xs text-gray-400">Pool: {(Number(match.betPoolA) / 1e18).toFixed(2)} MON</p>
            <p className="text-xs text-gray-500">Boosts: {(Number(match.boostPoolA) / 1e18).toFixed(0)} PAL</p>
            {match.state === 0 && (
              <SideBetForm
                isA={true}
                roosterName={match.roosterA}
                matchAddress={match.address}
                matchState={match.state}
                variant="gold"
              />
            )}
          </div>

          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-arena-red/20 border-2 border-arena-red flex items-center justify-center">
            <Swords className="w-6 h-6 text-arena-red" />
          </div>

          <div className="flex-1 flex flex-col items-center gap-3 p-4 rounded-xl bg-black/30 border border-gold/20 backdrop-blur-sm">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-bronze flex items-center justify-center text-2xl font-display text-gold border-2 border-gold/40">
              {avatarB}
            </div>
            <h3 className="font-display text-xl md:text-2xl tracking-wider text-white">{match.roosterB}</h3>
            <p className="font-numeric text-2xl text-gold">{pBPercent}%</p>
            <p className="text-xs text-gray-400">Pool: {(Number(match.betPoolB) / 1e18).toFixed(2)} MON</p>
            <p className="text-xs text-gray-500">Boosts: {(Number(match.boostPoolB) / 1e18).toFixed(0)} PAL</p>
            {match.state === 0 && (
              <SideBetForm
                isA={false}
                roosterName={match.roosterB}
                matchAddress={match.address}
                matchState={match.state}
                variant="red"
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/10 bg-black/20 text-center">
        <p className="text-sm text-gray-400">
          Total pool: <span className="font-numeric font-semibold text-gold">{((Number(match.betPoolA) + Number(match.betPoolB)) / 1e18).toFixed(2)} MON</span>
        </p>
      </div>
    </motion.div>
  );
}

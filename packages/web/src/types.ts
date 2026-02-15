/** Re-export match and odds types for components (e.g. MatchCard) */
import type { Match as MatchFromHook, Odds } from "./hooks/useMatch";

export type Match = MatchFromHook;
export type OddsData = Odds;

import { getPublicClient } from "../lib/monadClient";
import {
  FACTORY_ABI,
  FACTORY_ADDRESS,
  MATCH_ABI,
} from "../lib/contractAbis";
import { Match } from "../types";

export async function getCurrentMatch(): Promise<Match | null> {
  const client = getPublicClient();

  try {
    const matchCount = (await client.readContract({
      address: FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: "matchCount",
    })) as bigint;

    if (matchCount === 0n) return null;

    const matchAddr = (await client.readContract({
      address: FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: "getLastMatch",
    })) as string;

    const [state, roosterA, roosterB, betPoolA, betPoolB, boostPoolA, boostPoolB, odds, winnerA] =
      (await client.multicall({
        contracts: [
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "state",
          },
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "roosterA",
          },
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "roosterB",
          },
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "betPoolA",
          },
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "betPoolB",
          },
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "totalBoostA",
          },
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "totalBoostB",
          },
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "currentOdds",
          },
          {
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "winnerA",
          },
        ],
      })) as any;

    const stateNames = ["OPEN", "CLOSED", "SETTLED"];

    return {
      address: matchAddr,
      roosterA: roosterA.result as string,
      roosterB: roosterB.result as string,
      state: (state.result as number) as 0 | 1 | 2,
      betPoolA: betPoolA.result as bigint,
      betPoolB: betPoolB.result as bigint,
      boostPoolA: boostPoolA.result as bigint,
      boostPoolB: boostPoolB.result as bigint,
      pA: (odds.result as [bigint, bigint])[0],
      pB: (odds.result as [bigint, bigint])[1],
      winnerA: winnerA.result as boolean,
    };
  } catch (error) {
    console.error("Error fetching match:", error);
    return null;
  }
}

export function formatMatch(match: Match): string {
  const stateNames = ["🟢 OPEN", "🟡 CLOSED", "🟣 SETTLED"];
  const pAPercent = (Number(match.pA) / 1e6) * 100;
  const pBPercent = (Number(match.pB) / 1e6) * 100;

  let result = `\n⚔️ **CYBER ROOSTER LEAGUE**\n`;
  result += `${match.roosterA} vs ${match.roosterB}\n`;
  result += `Status: ${stateNames[match.state]}\n`;
  result += `Odds: ${pAPercent.toFixed(1)}% vs ${pBPercent.toFixed(1)}%\n`;
  result += `Pool A: ${(Number(match.betPoolA) / 1e18).toFixed(2)} MON\n`;
  result += `Pool B: ${(Number(match.betPoolB) / 1e18).toFixed(2)} MON\n`;

  if (match.state === 2 && match.winnerA !== undefined) {
    result += `\n🏆 Winner: ${match.winnerA ? match.roosterA : match.roosterB}\n`;
  }

  return result;
}

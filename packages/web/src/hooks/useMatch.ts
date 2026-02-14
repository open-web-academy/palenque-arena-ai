import { useEffect, useState } from "react";
import { createPublicClient, http, getContract, parseAbi } from "viem";
import { monad } from "viem/chains";

const FACTORY_ABI = parseAbi([
  "function getLastMatch() view returns (address)",
]);

const MATCH_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function roosterA() view returns (string)",
  "function roosterB() view returns (string)",
  "function closeTime() view returns (uint256)",
  "function betPoolA() view returns (uint256)",
  "function betPoolB() view returns (uint256)",
  "function boostPoolA() view returns (uint256)",
  "function boostPoolB() view returns (uint256)",
  "function currentOdds() view returns (uint256 pA, uint256 pB)",
  "event Settled(bool indexed winnerIsA)",
]);

export interface Match {
  address: string;
  roosterA: string;
  roosterB: string;
  state: number;
  closeTime: bigint;
  betPoolA: bigint;
  betPoolB: bigint;
  boostPoolA: bigint;
  boostPoolB: bigint;
}

export interface Odds {
  pA: bigint;
  pB: bigint;
}

export function useMatch() {
  const [match, setMatch] = useState<Match | null>(null);
  const [odds, setOdds] = useState<Odds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rpcUrl = process.env.REACT_APP_RPC_URL || "https://rpc.monad.xyz";
  const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS;

  useEffect(() => {
    if (!factoryAddress) return;

    const publicClient = createPublicClient({
      chain: monad,
      transport: http(rpcUrl),
    });

    let pollInterval: NodeJS.Timeout;
    let isMounted = true;

    const fetchMatch = async () => {
      try {
        const factory = getContract({
          address: factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          client: { public: publicClient },
        });

        const matchAddr = (await publicClient.readContract({
          address: factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "getLastMatch",
        })) as string;

        if (!matchAddr || matchAddr === "0x0000000000000000000000000000000000000000") {
          if (isMounted) {
            setMatch(null);
            setOdds(null);
            setLoading(false);
          }
          return;
        }

        const [state, roosterA, roosterB, closeTime, betPoolA, betPoolB, boostPoolA, boostPoolB, odds] = await Promise.all([
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "state",
          }),
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "roosterA",
          }),
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "roosterB",
          }),
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "closeTime",
          }),
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "betPoolA",
          }),
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "betPoolB",
          }),
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "boostPoolA",
          }),
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "boostPoolB",
          }),
          publicClient.readContract({
            address: matchAddr as `0x${string}`,
            abi: MATCH_ABI,
            functionName: "currentOdds",
          }),
        ]) as any;

        if (isMounted) {
          setMatch({
            address: matchAddr,
            roosterA: roosterA as string,
            roosterB: roosterB as string,
            state: state as number,
            closeTime: closeTime as bigint,
            betPoolA: betPoolA as bigint,
            betPoolB: betPoolB as bigint,
            boostPoolA: boostPoolA as bigint,
            boostPoolB: boostPoolB as bigint,
          });
          setOdds({
            pA: odds[0] as bigint,
            pB: odds[1] as bigint,
          });
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(String(err));
          setLoading(false);
        }
      }
    };

    fetchMatch();

    // Poll every 5s if match is open, every 30s otherwise
    pollInterval = setInterval(fetchMatch, match?.state === 0 ? 5000 : 30000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [factoryAddress, rpcUrl, match?.state]);

  return { match, odds, loading, error };
}

import { useEffect, useRef } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { monad } from "viem/chains";

const FACTORY_ABI = parseAbi([
  "event MatchCreated(address indexed matchAddress, string roosterA, string roosterB)",
]);

const MATCH_ABI = parseAbi([
  "event Settled(bool indexed winnerIsA)",
  "event Committed(bytes32 commitHash)",
]);

export function useMatchEvents(
  onMatchCreated?: (addr: string) => void,
  onSettled?: (winner: boolean) => void
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS;
    if (!factoryAddress) return;

    const publicClient = createPublicClient({
      chain: monad,
      transport: http(process.env.REACT_APP_RPC_URL || "https://rpc.monad.xyz"),
    });

    // Listen to MatchCreated events
    const unsubMatch = publicClient.watchContractEvent({
      address: factoryAddress as `0x${string}`,
      abi: FACTORY_ABI,
      eventName: "MatchCreated",
      onLogs: (logs) => {
        logs.forEach(log => {
          const args = log.args as any;
          if (args.matchAddress) {
            onMatchCreated?.(args.matchAddress);
          }
        });
      },
    });

    unsubscribeRef.current = unsubMatch;

    return () => {
      unsubscribeRef.current?.();
    };
  }, [onMatchCreated]);

  return unsubscribeRef;
}

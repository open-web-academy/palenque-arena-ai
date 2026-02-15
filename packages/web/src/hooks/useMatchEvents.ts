import { useEffect, useRef, useState } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { monad } from "viem/chains";

const FACTORY_ABI = parseAbi([
  "event MatchCreated(address indexed matchAddress, string roosterA, string roosterB)",
]);

const MATCH_ABI = parseAbi([
  "event Settled(bool indexed winnerIsA)",
]);

export function useMatchEvents(
  onMatchCreated?: (addr: string) => void,
  onSettled?: (winner: boolean) => void
) {
  const unsubscribeRef = useRef<(() => void)[]>([]);
  const [currentMatchAddr, setCurrentMatchAddr] = useState<string | null>(null);

  useEffect(() => {
    const factoryAddress = import.meta.env.VITE_FACTORY_ADDRESS;
    if (!factoryAddress) return;

    const publicClient = createPublicClient({
      chain: monad,
      transport: http(import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz"),
    });

    // Cleanup previous subscriptions
    unsubscribeRef.current.forEach(unsub => unsub?.());
    unsubscribeRef.current = [];

    // Listen to MatchCreated events
    const unsubMatch = publicClient.watchContractEvent({
      address: factoryAddress as `0x${string}`,
      abi: FACTORY_ABI,
      eventName: "MatchCreated",
      onLogs: (logs) => {
        logs.forEach(log => {
          const args = log.args as any;
          if (args.matchAddress) {
            setCurrentMatchAddr(args.matchAddress);
            onMatchCreated?.(args.matchAddress);
          }
        });
      },
    });

    unsubscribeRef.current.push(unsubMatch);

    return () => {
      unsubscribeRef.current.forEach(unsub => unsub?.());
      unsubscribeRef.current = [];
    };
  }, [onMatchCreated]);

  // Listen to Settled events on the current match
  useEffect(() => {
    if (!currentMatchAddr || !onSettled) return;

    const publicClient = createPublicClient({
      chain: monad,
      transport: http(import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz"),
    });

    const unsubSettled = publicClient.watchContractEvent({
      address: currentMatchAddr as `0x${string}`,
      abi: MATCH_ABI,
      eventName: "Settled",
      onLogs: (logs) => {
        logs.forEach(log => {
          const args = log.args as any;
          if (typeof args.winnerIsA === "boolean") {
            onSettled(args.winnerIsA);
          }
        });
      },
    });

    unsubscribeRef.current.push(unsubSettled);

    return () => {
      unsubSettled?.();
    };
  }, [currentMatchAddr, onSettled]);

  return unsubscribeRef;
}

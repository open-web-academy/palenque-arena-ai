export interface Match {
  address: string;
  roosterA: string;
  roosterB: string;
  state: 0 | 1 | 2; // 0=Open, 1=Closed, 2=Settled
  winnerA?: boolean;
  betPoolA: bigint;
  betPoolB: bigint;
  boostPoolA: bigint;
  boostPoolB: bigint;
  pA: bigint; // Current odds for A (0-1e6 scale)
  pB: bigint;
}

export interface CommandResult {
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
}

export interface BetCommand {
  side: "A" | "B";
  amount: string; // In MON
}

export interface BoostCommand {
  side: "A" | "B";
  amount: string; // In PAL
}

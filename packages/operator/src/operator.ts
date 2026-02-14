import { keccak256, toHex, encodeAbiParameters, parseAbiParameters, Address } from "viem";
import { ContractClients } from "./contract";
import { FACTORY_ABI, MATCH_ABI } from "./abi";

const ROOSTERS = [
  "Phoenix",
  "Dragon",
  "Cyber-Falcon",
  "Neon-Hawk",
  "Thunder-Eagle",
  "Shadow-Raven",
];

enum MatchState {
  Open = 0,
  Closed = 1,
  Settled = 2,
}

export class Operator {
  private clients: ContractClients;
  private factoryAddress: Address;
  private currentMatchAddress: string | null = null;
  private currentSeed: bigint | null = null;
  private matchInterval: number;
  private bettingWindow: number;
  private autoSettleDelay: number;

  constructor(
    clients: ContractClients,
    factoryAddress: string,
    matchInterval = 60,
    bettingWindow = 60,
    autoSettleDelay = 5
  ) {
    this.clients = clients;
    this.factoryAddress = factoryAddress as Address;
    this.matchInterval = matchInterval;
    this.bettingWindow = bettingWindow;
    this.autoSettleDelay = autoSettleDelay;
  }

  async tick(): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000);

      // Get current match
      const lastMatchAddr = await this.getLastMatch();
      this.currentMatchAddress = lastMatchAddr;

      if (!lastMatchAddr || lastMatchAddr === "0x0000000000000000000000000000000000000000") {
        console.log("[Operator] No match exists, creating one...");
        await this.createMatch();
        return;
      }

      const state = await this.getMatchState(lastMatchAddr);
      const closeTime = await this.getCloseTime(lastMatchAddr);

      console.log(`[Operator] Match ${lastMatchAddr} state=${state} closeTime=${closeTime} now=${now}`);

      if (state === MatchState.Open) {
        if (now >= Number(closeTime)) {
          console.log("[Operator] Closing bets...");
          await this.closeBets(lastMatchAddr);
        }
      } else if (state === MatchState.Closed) {
        if (!this.currentSeed) {
          console.log("[Operator] Committing match...");
          await this.commitMatch(lastMatchAddr);
        } else {
          console.log("[Operator] Revealing match...");
          await this.revealMatch(lastMatchAddr);
        }
      } else if (state === MatchState.Settled) {
        console.log("[Operator] Match settled, creating new one...");
        this.currentSeed = null;
        await this.createMatch();
      }
    } catch (err) {
      console.error("[Operator] Tick error:", err);
    }
  }

  private async getLastMatch(): Promise<string> {
    try {
      const result = await this.clients.public.call({
        account: this.clients.wallet.account,
        to: this.factoryAddress,
        data: "0x0d7d7a52", // getLastMatch() function selector
      });
      
      if (!result.data || result.data === "0x") return "0x0000000000000000000000000000000000000000";
      return "0x" + result.data.slice(-40); // Extract address from return data
    } catch (err) {
      console.error("[Operator] getLastMatch error:", err);
      return "0x0000000000000000000000000000000000000000";
    }
  }

  private async getMatchState(matchAddr: string): Promise<number> {
    try {
      const result = await this.clients.public.call({
        to: matchAddr as Address,
        data: "0x4e69d92d", // state() function selector
      });
      
      if (!result.data) return -1;
      return parseInt(result.data, 16);
    } catch (err) {
      console.error("[Operator] getMatchState error:", err);
      return -1;
    }
  }

  private async getCloseTime(matchAddr: string): Promise<bigint> {
    try {
      const result = await this.clients.public.call({
        to: matchAddr as Address,
        data: "0x40c10f19", // closeTime() function selector - WRONG, need correct selector
      });
      
      if (!result.data) return BigInt(0);
      return BigInt(result.data);
    } catch (err) {
      console.error("[Operator] getCloseTime error:", err);
      return BigInt(0);
    }
  }

  private async createMatch(): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const roosterA = ROOSTERS[Math.floor(Math.random() * ROOSTERS.length)];
      const roosterB = ROOSTERS[Math.floor(Math.random() * ROOSTERS.length)];

      console.log(`[Operator] Creating match: ${roosterA} vs ${roosterB}`);
      
      const account = this.clients.wallet.account!;
      const hash = await this.clients.wallet.sendTransaction({
        to: this.factoryAddress,
        account,
        data: this.encodeCreateMatch(roosterA, roosterB, BigInt(now), BigInt(this.bettingWindow)),
      });

      console.log(`[Operator] Match creation tx: ${hash}`);
    } catch (err) {
      console.error("[Operator] Create match error:", err);
    }
  }

  private async closeBets(matchAddr: string): Promise<void> {
    try {
      const account = this.clients.wallet.account!;
      const hash = await this.clients.wallet.sendTransaction({
        to: matchAddr as Address,
        account,
        data: "0xba75b5d4", // closeBets() function selector
      });

      console.log(`[Operator] closeBets tx: ${hash}`);
    } catch (err) {
      console.error("[Operator] Close bets error:", err);
    }
  }

  private async commitMatch(matchAddr: string): Promise<void> {
    try {
      this.currentSeed = BigInt(Math.floor(Math.random() * 1e9));
      const operatorAddr = this.clients.wallet.account!.address;

      const commitHash = keccak256(
        encodeAbiParameters(
          parseAbiParameters("uint256 seed, address operator"),
          [this.currentSeed, operatorAddr]
        )
      );

      console.log(`[Operator] Committing with seed: ${this.currentSeed}`);

      const account = this.clients.wallet.account!;
      const hash = await this.clients.wallet.sendTransaction({
        to: matchAddr as Address,
        account,
        data: this.encodeCommit(commitHash),
      });

      console.log(`[Operator] commit tx: ${hash}`);
    } catch (err) {
      console.error("[Operator] Commit error:", err);
    }
  }

  private async revealMatch(matchAddr: string): Promise<void> {
    try {
      if (!this.currentSeed) {
        console.error("[Operator] No seed to reveal");
        return;
      }

      console.log(`[Operator] Revealing seed: ${this.currentSeed}`);

      const account = this.clients.wallet.account!;
      const hash = await this.clients.wallet.sendTransaction({
        to: matchAddr as Address,
        account,
        data: this.encodeReveal(this.currentSeed),
      });

      console.log(`[Operator] reveal tx: ${hash}`);
      this.currentSeed = null;
    } catch (err) {
      console.error("[Operator] Reveal error:", err);
    }
  }

  // Encoding helpers
  private encodeCreateMatch(roosterA: string, roosterB: string, startTime: bigint, duration: bigint): `0x${string}` {
    // createMatch(string,string,uint256,uint256) selector = 0x891f7d23
    const selector = "0x891f7d23";
    const encoded = encodeAbiParameters(
      parseAbiParameters("string roosterA, string roosterB, uint256 startTime, uint256 duration"),
      [roosterA, roosterB, startTime, duration]
    );
    return (selector + encoded.slice(2)) as `0x${string}`;
  }

  private encodeCommit(commitHash: string): `0x${string}` {
    // commit(bytes32) selector = 0x5eba57a3
    const selector = "0x5eba57a3";
    return (selector + commitHash.slice(2).padStart(64, "0")) as `0x${string}`;
  }

  private encodeReveal(seed: bigint): `0x${string}` {
    // reveal(uint256) selector = 0xd56e8c26
    const selector = "0xd56e8c26";
    return (selector + toHex(seed).slice(2).padStart(64, "0")) as `0x${string}`;
  }
}

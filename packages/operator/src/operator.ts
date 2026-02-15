import { getMatchCount, getLastMatch, getMatchState, createMatch, closeBets, commit, reveal } from "./contract";
import { generateSeed, createCommitHash } from "./utils/randomness";
import { log } from "./utils/logger";
import { withRetry } from "./utils/retry";

export class Operator {
  private clients: any;
  private factoryAddress: string;
  private matchInterval: number;
  private autoSettleDelay: number;
  private roosters: string[];

  // ✅ Store seed per match address to avoid "Invalid seed" when lastMatch changes
  private commitSeeds = new Map<string, bigint>(); // matchAddr -> seed

  constructor(clients: any, factoryAddress: string, config: any) {
    this.clients = clients;
    this.factoryAddress = factoryAddress;
    this.matchInterval = config.matchInterval;
    this.autoSettleDelay = config.autoSettleDelay;
    this.roosters = config.roosters;
  }

  async tick() {
    try {
      const count = await getMatchCount(this.clients.factory);
      if (count === 0n) {
        await this.createNewMatch();
        return;
      }

      const matchAddr = await getLastMatch(this.clients.factory);
      if (!matchAddr || matchAddr === "0x0000000000000000000000000000000000000000") {
        await this.createNewMatch();
        return;
      }

      const { state, closeTime } = await getMatchState(this.clients.publicClient, matchAddr);
      const now = BigInt(Math.floor(Date.now() / 1000));

      if (state === 0) {
        // Open
        if (now >= closeTime) {
          await this.closeBetsAction(matchAddr);
        }
      } else if (state === 1) {
        // Closed
        if (!this.commitSeeds.has(matchAddr)) {
          await this.commitAction(matchAddr);
        } else {
          await new Promise((p) => setTimeout(p, this.autoSettleDelay * 1000));
          await this.revealAction(matchAddr);
        }
      } else if (state === 2) {
        // Settled
        log(`Match ${matchAddr.slice(0, 6)} settled. Creating new match.`);
        this.commitSeeds.delete(matchAddr);
        await this.createNewMatch();
      }
    } catch (error) {
      log(`Error in tick: ${error}`, "error");
    }
  }

  private async createNewMatch() {
    const roosterA = this.roosters[Math.floor(Math.random() * this.roosters.length)];
    const roosterB = this.roosters[Math.floor(Math.random() * this.roosters.length)];
    const startTime = BigInt(Math.floor(Date.now() / 1000));
    const closeDuration = BigInt(this.matchInterval);

    try {
      log(`Creating match: ${roosterA} vs ${roosterB}`);
      const hash = await withRetry(
        () =>
          createMatch(this.clients.factory, roosterA, roosterB, startTime, closeDuration),
        { maxAttempts: 3, baseDelayMs: 2000, name: "createMatch" }
      );
      log(`Match created: tx ${hash}`);
    } catch (error) {
      log(`Failed to create match after retries: ${error}`, "error");
    }
  }

  private async closeBetsAction(matchAddr: string) {
    try {
      log(`Closing bets for ${matchAddr.slice(0, 6)}`);
      const hash = await withRetry(
        () => closeBets(this.clients.walletClient, this.clients.publicClient, matchAddr),
        { maxAttempts: 3, baseDelayMs: 2000, name: `closeBets(${matchAddr.slice(0, 6)})` }
      );
      log(`Bets closed: tx ${hash}`);
    } catch (error) {
      log(`Failed to close bets after retries: ${error}`, "error");
    }
  }

  private async commitAction(matchAddr: string) {
    try {
      const seed = generateSeed();
      this.commitSeeds.set(matchAddr, seed);

      const commitHash = createCommitHash(seed, this.clients.account.address);
      log(`Committing to ${matchAddr.slice(0, 6)}`);

      const hash = await withRetry(
        () => commit(this.clients.walletClient, this.clients.publicClient, matchAddr, commitHash),
        { maxAttempts: 3, baseDelayMs: 2000, name: `commit(${matchAddr.slice(0, 6)})` }
      );
      log(`Committed: tx ${hash}`);
    } catch (error) {
      log(`Failed to commit after retries: ${error}`, "error");
      this.commitSeeds.delete(matchAddr);
    }
  }

  private async revealAction(matchAddr: string) {
    try {
      const seed = this.commitSeeds.get(matchAddr);
      if (!seed) throw new Error(`No seed to reveal for match ${matchAddr}`);

      log(`Revealing match ${matchAddr.slice(0, 6)}`);
      const hash = await withRetry(
        () => reveal(this.clients.walletClient, this.clients.publicClient, matchAddr, seed),
        { maxAttempts: 3, baseDelayMs: 2000, name: `reveal(${matchAddr.slice(0, 6)})` }
      );
      log(`Revealed: tx ${hash}`);

      // ✅ Clear seed after successful reveal
      this.commitSeeds.delete(matchAddr);
    } catch (error) {
      log(`Failed to reveal after retries: ${error}`, "error");
    }
  }
}

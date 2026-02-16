import { generateSeed, createCommitHash } from "./utils/randomness";
import { log } from "./utils/logger";
import { withRetry } from "./utils/retry";
import {
  getElementalFactory,
  getElementalMatchState,
  createElementalMatch,
  elementalCloseBets,
  elementalCommit,
  elementalReveal,
} from "./elemental";

export class ElementalOperator {
  private clients: any;
  private factoryAddress: string;
  private interval: number;
  private autoSettleDelay: number;
  private commitSeeds = new Map<string, bigint>();

  constructor(clients: any, factoryAddress: string, config: any) {
    this.clients = clients;
    this.factoryAddress = factoryAddress;
    this.interval = config.matchInterval ?? 60;
    this.autoSettleDelay = config.autoSettleDelay ?? 5;
  }

  async tick() {
    try {
      const factory = getElementalFactory(this.factoryAddress as `0x${string}`, this.clients);
      const count = await factory.read.matchCount();
      if (count === 0n) {
        log("[ELEMENTAL] No matches. Creating first.");
        await this.createNew(factory);
        return;
      }

      const matchAddr = await factory.read.getLastMatch();
      if (!matchAddr || matchAddr === "0x0000000000000000000000000000000000000000") {
        log("[ELEMENTAL] getLastMatch zero. Creating new.");
        await this.createNew(factory);
        return;
      }

      const { state, closeTime } = await getElementalMatchState(this.clients.publicClient, matchAddr);
      const now = BigInt(Math.floor(Date.now() / 1000));
      const stateLabel = state === 0 ? "OPEN" : state === 1 ? "CLOSED" : "SETTLED";
      log(`[ELEMENTAL] Match ${matchAddr.slice(0, 10)}… state=${stateLabel}`);

      if (state === 0) {
        if (now >= closeTime) {
          log("[ELEMENTAL] Closing bets.");
          await elementalCloseBets(this.clients.walletClient, this.clients.publicClient, matchAddr);
        }
      } else if (state === 1) {
        if (!this.commitSeeds.has(matchAddr)) {
          log("[ELEMENTAL] Committing.");
          const seed = generateSeed();
          this.commitSeeds.set(matchAddr, seed);
          const commitHash = createCommitHash(seed, this.clients.account.address);
          await withRetry(
            () => elementalCommit(this.clients.walletClient, this.clients.publicClient, matchAddr, commitHash),
            { maxAttempts: 3, baseDelayMs: 2000, name: "elementalCommit" }
          );
        } else {
          log(`[ELEMENTAL] Revealing after ${this.autoSettleDelay}s.`);
          await new Promise((p) => setTimeout(p, this.autoSettleDelay * 1000));
          const seed = this.commitSeeds.get(matchAddr)!;
          await withRetry(
            () => elementalReveal(this.clients.walletClient, this.clients.publicClient, matchAddr, seed),
            { maxAttempts: 3, baseDelayMs: 2000, name: "elementalReveal" }
          );
          this.commitSeeds.delete(matchAddr);
        }
      } else if (state === 2) {
        log("[ELEMENTAL] Settled. Creating new match.");
        this.commitSeeds.delete(matchAddr);
        await this.createNew(factory);
      }
    } catch (error) {
      log(`[ELEMENTAL] Error: ${error}`, "error");
    }
  }

  private async createNew(factory: any) {
    const startTime = BigInt(Math.floor(Date.now() / 1000));
    const closeDuration = BigInt(this.interval);
    const hash = await withRetry(
      () => createElementalMatch(factory, startTime, closeDuration),
      { maxAttempts: 3, baseDelayMs: 2000, name: "createElementalMatch" }
    );
    await this.clients.publicClient.waitForTransactionReceipt({ hash });
    log(`[ELEMENTAL] Match created: tx ${hash}`);
  }
}

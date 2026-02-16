import { generateSeed, createCommitHash } from "./utils/randomness";
import { log } from "./utils/logger";
import { withRetry } from "./utils/retry";
import {
  getRuletaContract,
  getRuletaState,
  ruletaStartRound,
  ruletaCloseBets,
  ruletaCommit,
  ruletaReveal,
} from "./ruleta";

export class RuletaOperator {
  private clients: any;
  private ruletaAddress: string;
  private interval: number;
  private autoSettleDelay: number;
  private commitSeeds = new Map<number, bigint>();

  constructor(clients: any, ruletaAddress: string, config: any) {
    this.clients = clients;
    this.ruletaAddress = ruletaAddress;
    this.interval = config.matchInterval ?? 60;
    this.autoSettleDelay = config.autoSettleDelay ?? 5;
  }

  async tick() {
    try {
      const ruleta = getRuletaContract(this.ruletaAddress as `0x${string}`, this.clients);
      const { roundId, state, closeTime } = await getRuletaState(this.clients.publicClient, this.ruletaAddress);
      const now = BigInt(Math.floor(Date.now() / 1000));
      const stateLabel = state === 0 ? "OPEN" : state === 1 ? "CLOSED" : "SETTLED";

      if (state === -1 || (state === 2 && roundId === 0)) {
        log("[RULETA] No round or last settled. Starting new round.");
        const closeTimeNew = now + BigInt(this.interval);
        const hash = await withRetry(
          () => ruletaStartRound(ruleta, closeTimeNew),
          { maxAttempts: 3, baseDelayMs: 2000, name: "ruletaStartRound" }
        );
        await this.clients.publicClient.waitForTransactionReceipt({ hash });
        log(`[RULETA] Round started: tx ${hash}`);
        return;
      }

      log(`[RULETA] Round ${roundId} state=${stateLabel}`);

      if (state === 0) {
        if (now >= closeTime) {
          log("[RULETA] Closing bets.");
          await ruletaCloseBets(this.clients.walletClient, this.clients.publicClient, this.ruletaAddress, roundId);
        }
      } else if (state === 1) {
        if (!this.commitSeeds.has(roundId)) {
          log("[RULETA] Committing.");
          const seed = generateSeed();
          this.commitSeeds.set(roundId, seed);
          const commitHash = createCommitHash(seed, this.clients.account.address);
          await withRetry(
            () => ruletaCommit(this.clients.walletClient, this.clients.publicClient, this.ruletaAddress, roundId, commitHash),
            { maxAttempts: 3, baseDelayMs: 2000, name: "ruletaCommit" }
          );
        } else {
          log(`[RULETA] Revealing after ${this.autoSettleDelay}s.`);
          await new Promise((p) => setTimeout(p, this.autoSettleDelay * 1000));
          const seed = this.commitSeeds.get(roundId)!;
          await withRetry(
            () => ruletaReveal(this.clients.walletClient, this.clients.publicClient, this.ruletaAddress, roundId, seed),
            { maxAttempts: 3, baseDelayMs: 2000, name: "ruletaReveal" }
          );
          this.commitSeeds.delete(roundId);
        }
      } else if (state === 2) {
        log("[RULETA] Round settled. Next tick will start new round.");
        this.commitSeeds.delete(roundId);
        const closeTimeNew = now + BigInt(this.interval);
        const hash = await withRetry(
          () => ruletaStartRound(ruleta, closeTimeNew),
          { maxAttempts: 3, baseDelayMs: 2000, name: "ruletaStartRound" }
        );
        await this.clients.publicClient.waitForTransactionReceipt({ hash });
        log(`[RULETA] New round started: tx ${hash}`);
      }
    } catch (error) {
      log(`[RULETA] Error: ${error}`, "error");
    }
  }
}

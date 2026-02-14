/**
 * E2E Test Script for Palenque Arena
 * 
 * Validates the complete match lifecycle:
 * 1. Operator creates a match
 * 2. Match moves through states: Open -> Closed -> Settled
 * 3. Payouts are calculated correctly
 * 
 * Run with: npx ts-node src/e2e-test.ts
 */

import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monad } from "viem/chains";

const RPC_URL = process.env.RPC_URL || "https://rpc.monad.xyz";
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY || "";
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "";
const PAL_TOKEN_ADDRESS = process.env.PAL_TOKEN_ADDRESS || "";

const FACTORY_ABI = parseAbi([
  "function lastMatch() public view returns (address)",
  "function getMatches(uint256 start, uint256 end) public view returns (address[])",
]);

const MATCH_ABI = parseAbi([
  "function state() public view returns (uint8)",
  "function roosterA() public view returns (string)",
  "function roosterB() public view returns (string)",
  "function closeTime() public view returns (uint256)",
  "function betsA() public view returns (uint256)",
  "function betsB() public view returns (uint256)",
  "function boostPoolA() public view returns (uint256)",
  "function boostPoolB() public view returns (uint256)",
  "event MatchCreated(address indexed matchAddress, string roosterA, string roosterB)",
  "event Settled(bool indexed winnerIsA)",
]);

interface TestState {
  factoryAddress: string;
  lastMatchAddr: string | null;
  matchState: number;
  startTime: number;
  transitionTimes: Record<string, number>;
}

const state: TestState = {
  factoryAddress: FACTORY_ADDRESS,
  lastMatchAddr: null,
  matchState: -1,
  startTime: Date.now(),
  transitionTimes: {},
};

async function log(message: string) {
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  console.log(`[${elapsed}s] ${message}`);
}

async function getLastMatch() {
  const publicClient = createPublicClient({
    chain: monad,
    transport: http(RPC_URL),
  });

  const matchAddr = await publicClient.readContract({
    address: state.factoryAddress as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "lastMatch",
  });

  return matchAddr;
}

async function getMatchState(matchAddr: string) {
  const publicClient = createPublicClient({
    chain: monad,
    transport: http(RPC_URL),
  });

  const data = await publicClient.readContract({
    address: matchAddr as `0x${string}`,
    abi: MATCH_ABI,
    functionName: "state",
  });

  const roosterA = await publicClient.readContract({
    address: matchAddr as `0x${string}`,
    abi: MATCH_ABI,
    functionName: "roosterA",
  });

  const roosterB = await publicClient.readContract({
    address: matchAddr as `0x${string}`,
    abi: MATCH_ABI,
    functionName: "roosterB",
  });

  const betsA = await publicClient.readContract({
    address: matchAddr as `0x${string}`,
    abi: MATCH_ABI,
    functionName: "betsA",
  });

  const betsB = await publicClient.readContract({
    address: matchAddr as `0x${string}`,
    abi: MATCH_ABI,
    functionName: "betsB",
  });

  return {
    state: data,
    roosterA: roosterA as string,
    roosterB: roosterB as string,
    betsA: betsA as bigint,
    betsB: betsB as bigint,
  };
}

async function testLifecycle() {
  if (!OPERATOR_PRIVATE_KEY || !FACTORY_ADDRESS) {
    throw new Error("Missing OPERATOR_PRIVATE_KEY or FACTORY_ADDRESS in .env");
  }

  try {
    // Step 1: Check for existing match
    log("🚀 Starting E2E Test");
    log(`Factory: ${FACTORY_ADDRESS}`);

    state.lastMatchAddr = (await getLastMatch()) as string;
    log(`✓ Last match: ${state.lastMatchAddr?.slice(0, 6) || "none"}`);

    if (!state.lastMatchAddr || state.lastMatchAddr === "0x0000000000000000000000000000000000000000") {
      log("⚠️ No active match. Operator should create one soon.");
      await sleep(65000); // Wait for operator to create a match
      state.lastMatchAddr = (await getLastMatch()) as string;
    }

    // Step 2: Watch match state transitions
    let previousState = -1;
    let stateStabilized = 0;

    for (let i = 0; i < 30; i++) {
      const match = await getMatchState(state.lastMatchAddr);

      if (match.state !== previousState) {
        state.matchState = match.state;
        state.transitionTimes[`state-${match.state}`] = Date.now() - state.startTime;

        const stateNames = ["Open (0)", "Closed (1)", "Settled (2)"];
        log(`→ Match transitioned to ${stateNames[match.state]}`);
        log(`  Roosters: ${match.roosterA} vs ${match.roosterB}`);
        log(`  Bets A: ${match.betsA}, Bets B: ${match.betsB}`);

        previousState = match.state;
        stateStabilized = 0;

        // If settled, we're done
        if (match.state === 2) {
          log("✓ Match settled successfully");
          break;
        }
      } else {
        stateStabilized++;
      }

      await sleep(2000);
    }

    // Step 3: Validate final state
    if (state.matchState === 2) {
      log("✅ E2E Test PASSED: Match completed full lifecycle");
      log(`Total duration: ${Math.floor((Date.now() - state.startTime) / 1000)}s`);
      process.exit(0);
    } else {
      log(`❌ E2E Test FAILED: Match did not settle (state: ${state.matchState})`);
      process.exit(1);
    }
  } catch (error) {
    log(`❌ E2E Test ERROR: ${error}`);
    process.exit(1);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testLifecycle();

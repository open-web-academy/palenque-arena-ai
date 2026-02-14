import * as dotenv from "dotenv";
import { initContractClients } from "./contract";
import { Operator } from "./operator";

dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://rpc.monad.xyz";
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
const MATCH_INTERVAL = parseInt(process.env.MATCH_INTERVAL || "60", 10);
const BETTING_WINDOW = parseInt(process.env.BETTING_WINDOW || "60", 10);
const AUTO_SETTLE_DELAY = parseInt(
  process.env.AUTO_SETTLE_DELAY || "5",
  10
);

async function main() {
  if (!OPERATOR_PRIVATE_KEY || !FACTORY_ADDRESS) {
    console.error("Missing required env vars: OPERATOR_PRIVATE_KEY, FACTORY_ADDRESS");
    process.exit(1);
  }

  console.log("[Operator] Starting Palenque Arena Operator");
  console.log(`[Operator] RPC: ${RPC_URL}`);
  console.log(`[Operator] Factory: ${FACTORY_ADDRESS}`);
  console.log(`[Operator] Interval: ${MATCH_INTERVAL}s`);

  const clients = initContractClients(
    RPC_URL,
    OPERATOR_PRIVATE_KEY,
    FACTORY_ADDRESS
  );

  const operator = new Operator(
    clients,
    FACTORY_ADDRESS,
    MATCH_INTERVAL,
    BETTING_WINDOW,
    AUTO_SETTLE_DELAY
  );

  // Main loop
  console.log("[Operator] Starting main loop...");
  while (true) {
    const startTime = Date.now();
    await operator.tick();
    const elapsed = Date.now() - startTime;
    const waitTime = Math.max(0, MATCH_INTERVAL * 1000 - elapsed);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}

main().catch((err) => {
  console.error("[Operator] Fatal error:", err);
  process.exit(1);
});

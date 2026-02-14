import dotenv from "dotenv";
dotenv.config();

import { config, validateConfig } from "./config";
import { initClients } from "./contract";
import { Operator } from "./operator";
import { log } from "./utils/logger";

async function main() {
  try {
    validateConfig();
  } catch (err) {
    log(`Config error: ${err}`, "error");
    process.exit(1);
  }

  log("Initializing operator...");
  const clients = await initClients(
    config.rpcUrl,
    config.operatorPrivateKey,
    config.factoryAddress
  );
  const operator = new Operator(clients, config.factoryAddress, config);

  log(`Operator started. Tick every ${config.matchInterval}s`);

  while (true) {
    try {
      await operator.tick();
    } catch (error) {
      log(`Operator error: ${error}`, "error");
    }
    await new Promise(p => setTimeout(p, config.matchInterval * 1000));
  }
}

main().catch(err => {
  log(`Fatal error: ${err}`, "error");
  process.exit(1);
});

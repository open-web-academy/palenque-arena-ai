import dotenv from "dotenv";
dotenv.config();

import { config, validateConfig } from "./config";
import { initClients } from "./contract";
import { Operator } from "./operator";
import { ElementalOperator } from "./operator-elemental";
import { RuletaOperator } from "./operator-ruleta";
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

  const arenaOperator = new Operator(clients, config.factoryAddress, config);
  const elementalOp = config.elementalFactoryAddress
    ? new ElementalOperator(clients, config.elementalFactoryAddress, config)
    : null;
  const ruletaOp = config.ruletaAddress
    ? new RuletaOperator(clients, config.ruletaAddress, config)
    : null;

  log(`Operator started. Arena: on. Elemental: ${elementalOp ? "on" : "off"}. Ruleta: ${ruletaOp ? "on" : "off"}. Tick every ${config.tickIntervalSec}s, match open ${config.matchInterval}s`);

  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 5;

  while (true) {
    try {
      await arenaOperator.tick();
      if (elementalOp) await elementalOp.tick();
      if (ruletaOp) await ruletaOp.tick();
      consecutiveErrors = 0;
    } catch (error) {
      consecutiveErrors++;
      log(`Operator error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}): ${error}`, "error");
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        log(`Too many consecutive errors. Shutting down.`, "error");
        process.exit(1);
      }
    }
    await new Promise((p) => setTimeout(p, config.tickIntervalSec * 1000));
  }
}

main().catch((err) => {
  log(`Fatal error: ${err}`, "error");
  process.exit(1);
});

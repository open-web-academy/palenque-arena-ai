export const config = {
  // Network
  rpcUrl: process.env.RPC_URL || "https://rpc.monad.xyz",
  operatorPrivateKey: (process.env.OPERATOR_PRIVATE_KEY || "").trim(),
  factoryAddress: process.env.FACTORY_ADDRESS || "",
  palTokenAddress: process.env.PAL_TOKEN_ADDRESS || "",

  // Optional: Elemental & Ruleta (if set, operator runs those modes too)
  elementalFactoryAddress: (process.env.ELEMENTAL_FACTORY_ADDRESS || "").trim(),
  ruletaAddress: (process.env.RULETA_ADDRESS || "").trim(),

  // Scheduling: how often the operator checks (tick) vs how long each match stays open for bets
  tickIntervalSec: parseInt(process.env.TICK_INTERVAL_SEC || "10"),
  matchInterval: parseInt(process.env.MATCH_INTERVAL || "60"),
  bettingWindow: parseInt(process.env.BETTING_WINDOW || "60"),
  autoSettleDelay: parseInt(process.env.AUTO_SETTLE_DELAY || "5"),

  // Roosters
  roosters: (process.env.ROOSTERS || "Phoenix,Dragon,Cyber-Falcon,Neon-Hawk").split(","),

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};

export function validateConfig() {
  const errors: string[] = [];
  if (!config.operatorPrivateKey) errors.push("OPERATOR_PRIVATE_KEY missing");
  if (!config.factoryAddress) errors.push("FACTORY_ADDRESS missing");
  if (!config.palTokenAddress) errors.push("PAL_TOKEN_ADDRESS missing");
  if (config.tickIntervalSec < 3) errors.push("TICK_INTERVAL_SEC must be >= 3");
  if (config.matchInterval < 5) errors.push("MATCH_INTERVAL must be >= 5");
  if (config.matchInterval < config.tickIntervalSec) errors.push("MATCH_INTERVAL should be >= TICK_INTERVAL_SEC so matches stay open for at least one tick");
  if (errors.length > 0) throw new Error(errors.join("; "));
}

export const config = {
  // Network
  rpcUrl: process.env.RPC_URL || "https://rpc.monad.xyz",
  operatorPrivateKey: (process.env.OPERATOR_PRIVATE_KEY || "").trim(),
  factoryAddress: process.env.FACTORY_ADDRESS || "",
  palTokenAddress: process.env.PAL_TOKEN_ADDRESS || "",

  // Scheduling
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
  if (config.matchInterval < 5) errors.push("MATCH_INTERVAL must be >= 5");
  if (errors.length > 0) throw new Error(errors.join("; "));
}

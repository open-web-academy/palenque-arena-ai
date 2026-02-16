import dotenv from "dotenv";
dotenv.config();

import { config, validateConfig } from "./config";
import { initClients } from "./contract";
import { Operator } from "./operator";
import { log } from "./utils/logger";

export const handler = async (event: any) => {
  try {
    validateConfig();
    
    log("Lambda tick: Starting operator...");
    
    const clients = await initClients(
      config.rpcUrl,
      config.operatorPrivateKey,
      config.factoryAddress
    );
    const operator = new Operator(clients, config.factoryAddress, config);
    
    await operator.tick();
    
    log("Lambda tick: Success");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Operator tick successful" })
    };
  } catch (error) {
    log(`Lambda error: ${error}`, "error");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(error) })
    };
  }
};

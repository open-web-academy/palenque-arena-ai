import { createPublicClient, createWalletClient, http, getContract } from "viem";
import { monad } from "./monad";
import { privateKeyToAccount } from "viem/accounts";
import { FACTORY_ABI, MATCH_ABI } from "./abi";

export interface ContractClients {
  public: ReturnType<typeof createPublicClient>;
  wallet: ReturnType<typeof createWalletClient>;
  factory: ReturnType<typeof getContract>;
}

export function initContractClients(
  rpcUrl: string,
  privateKeyHex: string,
  factoryAddress: string
): ContractClients {
  const publicClient = createPublicClient({
    chain: monad,
    transport: http(rpcUrl),
  });

  const account = privateKeyToAccount(privateKeyHex as `0x${string}`);

  const walletClient = createWalletClient({
    chain: monad,
    transport: http(rpcUrl),
    account,
  });

  const factory = getContract({
    address: factoryAddress as `0x${string}`,
    abi: FACTORY_ABI,
    client: { public: publicClient, wallet: walletClient },
  });

  return { public: publicClient, wallet: walletClient, factory };
}

export async function getMatchContract(
  clients: ContractClients,
  matchAddress: string
) {
  return getContract({
    address: matchAddress as `0x${string}`,
    abi: MATCH_ABI,
    client: { public: clients.public, wallet: clients.wallet },
  });
}

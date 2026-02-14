import {
  createPublicClient,
  createWalletClient,
  http,
  getContract,
  parseAbi,
} from "viem";
import { monad } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const FACTORY_ABI = parseAbi([
  "function createMatch(string roosterA, string roosterB, uint256 startTime, uint256 closeDuration) returns (address)",
  "function getLastMatch() view returns (address)",
  "function matchCount() view returns (uint256)",
]);

const MATCH_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function roosterA() view returns (string)",
  "function roosterB() view returns (string)",
  "function closeTime() view returns (uint256)",
  "function closeBets()",
  "function commit(bytes32 _commitHash)",
  "function reveal(uint256 seed)",
]);

export async function initClients(
  rpcUrl: string,
  privateKey: string,
  factoryAddress: string
) {
  const publicClient = createPublicClient({
    chain: monad,
    transport: http(rpcUrl),
  });

  const account = privateKeyToAccount(privateKey as `0x${string}`);

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

  return { publicClient, walletClient, account, factory };
}

export async function getLastMatch(factory: any) {
  return await factory.read.getLastMatch();
}

export async function createMatch(
  factory: any,
  roosterA: string,
  roosterB: string,
  startTime: bigint,
  closeDuration: bigint
) {
  const hash = await factory.write.createMatch([
    roosterA,
    roosterB,
    startTime,
    closeDuration,
  ]);
  return hash;
}

export async function getMatchState(
  publicClient: any,
  matchAddress: string
) {
  const [state, roosterA, roosterB, closeTime] = await Promise.all([
    publicClient.readContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "state",
    }),
    publicClient.readContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "roosterA",
    }),
    publicClient.readContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "roosterB",
    }),
    publicClient.readContract({
      address: matchAddress as `0x${string}`,
      abi: MATCH_ABI,
      functionName: "closeTime",
    }),
  ]);

  return { state, roosterA, roosterB, closeTime };
}

export async function closeBets(
  walletClient: any,
  publicClient: any,
  matchAddress: string
) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: matchAddress as `0x${string}`,
    abi: MATCH_ABI,
    functionName: "closeBets",
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function commit(
  walletClient: any,
  publicClient: any,
  matchAddress: string,
  commitHash: `0x${string}`
) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: matchAddress as `0x${string}`,
    abi: MATCH_ABI,
    functionName: "commit",
    args: [commitHash],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function reveal(
  walletClient: any,
  publicClient: any,
  matchAddress: string,
  seed: bigint
) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: matchAddress as `0x${string}`,
    abi: MATCH_ABI,
    functionName: "reveal",
    args: [seed],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

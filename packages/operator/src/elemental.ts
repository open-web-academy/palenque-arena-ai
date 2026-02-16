import { getContract, parseAbi } from "viem";

const ELEMENTAL_FACTORY_ABI = parseAbi([
  "function createMatch(uint256 startTime, uint256 closeDuration) returns (address)",
  "function getLastMatch() view returns (address)",
  "function matchCount() view returns (uint256)",
]);

const ELEMENTAL_MATCH_ABI = parseAbi([
  "function state() view returns (uint8)",
  "function closeTime() view returns (uint256)",
  "function closeBets()",
  "function commit(bytes32 _commitHash)",
  "function reveal(uint256 seed)",
]);

export function getElementalFactory(factoryAddress: `0x${string}`, client: any) {
  return getContract({
    address: factoryAddress,
    abi: ELEMENTAL_FACTORY_ABI,
    client: { public: client.publicClient, wallet: client.walletClient },
  });
}

export async function getElementalMatchState(publicClient: any, matchAddress: string) {
  const [state, closeTime] = await Promise.all([
    publicClient.readContract({
      address: matchAddress as `0x${string}`,
      abi: ELEMENTAL_MATCH_ABI,
      functionName: "state",
    }),
    publicClient.readContract({
      address: matchAddress as `0x${string}`,
      abi: ELEMENTAL_MATCH_ABI,
      functionName: "closeTime",
    }),
  ]);
  return { state: Number(state), closeTime };
}

export async function createElementalMatch(factory: any, startTime: bigint, closeDuration: bigint) {
  return factory.write.createMatch([startTime, closeDuration]);
}

export async function elementalCloseBets(walletClient: any, publicClient: any, matchAddress: string) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: matchAddress as `0x${string}`,
    abi: ELEMENTAL_MATCH_ABI,
    functionName: "closeBets",
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function elementalCommit(walletClient: any, publicClient: any, matchAddress: string, commitHash: `0x${string}`) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: matchAddress as `0x${string}`,
    abi: ELEMENTAL_MATCH_ABI,
    functionName: "commit",
    args: [commitHash],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function elementalReveal(walletClient: any, publicClient: any, matchAddress: string, seed: bigint) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: matchAddress as `0x${string}`,
    abi: ELEMENTAL_MATCH_ABI,
    functionName: "reveal",
    args: [seed],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

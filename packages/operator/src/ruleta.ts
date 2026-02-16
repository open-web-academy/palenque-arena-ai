import { getContract, parseAbi } from "viem";

const RULETA_ABI = parseAbi([
  "function roundCount() view returns (uint256)",
  "function roundState(uint256) view returns (uint8)",
  "function closeTime(uint256) view returns (uint256)",
  "function startRound(uint256 closeTime)",
  "function closeBets(uint256 roundId)",
  "function commit(uint256 roundId, bytes32 _commitHash)",
  "function reveal(uint256 roundId, uint256 seed)",
]);

export function getRuletaContract(ruletaAddress: `0x${string}`, client: any) {
  return getContract({
    address: ruletaAddress,
    abi: RULETA_ABI,
    client: { public: client.publicClient, wallet: client.walletClient },
  });
}

export async function getRuletaState(publicClient: any, ruletaAddress: string) {
  const count = await publicClient.readContract({
    address: ruletaAddress as `0x${string}`,
    abi: RULETA_ABI,
    functionName: "roundCount",
  });
  const n = Number(count);
  if (n === 0) return { roundId: 0, state: -1, closeTime: 0n };
  const roundId = n - 1;
  const [state, closeTime] = await Promise.all([
    publicClient.readContract({
      address: ruletaAddress as `0x${string}`,
      abi: RULETA_ABI,
      functionName: "roundState",
      args: [BigInt(roundId)],
    }),
    publicClient.readContract({
      address: ruletaAddress as `0x${string}`,
      abi: RULETA_ABI,
      functionName: "closeTime",
      args: [BigInt(roundId)],
    }),
  ]);
  return { roundId, state: Number(state), closeTime };
}

export async function ruletaStartRound(ruleta: any, closeTime: bigint) {
  return ruleta.write.startRound([closeTime]);
}

export async function ruletaCloseBets(walletClient: any, publicClient: any, ruletaAddress: string, roundId: number) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: ruletaAddress as `0x${string}`,
    abi: RULETA_ABI,
    functionName: "closeBets",
    args: [BigInt(roundId)],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function ruletaCommit(walletClient: any, publicClient: any, ruletaAddress: string, roundId: number, commitHash: `0x${string}`) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: ruletaAddress as `0x${string}`,
    abi: RULETA_ABI,
    functionName: "commit",
    args: [BigInt(roundId), commitHash],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function ruletaReveal(walletClient: any, publicClient: any, ruletaAddress: string, roundId: number, seed: bigint) {
  const hash = await walletClient.writeContract({
    account: walletClient.account,
    address: ruletaAddress as `0x${string}`,
    abi: RULETA_ABI,
    functionName: "reveal",
    args: [BigInt(roundId), seed],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

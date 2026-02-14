import { keccak256, toHex, concat } from "viem";

export function generateSeed(): bigint {
  const random = Math.random().toString(36).slice(2);
  return BigInt(parseInt(random, 36));
}

export function createCommitHash(seed: bigint, operatorAddress: string): `0x${string}` {
  return keccak256(
    concat([toHex(seed), operatorAddress as `0x${string}`])
  );
}

import { keccak256, toHex, concat } from "viem";
import { randomBytes } from "crypto";

export function generateSeed(): bigint {
  // 16 bytes de entropía, convertido a bigint sin pasar por number (sin pérdida de precisión)
  return BigInt("0x" + randomBytes(16).toString("hex"));
}

export function createCommitHash(
  seed: bigint,
  operatorAddress: string
): `0x${string}` {
  // Solidity: abi.encodePacked(uint256, address) -> uint256 = 32 bytes
  return keccak256(
    concat([toHex(seed, { size: 32 }), operatorAddress as `0x${string}`])
  );
}

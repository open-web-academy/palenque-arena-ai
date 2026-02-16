import { createPublicClient, http, PublicClient } from "viem";
import { RPC_URL } from "./contractAbis";

let publicClient: PublicClient | null = null;

export function getPublicClient(): PublicClient {
  if (!publicClient) {
    publicClient = createPublicClient({
      transport: http(RPC_URL),
    });
  }
  return publicClient;
}

export async function getBalance(
  address: string,
  tokenAddress?: string
): Promise<bigint> {
  const client = getPublicClient();

  if (tokenAddress) {
    // ERC20 balance
    return (await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: [
        {
          type: "function",
          name: "balanceOf",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ type: "uint256" }],
          stateMutability: "view",
        },
      ],
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    })) as bigint;
  } else {
    // Native MON balance
    return await client.getBalance({ address: address as `0x${string}` });
  }
}

export function formatBalance(balance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const remainder = balance % divisor;
  const fractional = remainder
    .toString()
    .padStart(decimals, "0")
    .slice(0, 2);
  return `${whole}.${fractional}`;
}

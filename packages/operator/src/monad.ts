// Monad chain configuration for viem
import { defineChain } from "viem";

export const monad = defineChain({
  id: 143,
  name: "Monad",
  network: "monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.monad.xyz"] },
    public: { http: ["https://rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monadscan", url: "https://monadscan.com" },
  },
});

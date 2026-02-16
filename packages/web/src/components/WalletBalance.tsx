import { useAccount, useBalance } from "wagmi";
import { Wallet, Coins } from "lucide-react";
import { motion } from "framer-motion";

const PAL_TOKEN = import.meta.env.VITE_PAL_TOKEN_ADDRESS as `0x${string}` | undefined;

export function WalletBalance() {
  const { address, isConnected } = useAccount();
  const { data: monBalance } = useBalance({ address });
  const { data: palBalance } = useBalance({
    address,
    token: PAL_TOKEN,
  });

  if (!isConnected || !address) return null;

  const mon = monBalance ? (Number(monBalance.value) / 1e18).toFixed(2) : "—";
  const pal = palBalance ? (Number(palBalance.value) / 1e18).toFixed(2) : "—";

  return (
    <motion.div
      className="flex items-center gap-3 md:gap-4 px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-charcoal/90 border border-gold/20"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-1.5 md:gap-2 text-gold">
        <Wallet className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
        <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">MON</span>
        <span className="font-numeric text-sm md:text-base font-semibold text-white">{mon}</span>
      </div>
      {PAL_TOKEN && (
        <div className="flex items-center gap-1.5 md:gap-2 text-emerald">
          <Coins className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">PAL</span>
          <span className="font-numeric text-sm md:text-base font-semibold text-white">{pal}</span>
        </div>
      )}
    </motion.div>
  );
}

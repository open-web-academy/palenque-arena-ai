import { Link, useLocation } from "react-router-dom";
import { WalletBalance } from "./WalletBalance";
import { ConnectKitButton } from "connectkit";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const GAME_MODES = [
  { path: "/arena-clasica", label: "Classic Arena" },
  { path: "/elemental", label: "Elemental" },
  { path: "/ruleta", label: "Roulette" },
];

export function Navbar() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const historyHref = location.pathname === "/arena-clasica" ? "#history" : "/arena-clasica#history";

  return (
    <nav className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-4 md:px-6 bg-obsidian/98 backdrop-blur-xl border-b border-gold/20 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-6 md:gap-8 min-w-0">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img src="/logogallos.png" alt="" className="w-10 h-10 flex-shrink-0 object-contain" aria-hidden />
          <span className="font-display text-xl md:text-2xl font-normal tracking-[0.12em] text-gold truncate">
            Palenque <span className="text-arena-red">Arena</span>
          </span>
        </Link>

        <Link
          to="/"
          className="hidden md:inline text-sm font-medium text-gray-400 hover:text-gold transition-colors"
        >
          Play
        </Link>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gold transition-colors"
          >
            Game Modes <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 py-2 rounded-xl bg-charcoal border border-gold/20 shadow-xl min-w-[180px]">
              {GAME_MODES.map((m) => (
                <Link
                  key={m.path}
                  to={m.path}
                  className={`block px-4 py-2 text-sm hover:bg-gold/10 ${location.pathname === m.path ? "text-gold" : "text-gray-300"}`}
                  onClick={() => setDropdownOpen(false)}
                >
                  {m.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <a
          href={historyHref}
          className="hidden md:inline text-sm font-medium text-gray-400 hover:text-gold transition-colors"
        >
          History
        </a>
      </div>

      <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
        <WalletBalance />
        <ConnectKitButton />
      </div>
    </nav>
  );
}

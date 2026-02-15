import {
  Bird,
  Landmark,
  Wallet,
  Coins,
  Trophy,
  Swords,
  Zap,
  Radio,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ChevronRight,
} from "lucide-react";

const defaultSize = 24;

type IconProps = React.SVGAttributes<SVGElement> & { size?: number };

function iconSize(props: IconProps): number {
  return props.size ?? (props as { width?: number }).width ?? defaultSize;
}

/** Dos gallos enfrentados / peleando — SVG custom */
export function IconRoosterFight(props: IconProps) {
  const s = iconSize(props);
  const className = props.className ?? "";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Gallo izquierdo: cresta, cabeza, cuello, cuerpo, cola, pata */}
      <path d="M8 14h2l1 2 1-1 2 4 1 6-1 4-2 2-2-1-1-4" />
      <path d="M10 22l-2 4v4l1 2 2 1" />
      <path d="M12 16l-3 2v2l2 2" />
      {/* Gallo derecho: simétrico, enfrentado */}
      <path d="M40 14h-2l-1 2-1-1-2 4-1 6 1 4 2 2 2-1 1-4" />
      <path d="M38 22l2 4v4l-1 2-2 1" />
      <path d="M36 16l3 2v2l-2 2" />
      {/* Punto de impacto entre ambos */}
      <circle cx="24" cy="22" r="1.5" fill="currentColor" opacity={0.9} />
    </svg>
  );
}

export function IconRooster(props: IconProps) {
  return <Bird {...props} size={iconSize(props)} aria-hidden />;
}

export function IconArena(props: IconProps) {
  return <Landmark {...props} size={iconSize(props)} aria-hidden />;
}

export function IconWallet(props: IconProps) {
  return <Wallet {...props} size={iconSize(props)} aria-hidden />;
}

export function IconCoins(props: IconProps) {
  return <Coins {...props} size={iconSize(props)} aria-hidden />;
}

export function IconTrophy(props: IconProps) {
  return <Trophy {...props} size={iconSize(props)} aria-hidden />;
}

export function IconVS(props: IconProps) {
  return <Swords {...props} size={iconSize(props)} aria-hidden />;
}

export function IconBoost(props: IconProps) {
  return <Zap {...props} size={iconSize(props)} aria-hidden />;
}

export function IconLive(props: IconProps) {
  return <Radio {...props} size={iconSize(props)} aria-hidden />;
}

export function IconLoader(props: IconProps) {
  const { className, ...rest } = props;
  return <Loader2 {...rest} className={["spin", className].filter(Boolean).join(" ")} size={iconSize(props)} aria-hidden />;
}

export function IconSuccess(props: IconProps) {
  return <CheckCircle2 {...props} size={iconSize(props)} aria-hidden />;
}

export function IconError(props: IconProps) {
  return <XCircle {...props} size={iconSize(props)} aria-hidden />;
}

export function IconWarning(props: IconProps) {
  return <AlertTriangle {...props} size={iconSize(props)} aria-hidden />;
}

export function IconInfo(props: IconProps) {
  return <Info {...props} size={iconSize(props)} aria-hidden />;
}

export function IconChevron(props: IconProps) {
  return <ChevronRight {...props} size={iconSize(props)} aria-hidden />;
}

import "./LiveOdds.css";

interface LiveOddsProps {
  pA: bigint;
  pB: bigint;
  roosterA: string;
  roosterB: string;
}

export function LiveOdds({ pA, pB, roosterA, roosterB }: LiveOddsProps) {
  const pAPercent = (Number(pA) / 1e6 * 100).toFixed(1);
  const pBPercent = (Number(pB) / 1e6 * 100).toFixed(1);

  return (
    <div className="live-odds">
      <h4>Current Odds</h4>
      <div className="odds-grid">
        <div className="odds-item">
          <p className="rooster">{roosterA}</p>
          <p className="percentage">{pAPercent}%</p>
        </div>
        <div className="odds-item">
          <p className="rooster">{roosterB}</p>
          <p className="percentage">{pBPercent}%</p>
        </div>
      </div>
    </div>
  );
}

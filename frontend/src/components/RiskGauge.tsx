import type { RiskLevel } from '@/types';

interface RiskGaugeProps {
  confidence: number | null;
  riskLevel?: RiskLevel;
}

export default function RiskGauge({ confidence, riskLevel }: RiskGaugeProps) {
  if (confidence === null) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 text-center">
        <span className="text-sm font-semibold text-navy-800">Confidence Unavailable</span>
        <p className="mt-1 text-xs text-navy-500 max-w-[200px] leading-relaxed">
          The selected model (SVM) uses decision-boundary margins rather than probabilistic outputs.
        </p>
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(100, confidence));
  const angle = (clamped / 100) * 180; // 0 to 180 degrees
  const radius = 76;
  const cx = 110;
  const cy = 96;

  // Semicircle arc length for strokeDasharray
  const arcLength = Math.PI * radius; // ~238.76px
  const strokeOffset = arcLength * (1 - clamped / 100);

  // Needle tip coordinates
  const needleLength = radius * 0.72; // ~54.7px
  const needleAngleRad = (angle * Math.PI) / 180;
  const needleX = cx - needleLength * Math.cos(needleAngleRad);
  const needleY = cy - needleLength * Math.sin(needleAngleRad);

  // Gradient ID and color accents
  const gradientId = 'confidence-gradient';

  const getConfidenceBadge = () => {
    if (clamped >= 80) return { label: 'High Confidence', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (clamped >= 60) return { label: 'Moderate Confidence', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { label: 'Low Confidence', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  const badge = getConfidenceBadge();

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[230px]">
        <svg
          viewBox="0 0 220 120"
          className="w-full overflow-visible"
          role="img"
          aria-label={`Model confidence: ${clamped.toFixed(2)}%`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="hub-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Semicircle background track */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Animated active progress arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeOffset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Subtle tick indicators */}
          <text x={cx - radius} y={cy + 17} textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">
            0%
          </text>
          <text x={cx} y={cy - radius - 8} textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">
            50%
          </text>
          <text x={cx + radius} y={cy + 17} textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">
            100%
          </text>

          {/* Dial Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Needle Center Hub (with shadow and dual concentric rings) */}
          <circle cx={cx} cy={cy} r="7" fill="#0f172a" filter="url(#hub-shadow)" />
          <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* Numerical confidence readout completely separated from the needle */}
      <div className="mt-2 flex flex-col items-center">
        <div className="inline-flex items-baseline gap-1 rounded-2xl bg-white px-4 py-1 border border-slate-200/90 shadow-xs">
          <span className="text-3xl font-extrabold tracking-tight text-navy-950 font-mono">
            {clamped.toFixed(2)}
          </span>
          <span className="text-lg font-bold text-primary-600">%</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Model Confidence
          </span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>
    </div>
  );
}

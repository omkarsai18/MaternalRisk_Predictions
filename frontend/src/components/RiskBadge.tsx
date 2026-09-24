import type { RiskLevel } from '@/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
  'low risk': {
    bg: 'bg-risk-lowBg',
    text: 'text-risk-low',
    border: 'border-risk-low/30',
    label: 'LOW RISK',
  },
  'mid risk': {
    bg: 'bg-risk-midBg',
    text: 'text-risk-mid',
    border: 'border-risk-mid/30',
    label: 'MID RISK',
  },
  'high risk': {
    bg: 'bg-risk-highBg',
    text: 'text-risk-high',
    border: 'border-risk-high/30',
    label: 'HIGH RISK',
  },
};

export default function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const c = config[level] ?? config['mid risk'];
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-5 py-2.5 text-base' : 'px-3.5 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${c.bg} ${c.text} ${c.border} ${sizeClass}`}
      role="status"
      aria-label={`Predicted risk level: ${c.label}`}
    >
      <span className={`h-2 w-2 rounded-full ${c.text.replace('text-', 'bg-')}`} aria-hidden="true" />
      {c.label}
    </span>
  );
}

import { Info } from 'lucide-react';

interface DisclaimerProps {
  text?: string;
  variant?: 'default' | 'compact';
}

export default function Disclaimer({
  text = 'This system is developed for educational and research purposes and should not replace professional medical advice or clinical decision-making.',
  variant = 'default',
}: DisclaimerProps) {
  if (variant === 'compact') {
    return (
      <p className="flex items-start gap-2 text-xs text-navy-400 leading-relaxed italic">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        {text}
      </p>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <Info className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
      <p className="text-sm text-amber-800 leading-relaxed">{text}</p>
    </div>
  );
}

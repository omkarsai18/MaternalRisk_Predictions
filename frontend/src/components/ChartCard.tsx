import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, description, children, className = '' }: ChartCardProps) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-navy-500">{description}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

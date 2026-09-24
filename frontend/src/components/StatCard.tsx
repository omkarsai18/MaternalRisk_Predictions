import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  value: string;
  label: string;
  icon: LucideIcon;
}

export default function StatCard({ value, label, icon: Icon }: StatCardProps) {
  return (
    <div className="card card-hover p-6 text-center animate-fade-in-up">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
        <Icon className="h-6 w-6 text-primary-600" strokeWidth={2} />
      </div>
      <div className="text-3xl font-bold text-navy-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-navy-500">{label}</div>
    </div>
  );
}

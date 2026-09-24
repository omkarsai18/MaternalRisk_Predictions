import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to?: string;
  linkLabel?: string;
}

import { Link } from 'react-router-dom';

export default function FeatureCard({ icon: Icon, title, description, to, linkLabel }: FeatureCardProps) {
  return (
    <div className="card card-hover p-6 animate-fade-in-up">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-teal-400">
        <Icon className="h-5 w-5 text-white" strokeWidth={2} />
      </div>
      <h3 className="mb-2 text-base font-semibold text-navy-900">{title}</h3>
      <p className="text-sm text-navy-500 leading-relaxed">{description}</p>
      {to && (
        <Link
          to={to}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          {linkLabel ?? 'Learn more'}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

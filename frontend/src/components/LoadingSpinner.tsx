interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      <p className="text-sm font-medium text-navy-500">{label}</p>
    </div>
  );
}

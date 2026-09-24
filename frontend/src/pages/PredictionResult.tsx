import { useLocation, useNavigate } from 'react-router-dom';
import type { PredictionResult } from '@/types';
import ResultCard from '@/components/ResultCard';
import { Stethoscope, ArrowLeft } from 'lucide-react';

export default function PredictionResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { result?: PredictionResult } | null)?.result;

  if (!result) {
    return (
      <div className="section-padding">
        <div className="container-max max-w-4xl">
          <div className="card p-12 text-center border border-slate-200 shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 border border-primary-100">
              <Stethoscope className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900">No Prediction Record Found</h2>
            <p className="mt-2 text-sm text-navy-500 max-w-md mx-auto">
              Please submit clinical healthcare parameters in the prediction form to view algorithmic assessment results.
            </p>
            <button
              type="button"
              onClick={() => navigate('/predict')}
              className="btn-primary mt-6 px-6 py-2.5 inline-flex items-center gap-2 shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Prediction Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-max max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1 text-xs font-semibold text-primary-700">
            <Stethoscope className="h-3.5 w-3.5" />
            Clinical Assessment Completed
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 sm:text-4xl tracking-tight">
            Prediction Result & Analysis
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
            Review the machine learning risk classification, model certainty, and evaluated clinical measurements.
          </p>
        </div>

        <ResultCard result={result} />
      </div>
    </div>
  );
}

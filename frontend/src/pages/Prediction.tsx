import { Stethoscope } from 'lucide-react';
import PredictionForm from '@/components/PredictionForm';
import Disclaimer from '@/components/Disclaimer';

export default function Prediction() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
            <Stethoscope className="h-3.5 w-3.5" />
            Single Prediction
          </div>
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">Maternal Risk Prediction</h1>
          <p className="mt-3 text-navy-500 max-w-2xl mx-auto">
            Enter six clinical healthcare parameters to predict maternal health risk level using the trained Random Forest model.
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="mb-6 rounded-lg bg-primary-50/50 p-4">
            <p className="text-sm text-navy-600 leading-relaxed">
              <span className="font-semibold text-navy-800">Instructions:</span> Fill in all six healthcare parameters below.
              The values are validated against application-defined ranges. After submission, the data is sent to the
              prediction service for processing.
            </p>
          </div>
          <PredictionForm />
        </div>

        <div className="mt-6">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}

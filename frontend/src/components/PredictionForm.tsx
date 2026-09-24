import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { PredictionInput, ApiError, PredictionModel } from '@/types';
import { INPUT_FEATURES } from '@/data/projectData';
import { getPredictionModels, predictMaternalRisk } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';

interface FieldConfig {
  name: keyof PredictionInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const fields: FieldConfig[] = INPUT_FEATURES.map((f) => ({
  name: f.name as keyof PredictionInput,
  label: f.label,
  unit: f.unit,
  min: f.min,
  max: f.max,
  step: f.step,
}));

function getDefaults(): PredictionInput {
  const defaults: Record<string, number> = {};
  for (const f of INPUT_FEATURES) {
    defaults[f.name] = f.defaultValue;
  }
  return defaults as unknown as PredictionInput;
}

export default function PredictionForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<PredictionInput>(getDefaults());
  const [errors, setErrors] = useState<Partial<Record<keyof PredictionInput, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('random_forest');

  useEffect(() => {
    getPredictionModels().then((result) => {
      if (result.data) setModels(result.data.filter((model) => model.available));
      if (result.error) setApiError(result.error);
    });
  }, []);

  function handleChange(field: keyof PredictionInput, value: string) {
    const num = parseFloat(value);
    setValues((prev) => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof PredictionInput, string>> = {};
    for (const field of fields) {
      const val = values[field.name];
      if (isNaN(val) || val === 0) {
        newErrors[field.name] = `${field.label} is required.`;
      } else if (val < field.min || val > field.max) {
        newErrors[field.name] = `${field.label} must be between ${field.min} and ${field.max} ${field.unit}.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    const { data, error } = await predictMaternalRisk(values, selectedModel);
    setLoading(false);

    if (error) {
      setApiError(error);
      return;
    }

    if (data) {
      navigate('/predict/result', { state: { result: data } });
    }
  }

  function resetForm() {
    setValues(getDefaults());
    setErrors({});
    setApiError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="prediction-model" className="input-label">Prediction Model</label>
        <select
          id="prediction-model"
          value={selectedModel}
          onChange={(event) => setSelectedModel(event.target.value)}
          className="input-field"
          disabled={loading || models.length === 0}
        >
          {models.length === 0 ? <option>Loading available models...</option> : models.map((model) => (
            <option key={model.id} value={model.id}>{model.name}{model.supportsProbability ? '' : ' (confidence unavailable)'}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-navy-500">The selected saved model from the backend will make this prediction.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="input-label">
              {field.label} <span className="text-navy-400 font-normal">({field.unit})</span>
            </label>
            <input
              id={field.name}
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              step={field.step}
              value={values[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`input-field ${errors[field.name] ? 'border-risk-high focus:border-risk-high focus:ring-risk-high/20' : ''}`}
              aria-invalid={!!errors[field.name]}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {errors[field.name] && (
              <p id={`${field.name}-error`} className="mt-1 text-xs text-risk-high" role="alert">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>

      {apiError && (
        <ErrorMessage message={apiError.message} onRetry={() => setApiError(null)} />
      )}

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
          Reset
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Predicting...
            </>
          ) : (
            'Predict Maternal Risk'
          )}
        </button>
      </div>
    </form>
  );
}

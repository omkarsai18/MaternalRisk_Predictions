import type { PredictionInput, PredictionResult, PredictionModel, ModelPerformance, FeatureImportanceItem, AblationExperiment, BulkPredictionRow, ApiError, RiskLevel, SystemStatus } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
const RISK_LEVELS: RiskLevel[] = ['low risk', 'mid risk', 'high risk'];

function errorType(status?: number): ApiError['type'] {
  if (status === 404) return 'not_found';
  if (status === 400 || status === 413 || status === 422) return 'validation';
  return 'server';
}

async function responseError(response: Response, context: string): Promise<ApiError> {
  const fallback = `The backend returned an error (${response.status}) while processing ${context}.`;
  try {
    const body = await response.json();
    return { message: String(body?.error?.message ?? fallback), type: errorType(response.status), details: body?.error?.details };
  } catch {
    return { message: fallback, type: errorType(response.status) };
  }
}

function networkError(error: unknown, context: string): ApiError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { message: `Unable to connect to the prediction service at ${API_BASE_URL}.`, type: 'network' };
  }
  return { message: `An unexpected error occurred during ${context}.`, type: 'server' };
}

function riskLevel(value: unknown): RiskLevel | null {
  const normalized = String(value ?? '').trim().toLowerCase() as RiskLevel;
  return RISK_LEVELS.includes(normalized) ? normalized : null;
}

export async function getSystemStatus(): Promise<{ data?: SystemStatus; error?: ApiError }> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (!response.ok) return { error: await responseError(response, 'system status') };
    return { data: await response.json() as SystemStatus };
  } catch (error) {
    return { error: networkError(error, 'system status') };
  }
}

export async function getPredictionModels(): Promise<{ data?: PredictionModel[]; error?: ApiError }> {
  try {
    const response = await fetch(`${API_BASE_URL}/models`);
    if (!response.ok) return { error: await responseError(response, 'available models') };
    const raw = await response.json();
    return { data: Array.isArray(raw.models) ? raw.models as PredictionModel[] : [] };
  } catch (error) {
    return { error: networkError(error, 'available models') };
  }
}

export async function predictMaternalRisk(input: PredictionInput, model: string): Promise<{ data?: PredictionResult; error?: ApiError }> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, model }) });
    if (!response.ok) return { error: await responseError(response, 'prediction') };
    const raw = await response.json();
    const level = riskLevel(raw.riskLevel);
    const confidence = raw.confidence === null ? null : Number(raw.confidence);
    if (!level || (confidence !== null && !Number.isFinite(confidence))) return { error: { message: 'The prediction service returned an invalid response.', type: 'server' } };
    return { data: { riskLevel: level, confidence, input, model: String(raw.model ?? model) } };
  } catch (error) {
    return { error: networkError(error, 'prediction') };
  }
}

type ResearchResponse<T> = { data: T[]; source: 'backend' | 'unavailable'; message?: string; error?: ApiError };

async function getResearchData<T>(path: string, context: string): Promise<ResearchResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) return { data: [], source: 'unavailable', error: await responseError(response, context) };
    const raw = await response.json();
    const data = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
    return { data, source: raw.status === 'unavailable' ? 'unavailable' : 'backend', message: raw.message };
  } catch (error) {
    return { data: [], source: 'unavailable', error: networkError(error, context) };
  }
}

export async function getModelPerformance(): Promise<ResearchResponse<ModelPerformance>> { return getResearchData('/model-performance', 'model performance'); }
export async function getFeatureImportance(): Promise<ResearchResponse<FeatureImportanceItem>> { return getResearchData('/feature-importance', 'feature importance'); }
export async function getAblationStudy(): Promise<ResearchResponse<AblationExperiment>> { return getResearchData('/ablation-study', 'ablation study'); }

export async function bulkPredict(records: PredictionInput[]): Promise<{ data?: BulkPredictionRow[]; invalidRows?: unknown; error?: ApiError }> {
  try {
    const response = await fetch(`${API_BASE_URL}/bulk-predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ records }) });
    if (!response.ok) return { error: await responseError(response, 'bulk prediction') };
    const raw = await response.json();
    if (!Array.isArray(raw.predictions)) return { error: { message: 'The bulk prediction service returned an invalid response.', type: 'server' } };
    const data: BulkPredictionRow[] = raw.predictions.map((item: Record<string, unknown>) => {
      const predictedRisk = riskLevel(item.predictedRisk);
      if (!predictedRisk) throw new Error('Invalid risk level');
      return { rowNumber: Number(item.rowNumber), Age: Number(item.Age), SystolicBP: Number(item.SystolicBP), DiastolicBP: Number(item.DiastolicBP), BS: Number(item.BS), BodyTemp: Number(item.BodyTemp), HeartRate: Number(item.HeartRate), predictedRisk, confidence: Number(item.confidence) };
    });
    return { data, invalidRows: raw.invalidRows };
  } catch (error) {
    return { error: networkError(error, 'bulk prediction') };
  }
}

export async function bulkPredictFile(file: File, model: string): Promise<{ data?: BulkPredictionRow[]; invalidRows?: unknown; error?: ApiError }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);
    const response = await fetch(`${API_BASE_URL}/predict-bulk`, { method: 'POST', body: formData });
    if (!response.ok) return { error: await responseError(response, 'bulk prediction') };
    const raw = await response.json();
    if (!Array.isArray(raw.predictions)) return { error: { message: 'The bulk prediction service returned an invalid response.', type: 'server' } };
    const data: BulkPredictionRow[] = raw.predictions.map((item: Record<string, unknown>) => {
      const predictedRisk = riskLevel(item.predictedRisk);
      if (!predictedRisk) throw new Error('Invalid risk level');
      return { rowNumber: Number(item.rowNumber), Age: Number(item.Age), SystolicBP: Number(item.SystolicBP), DiastolicBP: Number(item.DiastolicBP), BS: Number(item.BS), BodyTemp: Number(item.BodyTemp), HeartRate: Number(item.HeartRate), predictedRisk, confidence: item.confidence === null ? null : Number(item.confidence) };
    });
    return { data, invalidRows: raw.invalidRows };
  } catch (error) {
    return { error: networkError(error, 'bulk prediction') };
  }
}

export { API_BASE_URL };

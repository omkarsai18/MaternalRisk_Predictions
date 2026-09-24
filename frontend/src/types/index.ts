export type RiskLevel = 'low risk' | 'mid risk' | 'high risk';

export interface PredictionInput {
  Age: number;
  SystolicBP: number;
  DiastolicBP: number;
  BS: number;
  BodyTemp: number;
  HeartRate: number;
}

export interface PredictionResult {
  riskLevel: RiskLevel;
  confidence: number | null;
  input: PredictionInput;
  model?: string;
}

export interface PredictionModel {
  id: string;
  name: string;
  available: boolean;
  supportsProbability: boolean;
}

export interface ModelPerformance {
  model: string;
  datasetAccuracy: number;
  isBest?: boolean;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  description: string;
  unit: string;
}

export interface AblationExperiment {
  id: string;
  name: string;
  description: string;
  accuracy: number;
}

export interface BulkPredictionRow {
  rowNumber: number;
  Age: number;
  SystolicBP: number;
  DiastolicBP: number;
  BS: number;
  BodyTemp: number;
  HeartRate: number;
  predictedRisk: RiskLevel;
  confidence: number | null;
}

export interface BulkPredictionResult {
  predictions: BulkPredictionRow[];
  summary: {
    total: number;
    lowRisk: number;
    midRisk: number;
    highRisk: number;
  };
}

export interface ApiError {
  message: string;
  type: 'network' | 'server' | 'validation' | 'not_found';
  details?: unknown;
}

export interface SystemStatus {
  service: string;
  status: 'ready' | 'configuration_required' | 'unavailable';
  predictionReady: boolean;
  features: string[];
  message?: string | null;
}

import type {
  ModelPerformance,
  FeatureImportanceItem,
  AblationExperiment,
} from '@/types';

export const PROJECT_STATS = [
  { label: 'Healthcare Records', value: '1,014', icon: 'Database' },
  { label: 'Clinical Features', value: '6', icon: 'Activity' },
  { label: 'ML Models Evaluated', value: '8', icon: 'Cpu' },
  { label: 'Best Test Accuracy', value: '85.25%', icon: 'Target' },
] as const;

export const INPUT_FEATURES = [
  {
    name: 'Age',
    label: 'Age',
    unit: 'years',
    description: 'Maternal age in years.',
    min: 10,
    max: 100,
    step: 1,
    defaultValue: 25,
    icon: 'Calendar',
  },
  {
    name: 'SystolicBP',
    label: 'Systolic Blood Pressure',
    unit: 'mmHg',
    description: 'Systolic blood pressure.',
    min: 50,
    max: 250,
    step: 1,
    defaultValue: 120,
    icon: 'HeartPulse',
  },
  {
    name: 'DiastolicBP',
    label: 'Diastolic Blood Pressure',
    unit: 'mmHg',
    description: 'Diastolic blood pressure.',
    min: 30,
    max: 150,
    step: 1,
    defaultValue: 80,
    icon: 'HeartPulse',
  },
  {
    name: 'BS',
    label: 'Blood Sugar',
    unit: 'mmol/L',
    description: 'Blood sugar measurement.',
    min: 1,
    max: 30,
    step: 0.1,
    defaultValue: 6.5,
    icon: 'Droplet',
  },
  {
    name: 'BodyTemp',
    label: 'Body Temperature',
    unit: '°F',
    description: 'Body temperature.',
    min: 90,
    max: 110,
    step: 0.1,
    defaultValue: 98.6,
    icon: 'Thermometer',
  },
  {
    name: 'HeartRate',
    label: 'Heart Rate',
    unit: 'bpm',
    description: 'Heart rate.',
    min: 30,
    max: 220,
    step: 1,
    defaultValue: 75,
    icon: 'Pulse',
  },
] as const;

export const ML_MODELS = [
  { name: 'Logistic Regression', description: 'Linear model for classification.' },
  { name: 'K-Nearest Neighbors', description: 'Instance-based learning algorithm.' },
  { name: 'Support Vector Machine', description: 'Margin-based classifier with kernel functions.' },
  { name: 'Decision Tree', description: 'Tree-structured classifier with rule-based splits.' },
  { name: 'Random Forest', description: 'Ensemble of decision trees with bagging.', isBest: true },
  { name: 'Tuned KNN', description: 'KNN with optimized hyperparameters.' },
  { name: 'Tuned SVM', description: 'SVM with optimized hyperparameters.' },
  { name: 'Tuned Random Forest', description: 'Random Forest with optimized hyperparameters.' },
];

export const MODEL_PERFORMANCE: ModelPerformance[] = [
  { model: 'Logistic Regression', datasetAccuracy: 64.26 },
  { model: 'KNN', datasetAccuracy: 67.21 },
  { model: 'SVM', datasetAccuracy: 69.51 },
  { model: 'Decision Tree', datasetAccuracy: 82.62 },
  { model: 'Random Forest', datasetAccuracy: 85.25, isBest: true },
  { model: 'Tuned KNN', datasetAccuracy: 67.87 },
  { model: 'Tuned SVM', datasetAccuracy: 69.18 },
  { model: 'Tuned Random Forest', datasetAccuracy: 80.98 },
];

export const FEATURE_IMPORTANCE: FeatureImportanceItem[] = [
  { feature: 'BS', importance: 0.34986, description: 'Blood sugar measurement', unit: 'mmol/L' },
  { feature: 'SystolicBP', importance: 0.201089, description: 'Systolic blood pressure', unit: 'mmHg' },
  { feature: 'Age', importance: 0.151646, description: 'Maternal age', unit: 'years' },
  { feature: 'DiastolicBP', importance: 0.122992, description: 'Diastolic blood pressure', unit: 'mmHg' },
  { feature: 'HeartRate', importance: 0.097262, description: 'Heart rate', unit: 'bpm' },
  { feature: 'BodyTemp', importance: 0.077152, description: 'Body temperature', unit: '°F' },
];

export const ABLATION_STUDY: AblationExperiment[] = [
  {
    id: 'A1',
    name: 'No Feature Scaling',
    description: 'Baseline experiment without any feature scaling applied. The model trains on raw, unscaled feature values, which can disproportionately weight features with larger numeric ranges.',
    accuracy: 82.25,
  },
  {
    id: 'A2',
    name: 'Scaling + No Tuning',
    description: 'Feature scaling is applied but no hyperparameter tuning is performed. The model uses default hyperparameters, demonstrating the contribution of scaling alone.',
    accuracy: 82.75,
  },
  {
    id: 'A3',
    name: 'Reduced Feature Set',
    description: 'A reduced set of features is used, removing the least important features. This tests whether a smaller feature set can maintain predictive performance.',
    accuracy: 81.47,
  },
  {
    id: 'A4',
    name: 'Full Pipeline',
    description: 'The complete pipeline with feature scaling, hyperparameter tuning, and all six features. This represents the best-case configuration for the model.',
    accuracy: 82.94,
  },
];

export const METHODOLOGY_STEPS = [
  { step: 1, title: 'Dataset', description: 'Maternal Health Risk Dataset with 1,014 records and 6 clinical features.' },
  { step: 2, title: 'Data Preprocessing', description: 'Cleaning, encoding, and feature scaling applied to the raw data.' },
  { step: 3, title: 'Train/Test Split', description: 'Dataset split into training and testing subsets for model evaluation.' },
  { step: 4, title: 'Model Training', description: 'Eight machine learning algorithms trained on the processed data.' },
  { step: 5, title: '5-Fold Cross Validation', description: 'K-fold cross-validation to assess model generalization.' },
  { step: 6, title: 'Hyperparameter Tuning', description: 'Grid search and tuning applied to KNN, SVM, and Random Forest.' },
  { step: 7, title: 'Performance Evaluation', description: 'Models compared using test accuracy and cross-validation accuracy.' },
  { step: 8, title: 'Risk Prediction', description: 'Best-performing model deployed for maternal risk prediction.' },
];

export const HOW_IT_WORKS_STEPS = [
  { step: 1, title: 'Enter healthcare parameters', description: 'Provide six clinical measurements: Age, Blood Pressure, Blood Sugar, Body Temperature, and Heart Rate.' },
  { step: 2, title: 'The ML model processes the data', description: 'Your inputs are sent to the prediction service where the trained model processes them.' },
  { step: 3, title: 'Random Forest predicts risk level', description: 'The best-performing Random Forest classifier categorizes the data into Low, Mid, or High Risk.' },
  { step: 4, title: 'View prediction and confidence', description: 'See the predicted risk level along with model confidence and a summary of your inputs.' },
];

export const DISCLAIMER_SHORT =
  'This system is developed for educational and research purposes and should not replace professional medical advice or clinical decision-making.';

export const DISCLAIMER_PREDICTION =
  'This prediction is generated by a machine learning model for educational and research purposes and should not be used as a substitute for professional medical advice.';

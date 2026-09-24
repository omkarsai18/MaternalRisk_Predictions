import { useEffect, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import DataTable from '@/components/DataTable';
import ChartCard from '@/components/ChartCard';
import ErrorMessage from '@/components/ErrorMessage';
import Disclaimer from '@/components/Disclaimer';
import { bulkPredictFile, getPredictionModels } from '@/services/api';
import type { BulkPredictionRow, RiskLevel, ApiError, PredictionModel } from '@/types';

const REQUIRED_COLUMNS = ['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate'];

type Filter = 'all' | RiskLevel;

export default function BulkPrediction() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkPredictionRow[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('random_forest');

  useEffect(() => {
    getPredictionModels().then((result) => {
      if (result.data) setModels(result.data.filter((model) => model.available));
      if (result.error) setError(result.error);
    });
  }, []);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setValidationError(null);
    setResults(null);

    setParsing(true);
    try {
      await runPrediction(file);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to parse the file.');
    } finally {
      setParsing(false);
    }
  };

  const runPrediction = async (file: File) => {
    setPredicting(true);
    setError(null);
    const { data, error: apiError, invalidRows } = await bulkPredictFile(file, selectedModel);
    setPredicting(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    if (data) {
      setResults(data);
      if (Array.isArray(invalidRows) && invalidRows.length > 0) {
        setValidationError(`${invalidRows.length} invalid row(s) were not predicted. Downloaded results contain valid rows only.`);
      }
    }
  };

  const handleDownload = () => {
    if (!results) return;

    const header = 'Row,Age,SystolicBP,DiastolicBP,BS,BodyTemp,HeartRate,PredictedRisk,Confidence\n';
    const rows = results
      .map(
        (r) =>
          `${r.rowNumber},${r.Age},${r.SystolicBP},${r.DiastolicBP},${r.BS},${r.BodyTemp},${r.HeartRate},${r.predictedRisk},${r.confidence === null ? '' : r.confidence.toFixed(2)}`
      )
      .join('\n');

    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_predictions_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = results
    ? {
        total: results.length,
        low: results.filter((r) => r.predictedRisk === 'low risk').length,
        mid: results.filter((r) => r.predictedRisk === 'mid risk').length,
        high: results.filter((r) => r.predictedRisk === 'high risk').length,
      }
    : null;

  const chartData = summary
    ? [
        { name: 'Low Risk', value: summary.low, fill: '#16a34a' },
        { name: 'Mid Risk', value: summary.mid, fill: '#d97706' },
        { name: 'High Risk', value: summary.high, fill: '#dc2626' },
      ]
    : [];

  const pieData = summary && summary.total > 0
    ? chartData.map((d) => ({ ...d, pct: ((d.value / summary.total) * 100).toFixed(1) }))
    : [];

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: summary?.total ?? 0 },
    { key: 'low risk', label: 'Low Risk', count: summary?.low ?? 0 },
    { key: 'mid risk', label: 'Mid Risk', count: summary?.mid ?? 0 },
    { key: 'high risk', label: 'High Risk', count: summary?.high ?? 0 },
  ];

  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
            <Upload className="h-3.5 w-3.5" />
            Bulk Prediction
          </div>
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">Bulk Maternal Risk Prediction</h1>
          <p className="mt-3 text-navy-500 max-w-2xl mx-auto">
            Upload a CSV or Excel file containing maternal healthcare records to generate predictions for multiple individuals.
          </p>
        </div>

        {/* Required Columns Info */}
        <div className="mb-6 card p-5">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 flex-shrink-0 text-primary-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-navy-900">Required Columns</h3>
              <p className="mt-1 text-sm text-navy-500">
                The uploaded file must contain the following columns: <span className="font-mono font-semibold text-navy-700">Age, SystolicBP, DiastolicBP, BS, BodyTemp, HeartRate</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 card p-5">
          <label htmlFor="bulk-prediction-model" className="input-label">Prediction Model</label>
          <select id="bulk-prediction-model" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} className="input-field" disabled={parsing || predicting || models.length === 0}>
            {models.length === 0 ? <option>Loading available models...</option> : models.map((model) => (
              <option key={model.id} value={model.id}>{model.name}{model.supportsProbability ? '' : ' (confidence unavailable)'}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-navy-500">The selected model will be applied to every valid file row.</p>
        </div>

        {/* Upload Section */}
        <div className="mb-8 card p-6">
          <FileUpload onFileSelect={handleFileSelect} disabled={parsing || predicting} />

          {(parsing || predicting) && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-navy-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {parsing ? 'Parsing file...' : 'Sending records to backend for prediction...'}
            </div>
          )}

          {validationError && (
            <div className="mt-4">
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">{validationError}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <ErrorMessage message={error.message} />
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && summary && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-2 text-sm font-semibold text-risk-low">
              <CheckCircle2 className="h-5 w-5" />
              Predictions completed successfully
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="card p-5 text-center">
                <Users className="mx-auto mb-2 h-6 w-6 text-navy-400" />
                <div className="text-2xl font-bold text-navy-900">{summary.total}</div>
                <div className="text-xs text-navy-500">Total Records</div>
              </div>
              <div className="card p-5 text-center border-risk-low/20">
                <div className="mx-auto mb-2 h-2.5 w-2.5 rounded-full bg-risk-low" />
                <div className="text-2xl font-bold text-risk-low">{summary.low}</div>
                <div className="text-xs text-navy-500">Low Risk</div>
              </div>
              <div className="card p-5 text-center border-risk-mid/20">
                <div className="mx-auto mb-2 h-2.5 w-2.5 rounded-full bg-risk-mid" />
                <div className="text-2xl font-bold text-risk-mid">{summary.mid}</div>
                <div className="text-xs text-navy-500">Mid Risk</div>
              </div>
              <div className="card p-5 text-center border-risk-high/20">
                <div className="mx-auto mb-2 h-2.5 w-2.5 rounded-full bg-risk-high" />
                <div className="text-2xl font-bold text-risk-high">{summary.high}</div>
                <div className="text-xs text-navy-500">High Risk</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard title="Risk Distribution Chart" description="Number of records in each risk category">
                <div className="flex items-end justify-around h-64 gap-4 pt-4">
                  {chartData.map((d) => {
                    const maxVal = Math.max(...chartData.map((c) => c.value), 1);
                    const height = (d.value / maxVal) * 100;
                    return (
                      <div key={d.name} className="flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-navy-900">{d.value}</span>
                        <div
                          className="w-16 rounded-t-lg transition-all duration-700"
                          style={{ height: `${height * 2}px`, backgroundColor: d.fill }}
                        />
                        <span className="text-xs text-navy-500">{d.name}</span>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>

              <ChartCard title="Risk Percentage Chart" description="Proportion of each risk category">
                <div className="flex h-64 items-center justify-center">
                  <div className="w-full max-w-xs space-y-4">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-navy-600">{d.name}</span>
                            <span className="font-semibold text-navy-900">{d.pct}%</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${d.pct}%`, backgroundColor: d.fill }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    filter === f.key
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-navy-600 hover:bg-gray-50'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {/* Results Table */}
            <DataTable rows={results} filter={filter} />

            {/* Download Button */}
            <div className="flex justify-center">
              <button type="button" onClick={handleDownload} className="btn-primary">
                <Download className="h-4 w-4" />
                Download Results
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}

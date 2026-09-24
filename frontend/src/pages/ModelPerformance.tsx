import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3, Award, TrendingUp, Database } from 'lucide-react';
import ChartCard from '@/components/ChartCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getModelPerformance } from '@/services/api';
import type { ModelPerformance as ModelPerformanceType, ApiError } from '@/types';

export default function ModelPerformance() {
  const [data, setData] = useState<ModelPerformanceType[]>([]);
  const [source, setSource] = useState<'backend' | 'research' | 'unavailable'>('unavailable');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const result = await getModelPerformance();
      if (!active) return;
      setData(result.data);
      setSource(result.source);
      setNotice(result.message ?? null);
      setError(result.error ?? null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-max">
          <LoadingSpinner label="Loading model performance data..." />
        </div>
      </div>
    );
  }

  const bestModel = data.find((m) => m.isBest) ?? data.find((m) => m.model === 'Random Forest');

  const chartData = data.map((m) => ({
    name: m.model,
    datasetAccuracy: m.datasetAccuracy,
    isBest: m.isBest,
  }));

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
            <BarChart3 className="h-3.5 w-3.5" />
            Model Comparison
          </div>
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">Model Performance</h1>
          <p className="mt-3 text-navy-500 max-w-2xl mx-auto">
            Comparison of eight machine learning algorithms using test accuracy and 5-fold cross-validation accuracy.
          </p>
          {source === 'research' && (
            <p className="mt-2 text-xs text-navy-400">
              <Database className="inline h-3 w-3 mr-1" />
              Displaying research results from the project notebook
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <TrendingUp className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">
              Backend unavailable. Showing canonical research values from the project.
            </p>
          </div>
        )}
        {source === 'unavailable' && !error && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {notice ?? 'Verified model-performance artifacts are not available in this deployment.'}
          </div>
        )}

        {/* Best Model Highlight */}
        {bestModel && (
          <div className="mb-8 card p-6 ring-2 ring-primary-500 bg-primary-50/30">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary-600 uppercase tracking-wider">Best Performing Model</p>
                  <h2 className="text-xl font-bold text-navy-900">{bestModel.model}</h2>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy-900">{bestModel.datasetAccuracy}%</div>
                  <div className="text-xs text-navy-500">Dataset Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="mb-8 overflow-x-auto scrollbar-thin rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Model</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Dataset Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.map((m) => (
                <tr
                  key={m.model}
                  className={`${m.isBest ? 'bg-primary-50/50 font-semibold' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-3 text-sm text-navy-900">
                    {m.model}
                    {m.isBest && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                        <Award className="h-3 w-3" />
                        Best
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-navy-900">{m.datasetAccuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Dataset Accuracy Comparison" description="Accuracy of saved models evaluated on the uploaded dataset">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#627d98' }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334e68' }} width={120} />
                <Tooltip formatter={(val) => `${val}%`} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="datasetAccuracy" name="Dataset Accuracy" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.isBest ? '#2563eb' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Dataset Accuracy Distribution" description="Same uploaded-dataset evaluation shown as a second view">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#627d98' }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334e68' }} width={120} />
                <Tooltip formatter={(val) => `${val}%`} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="datasetAccuracy" name="Dataset Accuracy" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.isBest ? '#0d9488' : '#5eead4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Dataset Accuracy" description="Saved-model accuracy evaluated after recovered standardization">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ left: 0, right: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#334e68' }} angle={-35} textAnchor="end" height={70} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#627d98' }} unit="%" />
                <Tooltip formatter={(val) => `${val}%`} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar dataKey="datasetAccuracy" name="Dataset Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

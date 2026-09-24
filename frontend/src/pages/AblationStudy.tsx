import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { FlaskConical, TrendingUp, Database, Award } from 'lucide-react';
import ChartCard from '@/components/ChartCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getAblationStudy } from '@/services/api';
import type { AblationExperiment, ApiError } from '@/types';

export default function AblationStudy() {
  const [data, setData] = useState<AblationExperiment[]>([]);
  const [source, setSource] = useState<'backend' | 'research' | 'unavailable'>('unavailable');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const result = await getAblationStudy();
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
          <LoadingSpinner label="Loading ablation study data..." />
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.id,
    fullName: d.name,
    accuracy: d.accuracy,
  }));

  const bestExperiment = [...data].sort((a, b) => b.accuracy - a.accuracy)[0];
  const colors = ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'];

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
            <FlaskConical className="h-3.5 w-3.5" />
            Ablation Analysis
          </div>
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">Ablation Study</h1>
          <p className="mt-3 text-navy-500 max-w-2xl mx-auto">
            Systematic evaluation of pipeline components to measure their individual contribution to model performance.
          </p>
          {source === 'research' && (
            <p className="mt-2 text-xs text-navy-400">
              <Database className="inline h-3 w-3 mr-1" />
              Displaying canonical values from the project notebook
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
            {notice ?? 'Verified ablation-study artifacts are not available in this deployment.'}
          </div>
        )}

        {/* Best Experiment Highlight */}
        {bestExperiment && (
          <div className="mb-8 card p-6 ring-2 ring-primary-500 bg-primary-50/30">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary-600 uppercase tracking-wider">Best Configuration</p>
                  <h2 className="text-xl font-bold text-navy-900">{bestExperiment.name}</h2>
                  <p className="text-sm text-navy-500">Experiment {bestExperiment.id}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy-900">{bestExperiment.accuracy}%</div>
                <div className="text-xs text-navy-500">Accuracy</div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((exp, i) => (
            <div
              key={exp.id}
              className={`card p-5 ${exp.id === bestExperiment?.id ? 'ring-2 ring-primary-500' : 'card-hover'}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-sm font-bold text-navy-700">
                  {exp.id}
                </span>
                <span className="text-2xl font-bold text-navy-900">{exp.accuracy}%</span>
              </div>
              <h3 className="text-sm font-semibold text-navy-900">{exp.name}</h3>
              <p className="mt-1 text-xs text-navy-500 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="mb-8">
          <ChartCard title="Ablation Study Results" description="Accuracy comparison across four experiments">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ left: 0, right: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#334e68', fontWeight: 600 }} />
                <YAxis domain={[75, 85]} tick={{ fontSize: 12, fill: '#627d98' }} unit="%" />
                <Tooltip
                  formatter={(val) => `${val}%`}
                  labelFormatter={(label) => {
                    const item = data.find((d) => d.id === String(label));
                    return item ? `${item.id}: ${item.name}` : String(label);
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="accuracy" name="Accuracy" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.name === bestExperiment?.id ? '#2563eb' : colors[i] ?? '#93c5fd'} />
                  ))}
                  <LabelList dataKey="accuracy" position="top" formatter={(val) => `${val}%`} style={{ fontSize: 12, fill: '#334e68', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Experiment Table */}
        <div className="mb-8 overflow-x-auto scrollbar-thin rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Experiment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Description</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-navy-500">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.map((exp) => (
                <tr
                  key={exp.id}
                  className={`${exp.id === bestExperiment?.id ? 'bg-primary-50/50 font-semibold' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4 text-sm text-navy-900 whitespace-nowrap">{exp.id}</td>
                  <td className="px-6 py-4 text-sm text-navy-900 whitespace-nowrap">{exp.name}</td>
                  <td className="px-6 py-4 text-sm text-navy-500">{exp.description}</td>
                  <td className="px-6 py-4 text-sm text-right text-navy-900 whitespace-nowrap">{exp.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explanations */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy-900">Experiment Explanations</h2>
          {data.map((exp) => (
            <div key={exp.id} className="card p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700">
                  {exp.id}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-navy-900">{exp.name}</h3>
                  <p className="mt-1 text-sm text-navy-500 leading-relaxed">{exp.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

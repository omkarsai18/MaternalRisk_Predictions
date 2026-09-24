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
import { Lightbulb, TrendingUp, Database } from 'lucide-react';
import ChartCard from '@/components/ChartCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getFeatureImportance } from '@/services/api';
import type { FeatureImportanceItem, ApiError } from '@/types';

export default function FeatureImportance() {
  const [data, setData] = useState<FeatureImportanceItem[]>([]);
  const [source, setSource] = useState<'backend' | 'research' | 'unavailable'>('unavailable');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const result = await getFeatureImportance();
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
          <LoadingSpinner label="Loading feature importance data..." />
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.importance - a.importance);
  const chartData = sorted.map((d) => ({
    name: d.feature,
    importance: (d.importance * 100).toFixed(2),
    raw: d.importance,
  }));

  const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
            <Lightbulb className="h-3.5 w-3.5" />
            Explainability
          </div>
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">Feature Importance</h1>
          <p className="mt-3 text-navy-500 max-w-2xl mx-auto">
            Analysis of how much each clinical feature contributes to the Random Forest model's predictions.
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
            {notice ?? 'Feature-importance data is unavailable.'}
          </div>
        )}

        {/* Most Important Feature Highlight */}
        <div className="mb-8 card p-6 ring-2 ring-primary-500 bg-primary-50/30">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary-600 uppercase tracking-wider">Most Important Feature</p>
                <h2 className="text-xl font-bold text-navy-900">{sorted[0]?.feature}</h2>
                <p className="text-sm text-navy-500">{sorted[0]?.description}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-navy-900">{(sorted[0]?.importance * 100).toFixed(2)}%</div>
              <div className="text-xs text-navy-500">Importance Score</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8">
          <ChartCard title="Feature Importance Ranking" description="Horizontal bar chart showing the importance of each clinical feature">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 12, fill: '#627d98' }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: '#334e68', fontWeight: 600 }} width={100} />
                <Tooltip
                  formatter={(val) => `${val}%`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="importance" name="Importance" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={colors[i] ?? colors[colors.length - 1]} />
                  ))}
                  <LabelList dataKey="importance" position="right" formatter={(val) => `${val}%`} style={{ fontSize: 12, fill: '#334e68', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Ranked Feature List */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-navy-900">Ranked Feature List</h2>
          <div className="space-y-3">
            {sorted.map((item, i) => (
              <div key={item.feature} className="card p-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-navy-900">{item.feature}</h3>
                        <p className="text-xs text-navy-500">{item.description}</p>
                      </div>
                      <span className="text-sm font-bold text-navy-900">{(item.importance * 100).toFixed(3)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(item.importance / sorted[0].importance) * 100}%`, backgroundColor: colors[i] ?? colors[colors.length - 1] }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="card p-6">
          <h2 className="mb-3 text-lg font-bold text-navy-900">Explanation</h2>
          <p className="text-sm text-navy-600 leading-relaxed">
            Feature importance scores indicate how much each clinical parameter contributes to the Random Forest
            model's prediction of maternal health risk. A higher score means the feature has a greater impact on
            the model's decision-making.
          </p>
          <p className="mt-3 text-sm text-navy-600 leading-relaxed">
            According to the project analysis, <span className="font-semibold text-navy-900">Blood Sugar (BS)</span> is
            the most important feature with an importance score of {(sorted[0]?.importance * 100).toFixed(3)}%,
            followed by <span className="font-semibold text-navy-900">Systolic Blood Pressure</span> and
            <span className="font-semibold text-navy-900"> Age</span>. This suggests that blood sugar levels play a
            significant role in determining maternal health risk according to the trained model.
          </p>
        </div>
      </div>
    </div>
  );
}

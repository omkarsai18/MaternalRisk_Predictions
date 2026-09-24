import type { BulkPredictionRow, RiskLevel } from '@/types';
import RiskBadge from './RiskBadge';

interface DataTableProps {
  rows: BulkPredictionRow[];
  filter: 'all' | RiskLevel;
}

export default function DataTable({ rows, filter }: DataTableProps) {
  const filtered = filter === 'all' ? rows : rows.filter((r) => r.predictedRisk === filter);

  const headers = ['Row', 'Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate', 'Predicted Risk', 'Confidence'];

  return (
    <div className="overflow-x-auto scrollbar-thin rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-navy-400">
                No records match the selected filter.
              </td>
            </tr>
          ) : (
            filtered.map((row) => (
              <tr key={row.rowNumber} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-navy-500">{row.rowNumber}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-navy-900">{row.Age}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-navy-900">{row.SystolicBP}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-navy-900">{row.DiastolicBP}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-navy-900">{row.BS}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-navy-900">{row.BodyTemp}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-navy-900">{row.HeartRate}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <RiskBadge level={row.predictedRisk} size="sm" />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-navy-700">
                  {row.confidence === null ? 'Not available' : `${row.confidence.toFixed(2)}%`}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

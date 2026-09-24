import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  Calendar,
  HeartPulse,
  Activity,
  Droplet,
  Thermometer,
  Heart,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ClipboardList,
} from 'lucide-react';
import type { PredictionResult, RiskLevel } from '@/types';
import RiskBadge from './RiskBadge';
import RiskGauge from './RiskGauge';
import Disclaimer from './Disclaimer';
import { DISCLAIMER_PREDICTION } from '@/data/projectData';

interface ResultCardProps {
  result: PredictionResult;
}

interface ParameterMeta {
  label: string;
  unit: string;
  refRange: string;
  icon: typeof Calendar;
  iconBg: string;
  iconColor: string;
  unitBadge: string;
}

const parameterConfig: Record<string, ParameterMeta> = {
  Age: {
    label: 'Maternal Age',
    unit: 'years',
    refRange: 'Valid: 10–100 yrs',
    icon: Calendar,
    iconBg: 'bg-violet-50 border-violet-100',
    iconColor: 'text-violet-600',
    unitBadge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  SystolicBP: {
    label: 'Systolic BP',
    unit: 'mmHg',
    refRange: 'Typical: 90–120 mmHg',
    icon: HeartPulse,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    unitBadge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  DiastolicBP: {
    label: 'Diastolic BP',
    unit: 'mmHg',
    refRange: 'Typical: 60–80 mmHg',
    icon: Activity,
    iconBg: 'bg-indigo-50 border-indigo-100',
    iconColor: 'text-indigo-600',
    unitBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  BS: {
    label: 'Blood Sugar',
    unit: 'mmol/L',
    refRange: 'Typical: 4.0–7.8 mmol/L',
    icon: Droplet,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    unitBadge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  BodyTemp: {
    label: 'Body Temperature',
    unit: '°F',
    refRange: 'Typical: 97.0–99.0 °F',
    icon: Thermometer,
    iconBg: 'bg-rose-50 border-rose-100',
    iconColor: 'text-rose-600',
    unitBadge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  HeartRate: {
    label: 'Heart Rate',
    unit: 'bpm',
    refRange: 'Typical: 60–100 bpm',
    icon: Heart,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    unitBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const riskContext: Record<
  RiskLevel,
  {
    summary: string;
    panelBg: string;
    panelBorder: string;
    icon: typeof ShieldCheck;
    iconColor: string;
  }
> = {
  'low risk': {
    summary: 'Physiological indicators are within normal maternal health ranges.',
    panelBg: 'bg-gradient-to-b from-emerald-50/60 to-slate-50/80',
    panelBorder: 'border-emerald-200/80',
    icon: ShieldCheck,
    iconColor: 'text-emerald-600',
  },
  'mid risk': {
    summary: 'Moderate variations detected. Routine prenatal monitoring and follow-up are recommended.',
    panelBg: 'bg-gradient-to-b from-amber-50/60 to-slate-50/80',
    panelBorder: 'border-amber-200/80',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  'high risk': {
    summary: 'Elevated risk factors identified. Prompt clinical evaluation by a healthcare provider is advised.',
    panelBg: 'bg-gradient-to-b from-rose-50/60 to-slate-50/80',
    panelBorder: 'border-rose-200/80',
    icon: AlertOctagon,
    iconColor: 'text-rose-600',
  },
};

function formatModelName(rawModel?: string): string {
  if (!rawModel) return 'Random Forest';
  return rawModel
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bKnn\b/g, 'KNN')
    .replace(/\bSvm\b/g, 'SVM');
}

export default function ResultCard({ result }: ResultCardProps) {
  const navigate = useNavigate();
  const context = riskContext[result.riskLevel] ?? riskContext['mid risk'];
  const StatusIcon = context.icon;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="card overflow-hidden border border-slate-200 shadow-md">
        {/* Card Header */}
        <div className="border-b border-slate-200/80 bg-gradient-to-r from-navy-950 via-navy-900 to-primary-900 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Maternal Risk Assessment</h2>
              <p className="mt-1 text-sm text-navy-200">
                Diagnostic prediction generated from your submitted clinical parameters
              </p>
            </div>

            {result.model && (
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary-100 backdrop-blur-xs sm:self-center">
                <Cpu className="h-3.5 w-3.5 text-primary-300" />
                <span>Model: {formatModelName(result.model)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12">
          {/* Left Panel: Predicted Risk & Confidence Meter (5 cols) */}
          <div
            className={`lg:col-span-5 flex flex-col items-center justify-between rounded-2xl border p-6 ${context.panelBg} ${context.panelBorder}`}
          >
            <div className="w-full text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Predicted Risk Level
              </span>

              <div className="mt-3 flex justify-center">
                <RiskBadge level={result.riskLevel} size="lg" />
              </div>

              <div className="mt-3 flex items-start justify-center gap-2 rounded-xl bg-white/80 px-3.5 py-2.5 border border-slate-200/70 shadow-2xs">
                <StatusIcon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${context.iconColor}`} />
                <p className="text-xs font-medium text-slate-600 leading-relaxed text-left">
                  {context.summary}
                </p>
              </div>
            </div>

            <div className="my-5 h-px w-full bg-slate-200/80" />

            <div className="w-full flex justify-center">
              <RiskGauge confidence={result.confidence} riskLevel={result.riskLevel} />
            </div>
          </div>

          {/* Right Panel: Submitted Clinical Parameters Grid (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary-600" />
                  <h3 className="text-base font-bold text-navy-900">Submitted Clinical Parameters</h3>
                </div>
                <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  6 Features Analyzed
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {Object.entries(result.input).map(([key, value]) => {
                  const meta = parameterConfig[key];
                  const ParamIcon = meta?.icon ?? Activity;
                  return (
                    <div
                      key={key}
                      className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-primary-300 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                              meta?.iconBg ?? 'bg-slate-50 border-slate-100'
                            }`}
                          >
                            <ParamIcon className={`h-4 w-4 ${meta?.iconColor ?? 'text-slate-600'}`} />
                          </div>
                          <div>
                            <dt className="text-xs font-bold text-slate-700">{meta?.label ?? key}</dt>
                            <span className="text-[10px] text-slate-400">{meta?.refRange ?? ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                        <dd className="text-2xl font-extrabold tracking-tight text-navy-950 font-mono">
                          {value}
                        </dd>
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                            meta?.unitBadge ?? 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {meta?.unit ?? ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Disclaimer text={DISCLAIMER_PREDICTION} />

      <div className="flex justify-center">
        <button type="button" onClick={() => navigate('/predict')} className="btn-primary px-6 py-3 shadow-sm">
          <RotateCcw className="h-4 w-4" />
          Run Another Prediction
        </button>
      </div>
    </div>
  );
}

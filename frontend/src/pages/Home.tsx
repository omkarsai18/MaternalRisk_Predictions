import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Activity,
  Cpu,
  Target,
  UserCheck,
  Upload,
  BarChart3,
  Lightbulb,
  ArrowRight,
  ClipboardList,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import FeatureCard from '@/components/FeatureCard';
import Disclaimer from '@/components/Disclaimer';
import { PROJECT_STATS, HOW_IT_WORKS_STEPS } from '@/data/projectData';
import { getSystemStatus } from '@/services/api';
import type { SystemStatus } from '@/types';

const featureCards = [
  {
    icon: UserCheck,
    title: 'Single Prediction',
    description: 'Predict maternal risk for an individual using six healthcare parameters.',
    to: '/predict',
    linkLabel: 'Start prediction',
  },
  {
    icon: Upload,
    title: 'Bulk Prediction',
    description: 'Upload CSV/Excel data and generate predictions for multiple individuals.',
    to: '/bulk-predict',
    linkLabel: 'Upload data',
  },
  {
    icon: BarChart3,
    title: 'Model Comparison',
    description: 'Compare the performance of eight machine learning algorithms.',
    to: '/model-performance',
    linkLabel: 'View comparison',
  },
  {
    icon: Lightbulb,
    title: 'Explainable Analysis',
    description: 'Explore feature importance and ablation-study results.',
    to: '/feature-importance',
    linkLabel: 'Explore analysis',
  },
];

const statIcons = [Database, Activity, Cpu, Target];

export default function Home() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSystemStatus().then((result) => {
      if (!active) return;
      setSystemStatus(result.data ?? null);
      setStatusError(result.error?.message ?? null);
    });
    return () => { active = false; };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-primary-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-primary-500 blur-3xl" />
          <div className="absolute right-10 bottom-0 h-96 w-96 rounded-full bg-teal-400 blur-3xl" />
        </div>

        <div className="container-max relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-primary-200 backdrop-blur-sm">
                <Brain className="h-3.5 w-3.5" />
                AI-Powered Healthcare System
              </div>
              <h1 className="text-4xl font-bold leading-tight text-white text-balance sm:text-5xl lg:text-6xl">
                AI-Powered Maternal Risk Prediction
              </h1>
              <p className="mt-5 text-lg text-navy-200 leading-relaxed max-w-xl">
                Predict maternal health risk using machine learning and healthcare data.
              </p>
              <p className="mt-3 text-sm text-navy-300 leading-relaxed max-w-xl">
                The system analyzes key maternal healthcare parameters and uses machine learning to classify maternal health risk as Low Risk, Mid Risk, or High Risk.
              </p>
              {statusError && (
                <p className="mt-3 text-xs text-amber-200" role="status">
                  Prediction service is currently unavailable. You can still explore the research interface.
                </p>
              )}
              {systemStatus && !systemStatus.predictionReady && (
                <p className="mt-3 text-xs text-amber-200" role="status">
                  Prediction service setup is incomplete: {systemStatus.message ?? 'configuration is required.'}
                </p>
              )}
              {systemStatus?.predictionReady && (
                <p className="mt-3 text-xs text-teal-200" role="status">Prediction service is available.</p>
              )}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/predict" className="btn-primary">
                  Predict Risk
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Explore Project
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end animate-fade-in">
              <div className="relative">
                <div className="flex h-64 w-64 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm sm:h-80 sm:w-80">
                  <div className="flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/5 sm:h-56 sm:w-56">
                    <Activity className="h-20 w-20 text-teal-300 sm:h-24 sm:w-24" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="absolute -right-4 top-8 flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-teal-300" />
                  <span className="text-xs font-medium text-white">85.25% Accuracy</span>
                </div>
                <div className="absolute -left-4 bottom-12 flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <Brain className="h-4 w-4 text-primary-300" />
                  <span className="text-xs font-medium text-white">Random Forest</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {PROJECT_STATS.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                icon={statIcons[i]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-navy-900 sm:text-3xl">Key Features</h2>
            <p className="mt-2 text-navy-500">Explore the capabilities of the Maternal Risk AI system</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <FeatureCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
                to={card.to}
                linkLabel={card.linkLabel}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-navy-900 sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-navy-500">From data entry to risk prediction in four steps</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.step} className="relative animate-fade-in-up">
                <div className="card card-hover p-6 h-full">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
                      {step.step}
                    </div>
                    <ClipboardList className="h-5 w-5 text-navy-300" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-navy-900">{step.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{step.description}</p>
                </div>
                {step.step < HOW_IT_WORKS_STEPS.length && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-navy-200">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-max max-w-3xl">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}

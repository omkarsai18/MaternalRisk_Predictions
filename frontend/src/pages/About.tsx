import {
  Calendar,
  HeartPulse,
  Droplet,
  Thermometer,
  Activity,
  Database,
  Target,
  TrendingUp,
  Award,
  ChevronDown,
  FlaskConical,
  Microscope,
  Layers,
} from 'lucide-react';
import { INPUT_FEATURES, ML_MODELS, METHODOLOGY_STEPS } from '@/data/projectData';
import Disclaimer from '@/components/Disclaimer';

const featureIcons: Record<string, typeof Calendar> = {
  Age: Calendar,
  SystolicBP: HeartPulse,
  DiastolicBP: HeartPulse,
  BS: Droplet,
  BodyTemp: Thermometer,
  HeartRate: Activity,
};

export default function About() {
  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
            <Microscope className="h-3.5 w-3.5" />
            Project Information
          </div>
          <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">About the Project</h1>
          <p className="mt-3 text-navy-500 max-w-2xl mx-auto">
            A Comparative Analysis of Machine Learning Algorithms for Maternal Risk Prediction Using Healthcare Data
          </p>
        </div>

        {/* A. Project Overview */}
        <section className="mb-12">
          <div className="card p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                <FlaskConical className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-navy-900">Project Overview</h2>
            </div>
            <p className="text-navy-600 leading-relaxed">
              This project investigates and compares multiple machine learning algorithms for maternal risk prediction
              using healthcare data. The system analyzes six clinical parameters to classify maternal health risk into
              three categories: Low Risk, Mid Risk, and High Risk. By leveraging data-driven approaches, the project
              aims to identify the most suitable machine learning model for early maternal health risk assessment,
              supporting healthcare professionals in making informed decisions.
            </p>
          </div>
        </section>

        {/* B. Problem Statement */}
        <section className="mb-12">
          <div className="card p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                <Target className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-navy-900">Problem Statement</h2>
            </div>
            <p className="text-navy-600 leading-relaxed">
              Maternal health risk assessment is a critical component of prenatal care. Identifying risk levels early
              using healthcare parameters such as blood pressure, blood sugar, and heart rate can help healthcare
              providers take preventive measures. However, manual assessment can be subjective and time-consuming.
              Machine learning offers a data-driven approach to analyze clinical parameters and predict maternal health
              risk levels, enabling early intervention and better health outcomes for mothers.
            </p>
          </div>
        </section>

        {/* C. Dataset */}
        <section className="mb-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <Database className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-bold text-navy-900">Dataset</h2>
              </div>
              <dl className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <dt className="text-sm text-navy-500">Name</dt>
                  <dd className="text-sm font-semibold text-navy-900">Maternal Health Risk</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <dt className="text-sm text-navy-500">Records</dt>
                  <dd className="text-sm font-semibold text-navy-900">1,014</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <dt className="text-sm text-navy-500">Input Features</dt>
                  <dd className="text-sm font-semibold text-navy-900">6</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <dt className="text-sm text-navy-500">Target</dt>
                  <dd className="text-sm font-semibold text-navy-900">RiskLevel</dd>
                </div>
              </dl>
            </div>

            <div className="card p-6 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-navy-900">Risk Classes</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-risk-low/20 bg-risk-lowBg p-4">
                  <div className="h-3 w-3 rounded-full bg-risk-low" />
                  <div>
                    <p className="text-sm font-semibold text-risk-low">Low Risk</p>
                    <p className="text-xs text-navy-500">Minimal health risk</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-risk-mid/20 bg-risk-midBg p-4">
                  <div className="h-3 w-3 rounded-full bg-risk-mid" />
                  <div>
                    <p className="text-sm font-semibold text-risk-mid">Mid Risk</p>
                    <p className="text-xs text-navy-500">Moderate health risk</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-risk-high/20 bg-risk-highBg p-4">
                  <div className="h-3 w-3 rounded-full bg-risk-high" />
                  <div>
                    <p className="text-sm font-semibold text-risk-high">High Risk</p>
                    <p className="text-xs text-navy-500">Elevated health risk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* D. Input Features */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy-900">Input Features</h2>
            <p className="mt-1 text-sm text-navy-500">The six clinical parameters used by the machine learning model</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INPUT_FEATURES.map((feature) => {
              const Icon = featureIcons[feature.name] ?? Activity;
              return (
                <div key={feature.name} className="card card-hover p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-navy-900">
                        {feature.label}
                        <span className="ml-2 text-xs font-normal text-navy-400">({feature.unit})</span>
                      </h3>
                      <p className="mt-1 text-xs text-navy-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* E. Machine Learning Models */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy-900">Machine Learning Models</h2>
            <p className="mt-1 text-sm text-navy-500">Eight algorithms evaluated and compared in this project</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ML_MODELS.map((model, i) => (
              <div
                key={model.name}
                className={`card p-5 ${model.isBest ? 'ring-2 ring-primary-500 bg-primary-50/30' : 'card-hover'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-sm font-bold text-navy-700">
                    {i + 1}
                  </span>
                  {model.isBest && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">
                      <Award className="h-3 w-3" />
                      Best
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-navy-900">{model.name}</h3>
                <p className="mt-1 text-xs text-navy-500 leading-relaxed">{model.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* F. Methodology */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy-900">Methodology</h2>
            <p className="mt-1 text-sm text-navy-500">The machine learning pipeline used in this project</p>
          </div>
          <div className="card p-8">
            <div className="flex flex-col items-center gap-2">
              {METHODOLOGY_STEPS.map((step, i) => (
                <div key={step.step} className="flex w-full max-w-md flex-col items-center">
                  <div className="flex w-full items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-navy-900">{step.title}</h3>
                      <p className="mt-0.5 text-xs text-navy-500 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  {i < METHODOLOGY_STEPS.length - 1 && (
                    <ChevronDown className="h-5 w-5 text-navy-300 my-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* G. Research Objective */}
        <section className="mb-8">
          <div className="card p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-navy-900">Research Objective</h2>
            </div>
            <p className="text-navy-600 leading-relaxed">
              The project aims to compare multiple machine learning algorithms for maternal risk prediction and
              identify a suitable model that achieves high predictive accuracy. Through systematic evaluation
              including train/test accuracy, 5-fold cross-validation, and hyperparameter tuning, the research
              identifies Random Forest as the best-performing model with a test accuracy of 85.25% and a
              cross-validation accuracy of 82.75%. The study also includes ablation experiments to analyze
              the contribution of individual pipeline components such as feature scaling and hyperparameter tuning.
            </p>
          </div>
        </section>

        <Disclaimer />
      </div>
    </div>
  );
}

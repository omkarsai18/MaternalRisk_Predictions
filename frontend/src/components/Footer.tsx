import { Link } from 'react-router-dom';
import { Activity, Heart } from 'lucide-react';

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/predict', label: 'Single Prediction' },
  { to: '/bulk-predict', label: 'Bulk Prediction' },
  { to: '/model-performance', label: 'Model Performance' },
  { to: '/feature-importance', label: 'Feature Importance' },
  { to: '/ablation-study', label: 'Ablation Study' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container-max px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-teal-500">
                <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-navy-900">Maternal Risk AI</span>
            </div>
            <p className="text-sm text-navy-500 leading-relaxed max-w-xs">
              AI-Powered Maternal Healthcare Risk Prediction System using machine learning and clinical data.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-navy-900">Navigation</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-navy-500 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-navy-900">About the Project</h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              A Comparative Analysis of Machine Learning Algorithms for Maternal Risk Prediction Using Healthcare Data
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-navy-400">
            &copy; {new Date().getFullYear()} Maternal Risk AI. Final-Year B.Tech CSE Project.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-navy-400">
            For educational and research purposes only
            <Heart className="h-3 w-3 text-risk-low" fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/predict', label: 'Single Prediction' },
  { to: '/bulk-predict', label: 'Bulk Prediction' },
  { to: '/model-performance', label: 'Model Performance' },
  { to: '/feature-importance', label: 'Feature Importance' },
  { to: '/ablation-study', label: 'Ablation Study' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-navy-600 hover:bg-gray-100 hover:text-navy-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-teal-500">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-navy-900">Maternal Risk AI</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-navy-600 hover:bg-gray-100 hover:text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                end={link.to === '/'}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// src/components/layout/AuthLayout.jsx — centered auth card
import { cn } from '../../lib/utils';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="flex justify-center mb-8">
          <a href="/" className="flex items-center gap-2.5 no-underline" aria-label="ChemMarket Home">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-xl text-white">ChemMarket</span>
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && <h1 className="text-2xl font-bold font-heading text-slate-900">{title}</h1>}
              {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          {/* PLACEHOLDER: Add legal/support link */}
          Need help? <a href="/contact" className="text-teal-400 hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  );
}

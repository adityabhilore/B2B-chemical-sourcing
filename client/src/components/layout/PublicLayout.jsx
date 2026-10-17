// src/components/layout/PublicLayout.jsx
// Sticky navbar with search, mobile drawer, rich footer
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import SearchBar from '../ui/SearchBar';
import { api } from '../../lib/api';

const NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const FOOTER_LINKS = {
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'Chemical safety & shipping', href: '/safety' },
  ],
  'Products': [
    { label: 'All Products', href: '/products' },
    { label: 'Browse Categories', href: '/categories' },
    { label: 'Request a Quote', href: '/contact' },
  ],
  'Account': [
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Register', href: '/auth/register' },
    { label: 'My Orders', href: '/account/orders' },
  ],
};

function Navbar({ searchValue, onSearch, settings }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="container-content h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 no-underline" aria-label="ChemMarket Home">
            {settings.logoUrl?<img src={settings.logoUrl} alt={settings.name||'Home'} className="h-9 max-w-40 object-contain"/>:<div className="w-8 h-8 rounded-lg bg-navy-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>}
            <span className="font-heading font-bold text-lg text-slate-900 hidden sm:block">
              {/* PLACEHOLDER: Replace with your company name */}
              {settings.name||'ChemMarket'}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-navy-700 hover:bg-navy-50 transition-all no-underline"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-sm">
            <SearchBar value={searchValue} onChange={onSearch} size="sm" />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Mobile search toggle */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setSearchOpen(v => !v)}
              aria-label="Toggle search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>

            <a href="/auth/login" className="hidden sm:inline-flex btn btn-outline btn-sm no-underline">Sign In</a>
            <a href="/auth/register" className="btn btn-primary btn-sm no-underline">Get Started</a>

            {/* Mobile menu */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="lg:hidden border-t border-slate-100 px-4 py-3">
            <SearchBar value={searchValue} onChange={onSearch} size="md" />
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-modal">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-heading font-bold text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              {NAV_LINKS.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  className="nav-item no-underline"
                  onClick={() => setDrawerOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
              <a href="/auth/login" className="btn btn-outline btn-md w-full no-underline">Sign In</a>
              <a href="/auth/register" className="btn btn-primary btn-md w-full no-underline">Get Started</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Footer({settings}) {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-16 pb-8 mt-auto">
      <div className="container-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="font-heading font-bold text-white text-lg">{settings.name||'Chemical Market'}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.description||''}
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-slate-400">
              {settings.email&&<a href={`mailto:${settings.email}`} className="text-slate-400">{settings.email}</a>}
              {settings.phone&&<a href={`tel:${settings.phone}`} className="text-slate-400">{settings.phone}</a>}
              {settings.address&&<span className="whitespace-pre-line">{settings.address}</span>}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{heading}</h3>
              <ul className="flex flex-col gap-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-slate-400 hover:text-teal-400 transition-colors no-underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider border-slate-700 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.name||'Chemical Market'}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-slate-300 transition-colors no-underline">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-300 transition-colors no-underline">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * PublicLayout — wraps all public-facing pages
 */
export default function PublicLayout({ children, settings: providedSettings, theme: providedTheme }) {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [cms,setCms]=useState({site:{},theme:{},sections:[]});
  useEffect(()=>{api.get('/content/public/homepage').then(r=>setCms(r.data.data)).catch(()=>{});},[]);
  useEffect(()=>{const canonical=document.head.querySelector('link[rel="canonical"]')||document.head.appendChild(Object.assign(document.createElement('link'),{rel:'canonical'}));canonical.href=`${window.location.origin}${location.pathname}`;},[location.pathname]);
  const settings={...(providedSettings||cms.site||{}),logoUrl:(providedTheme||cms.theme||{}).logoUrl};const theme=providedTheme||cms.theme||{};
  useEffect(()=>{if(theme.primaryColor){document.documentElement.style.setProperty('--brand-primary',theme.primaryColor);document.documentElement.style.setProperty('--color-navy-600',theme.primaryColor);}if(theme.secondaryColor){document.documentElement.style.setProperty('--brand-accent',theme.secondaryColor);document.documentElement.style.setProperty('--color-teal-500',theme.secondaryColor);}if(theme.font){document.documentElement.style.setProperty('--font-body',`'${theme.font}'`);document.documentElement.style.setProperty('--font-heading',`'${theme.font}'`);}},[theme.primaryColor,theme.secondaryColor,theme.font]);
  return (
    <div className="min-h-screen flex flex-col bg-white font-body">
      <a href="#main-content" className="sr-only z-[100] rounded bg-white p-3 text-navy-900 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to main content</a>
      <Navbar searchValue={search} onSearch={setSearch} settings={settings} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {((cms.sections||[]).length===0||(cms.sections||[]).some(section=>section.type==='FOOTER'))&&<Footer settings={settings} />}
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import Breadcrumbs from '../ui/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { label: 'Overview', href: '/account' },
  { label: 'Orders', href: '/account/orders' },
  { label: 'Profile', href: '/account/profile' },
];

/** Customer portal shell. Props: children, title, breadcrumbs. */
export default function CustomerLayout({ children, title, breadcrumbs }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate('/auth/login', { replace: true }); };
  return <div className="min-h-screen bg-slate-50 font-body">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="container-content flex h-16 items-center gap-4">
        <Link to="/" className="font-heading text-lg font-bold text-slate-900 no-underline">ChemMarket</Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Account navigation">
          {LINKS.map(link => <Link key={link.href} to={link.href} className={cn('rounded-lg px-3 py-2 text-sm font-medium no-underline', window.location.pathname === link.href ? 'bg-navy-50 text-navy-700' : 'text-slate-600 hover:bg-slate-100')}>{link.label}</Link>)}
        </nav>
        <span className="hidden text-sm text-slate-600 lg:block">{user?.fullName}</span>
        <button type="button" onClick={signOut} className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 md:block">Sign out</button>
        <button type="button" className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" aria-expanded={menuOpen} aria-controls="customer-menu" aria-label="Toggle account menu" onClick={() => setMenuOpen(v => !v)}>☰</button>
      </div>
      {menuOpen && <nav id="customer-menu" className="flex flex-col gap-1 border-t border-slate-200 p-3 md:hidden" aria-label="Account navigation">
        {LINKS.map(link => <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100">{link.label}</Link>)}
        <button type="button" onClick={signOut} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">Sign out</button>
      </nav>}
    </header>
    <main className="container-content py-8 md:py-10">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
      {title && <h1 className="mb-6 text-2xl font-bold text-slate-900">{title}</h1>}
      {user?.role === 'CUSTOMER' && user.isApproved === false && <aside className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">
        <p className="font-semibold">Your business account is awaiting approval.</p>
        <p className="mt-1">You can review your profile while the marketplace team checks your registration. Order requests become available after approval.</p>
        <Link className="mt-2 inline-block font-semibold text-amber-900 underline" to="/account/profile">Review your business profile</Link>
      </aside>}
      {children}
    </main>
  </div>;
}

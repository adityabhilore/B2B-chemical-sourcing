import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { api } from '../../lib/api';

const passwordSchema = z.string().min(12, 'Use at least 12 characters').max(128, 'Password must be 128 characters or fewer')
  .regex(/[a-z]/, 'Add a lowercase letter').regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[0-9]/, 'Add a number').regex(/[^A-Za-z0-9]/, 'Add a symbol');

function readResetToken(location) {
  const queryToken = new URLSearchParams(location.search).get('token');
  const hashToken = new URLSearchParams(location.hash.replace(/^#/, '')).get('token');
  return hashToken || queryToken || '';
}

export default function PasswordRecoveryPage({ reset = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => readResetToken(location));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token && (location.search || location.hash)) {
      // Keep the raw reset token out of the address bar, browser history, and referrers.
      window.history.replaceState(window.history.state, '', location.pathname);
    }
  }, [location.hash, location.pathname, location.search, token]);

  const requestReset = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setComplete(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not process the request right now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    setError('');
    setFieldError('');
    const result = passwordSchema.safeParse(password);
    if (!result.success) { setFieldError(result.error.issues[0].message); return; }
    if (password !== confirmPassword) { setFieldError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setToken('');
      setPassword('');
      setConfirmPassword('');
      setComplete(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'This reset link could not be used. Request a new one and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (reset) {
    return <AuthLayout title={complete ? 'Password updated' : 'Choose a new password'} subtitle={complete ? 'Your password has been changed.' : 'Use a new password you have not used for this account.'}>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {complete ? <div className="space-y-4"><p role="status" className="text-sm text-slate-600">You can now sign in with your new password. Existing sessions have been signed out.</p><Button className="w-full justify-center" onClick={() => navigate('/auth/login', { replace: true })}>Go to sign in</Button></div>
        : !token ? <div className="space-y-4"><p role="alert" className="text-sm text-slate-600">This reset link is missing or has expired. Request a new link to continue.</p><Link className="btn btn-primary flex justify-center no-underline" to="/auth/forgot-password">Request a reset link</Link></div>
          : <form className="space-y-4" onSubmit={submitReset} noValidate>
            <FormField label="New password" htmlFor="new-password" error={fieldError} hint="12+ characters with uppercase, lowercase, number and symbol."><Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required /></FormField>
            <FormField label="Confirm new password" htmlFor="confirm-password"><Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></FormField>
            <Button type="submit" loading={busy} className="w-full justify-center">Update password</Button>
          </form>}
      <p className="mt-5 text-center text-sm text-slate-600"><Link className="font-semibold text-teal-700" to="/auth/login">Back to sign in</Link></p>
    </AuthLayout>;
  }

  return <AuthLayout title={complete ? 'Check your email' : 'Reset your password'} subtitle="We’ll send a reset link if an account matches the email address.">
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {complete ? <div className="space-y-4"><p role="status" className="text-sm text-slate-600">If an account exists for that email, password reset instructions have been sent. Check your inbox and spam folder.</p><Button className="w-full justify-center" onClick={() => setComplete(false)}>Send another link</Button></div>
      : <form className="space-y-4" onSubmit={requestReset}>
        <FormField label="Work email" htmlFor="reset-email" hint="The response is the same whether or not an account exists."><Input id="reset-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></FormField>
        <Button type="submit" loading={busy} className="w-full justify-center">Send reset link</Button>
      </form>}
    <p className="mt-5 text-center text-sm text-slate-600"><Link className="font-semibold text-teal-700" to="/auth/login">Back to sign in</Link></p>
  </AuthLayout>;
}

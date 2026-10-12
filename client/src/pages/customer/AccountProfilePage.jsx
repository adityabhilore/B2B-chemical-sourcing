import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const profileResolver = async (values) => {
  const parsed = z.object({ fullName: z.string().min(2), companyName: z.string().min(2), phone: z.string().min(7), businessType: z.string().optional() }).safeParse(values);
  if (parsed.success) return { values: parsed.data, errors: {} };
  const errors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], { type: 'validation', message: issue.message }]));
  return { values: {}, errors };
};

const passwordResolver = async (values) => {
  const parsed = z.object({ currentPassword: z.string().min(1, 'Enter your current password'), newPassword: z.string().min(12, 'Use at least 12 characters').regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/) }).safeParse(values);
  if (parsed.success) return { values: parsed.data, errors: {} };
  const errors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], { type: 'validation', message: issue.message || 'Password must include upper and lowercase letters, a number, and a symbol.' }]));
  return { values: {}, errors };
};

export default function AccountProfilePage() {
  const { logout } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState('');
  const [failure, setFailure] = useState('');
  const profile = useForm({ resolver: profileResolver });
  const password = useForm({ resolver: passwordResolver });

  useEffect(() => {
    api.get('/customer/me').then(({ data }) => profile.reset({ fullName: data.data.user.fullName || '', phone: data.data.user.phone || '', companyName: data.data.user.profile?.companyName || '', businessType: data.data.user.profile?.businessType || '' })).catch(() => setFailure('Could not load your profile. Please refresh the page.')).finally(() => setLoaded(true));
  }, []);

  const saveProfile = async (values) => { setFailure(''); setNotice(''); try { await api.patch('/customer/me', values); setNotice('Profile updated.'); } catch (e) { setFailure(e.response?.data?.message || 'Could not update profile.'); } };
  const savePassword = async (values) => { setFailure(''); setNotice(''); try { await api.patch('/customer/me/password', values); setNotice('Password updated. Sign in again to continue.'); password.reset(); await logout(); } catch (e) { setFailure(e.response?.data?.message || 'Could not update password.'); } };

  if (!loaded) return <p className="text-sm text-slate-500">Loading account details…</p>;
  return <div className="grid gap-6 lg:grid-cols-2">
    {failure && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 lg:col-span-2">{failure}</p>}
    {notice && <p role="status" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800 lg:col-span-2">{notice}</p>}
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-5 font-heading text-lg font-semibold text-slate-900">Business profile</h2>
      <form className="space-y-4" onSubmit={profile.handleSubmit(saveProfile)}>
        {['fullName', 'companyName', 'phone', 'businessType'].map((name) => <FormField key={name} label={{ fullName: 'Full name', companyName: 'Company name', phone: 'Phone', businessType: 'Business type' }[name]} htmlFor={name} error={profile.formState.errors[name]?.message}><Input id={name} type={name === 'phone' ? 'tel' : 'text'} {...profile.register(name)} /></FormField>)}
        <Button type="submit" variant="primary" disabled={profile.formState.isSubmitting}>{profile.formState.isSubmitting ? 'Saving…' : 'Save profile'}</Button>
      </form>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-5 font-heading text-lg font-semibold text-slate-900">Change password</h2>
      <form className="space-y-4" onSubmit={password.handleSubmit(savePassword)}>
        <FormField label="Current password" htmlFor="currentPassword" error={password.formState.errors.currentPassword?.message}><Input id="currentPassword" type="password" autoComplete="current-password" {...password.register('currentPassword')} /></FormField>
        <FormField label="New password" htmlFor="newPassword" error={password.formState.errors.newPassword?.message} hint="12+ characters with uppercase, lowercase, number and symbol."><Input id="newPassword" type="password" autoComplete="new-password" {...password.register('newPassword')} /></FormField>
        <Button type="submit" variant="outline" disabled={password.formState.isSubmitting}>{password.formState.isSubmitting ? 'Updating…' : 'Update password'}</Button>
      </form>
    </section>
  </div>;
}

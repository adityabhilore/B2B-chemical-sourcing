import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const pass = z.string().min(12, 'Use at least 12 characters').max(128).regex(/[a-z]/, 'Add a lowercase letter').regex(/[A-Z]/, 'Add an uppercase letter').regex(/[0-9]/, 'Add a number').regex(/[^A-Za-z0-9]/, 'Add a symbol');
const schemas = {
  login: z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(1, 'Password is required') }),
  register: z.object({ fullName: z.string().min(2, 'Enter your name'), companyName: z.string().min(2, 'Enter your company name'), email: z.string().email('Enter a valid email'), phone: z.string().min(7, 'Enter a valid phone'), password: pass }),
};

function resolver(schema) {
  return async (values) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) return { values: parsed.data, errors: {} };
    const errors = {};
    for (const issue of parsed.error.issues) {
      const name = issue.path[0];
      if (name && !errors[name]) errors[name] = { type: 'validation', message: issue.message };
    }
    return { values: {}, errors };
  };
}

export default function AuthPage({ mode = 'login', admin = false }) {
  const isRegister = mode === 'register';
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready, login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register: field, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: resolver(isRegister ? schemas.register : schemas.login) });
  if (ready && user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/account'} replace />;

  const onSubmit = async (values) => {
    setServerError('');
    try {
      if (isRegister) {
        await register(values);
        navigate('/auth/login', { replace: true, state: { notice: 'Registration received. Your account is pending review. You can sign in now to complete your business profile; order requests open after approval.' } });
      } else {
        const signedIn = await login(values, admin);
        const destination = admin ? '/admin' : location.state?.from?.pathname || '/account';
        navigate(destination, { replace: true });
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to sign in right now. Please try again.');
    }
  };

  const title = admin ? 'Administrator sign in' : isRegister ? 'Create your account' : 'Welcome back';
  return <AuthLayout title={title} subtitle={admin ? 'Use your authorized administrator account.' : isRegister ? 'Request access to the Chemical Market customer portal.' : 'Sign in to manage your business account.'}>
    {location.state?.notice && <p role="status" className="mb-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{location.state.notice}</p>}
    {serverError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {isRegister && <>
        <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message}><Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...field('fullName')} /></FormField>
        <FormField label="Company name" htmlFor="companyName" error={errors.companyName?.message}><Input id="companyName" autoComplete="organization" aria-invalid={!!errors.companyName} {...field('companyName')} /></FormField>
        <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}><Input id="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...field('phone')} /></FormField>
      </>}
      <FormField label="Work email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...field('email')} /></FormField>
      <FormField label="Password" htmlFor="password" error={errors.password?.message} hint={isRegister ? '12+ characters with uppercase, lowercase, number and symbol.' : undefined}>
        <div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} className="pr-12" aria-invalid={!!errors.password} {...field('password')} /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-500" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
      </FormField>
      {!isRegister && !admin && <div className="text-right"><Link className="text-sm font-medium text-teal-700" to="/auth/forgot-password">Forgot password?</Link></div>}
      <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</Button>
    </form>
    {!admin && <p className="mt-5 text-center text-sm text-slate-600">{isRegister ? 'Already registered?' : 'New to Chemical Market?'} <Link className="font-semibold text-teal-700" to={isRegister ? '/auth/login' : '/auth/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>}
    {admin && <p className="mt-5 text-center text-xs text-slate-500">Administrator accounts are created through authorized setup only.</p>}
  </AuthLayout>;
}

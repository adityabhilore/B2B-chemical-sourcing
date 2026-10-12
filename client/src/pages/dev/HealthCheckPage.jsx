import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function HealthCheckPage() {
  const [state, setState] = useState({ loading: true, result: null, error: '' });
  const check = useCallback(async () => {
    setState({ loading: true, result: null, error: '' });
    try {
      const { data } = await axios.get(`${API_URL.replace(/\/$/, '')}/api/health`, { timeout: 8000 });
      setState({ loading: false, result: data, error: '' });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Health check failed';
      setState({ loading: false, result: error.response?.data || null, error: message });
    }
  }, []);

  useEffect(() => { check(); }, [check]);
  const healthy = state.result?.success && state.result?.data?.database === 'connected';

  return <main className="container-content py-16">
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Development check</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Frontend, API, and database</h1>
      <p className="mt-2 text-sm text-slate-600">This page requests <code>{API_URL}/api/health</code>. Set <code>VITE_API_URL</code> to the port printed by the backend if it had to use a fallback port.</p>
      <div className="mt-6 rounded-lg bg-slate-50 p-4" role="status" aria-live="polite">
        {state.loading ? <p className="text-slate-700">Checking API and database…</p> : <>
          <p className={`font-semibold ${healthy ? 'text-emerald-700' : 'text-red-700'}`}>{healthy ? 'Connected' : 'Connection failed'}</p>
          {state.error && <p className="mt-1 text-sm text-slate-700">{state.error}</p>}
          {state.result?.data && <pre className="mt-3 overflow-x-auto text-xs text-slate-600">{JSON.stringify(state.result.data, null, 2)}</pre>}
        </>}
      </div>
      <button type="button" className="btn btn-primary btn-sm mt-5" onClick={check} disabled={state.loading}>{state.loading ? 'Checking…' : 'Check again'}</button>
    </div>
  </main>;
}

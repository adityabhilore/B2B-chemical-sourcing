import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import { api } from '../../lib/api';

export default function AuditReportsPage() {
  const [items, setItems] = useState([]);
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [days, setDays] = useState('365');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { const { data } = await api.get('/admin/audit', { params: { limit: 100, entity, from, to } }); setItems(data.data.items); setError(''); }
    catch (e) { setError(e.response?.data?.message || 'Audit history could not be loaded.'); }
  }, [entity, from, to]);
  useEffect(() => { load(); }, [load]);
  const download = async type => {
    try { const { data } = await api.get(`/admin/reports/${type}.csv`, { params: { from, to }, responseType: 'blob' }); const url = URL.createObjectURL(data); const a = document.createElement('a'); a.href = url; a.download = `${type}-${from || 'all'}-${to || 'all'}.csv`; a.click(); URL.revokeObjectURL(url); }
    catch (e) { setError(e.response?.data?.message || 'Report could not be downloaded.'); }
  };
  const purge = async () => { if (!window.confirm(`Permanently delete audit records older than ${days} days?`)) return; try { await api.delete('/admin/audit', { params: { olderThanDays: days } }); await load(); } catch (e) { setError(e.response?.data?.message || 'Audit retention cleanup failed.'); } };
  return <AdminLayout title="Audit & Reports" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit & Reports' }]}>
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="rounded-xl border bg-white p-4"><h2 className="font-semibold">Download reports</h2><p className="mt-1 text-sm text-slate-600">Order exports distinguish request estimates from confirmed totals. They do not represent revenue or completed sales.</p><div className="mt-3 flex flex-wrap items-end gap-3"><label className="text-xs text-slate-600">From<input className="input-base mt-1 block" type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label className="text-xs text-slate-600">To<input className="input-base mt-1 block" type="date" value={to} onChange={e => setTo(e.target.value)} /></label><Button variant="outline" onClick={() => download('orders')}>Export order requests CSV</Button><Button variant="outline" onClick={() => download('customers')}>Export customers CSV</Button></div></section>
      <section className="rounded-xl border bg-white p-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold">Admin change history</h2><p className="text-sm text-slate-600">Recent recorded admin changes. Values are limited to business fields.</p></div><div className="flex gap-2"><select aria-label="Audit entity" className="input-base" value={entity} onChange={e => setEntity(e.target.value)}><option value="">All entities</option>{['OrderRequest','Product','ShippingRule','ShippingMethod','SiteSetting','AuditLog'].map(x => <option key={x}>{x}</option>)}</select><Button variant="outline" onClick={load}>Refresh</Button></div></div><div className="mt-4 space-y-3">{items.map(item => <article key={item.id} className="border-t pt-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><b>{item.action} · {item.entity}</b><time className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</time></div><p className="text-slate-600">Record {item.entityId} · {item.user?.email || 'System'}</p><pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify({ before: item.before, after: item.after }, null, 2)}</pre></article>)}{items.length === 0 && <p className="py-5 text-center text-sm text-slate-500">No audit entries match.</p>}</div></section>
      <section className="rounded-xl border border-red-200 bg-white p-4"><h2 className="font-semibold">Audit retention</h2><p className="mt-1 text-sm text-slate-600">Permanently remove records older than the selected period. Minimum retention is 90 days.</p><div className="mt-3 flex items-end gap-3"><label className="text-xs text-slate-600">Retain for (days)<input className="input-base mt-1 block" type="number" min="90" max="3650" value={days} onChange={e => setDays(e.target.value)} /></label><Button variant="danger" onClick={purge}>Purge older audit records</Button></div></section>
    </div>
  </AdminLayout>;
}

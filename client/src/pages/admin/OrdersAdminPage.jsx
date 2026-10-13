import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export function OrdersAdminPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [customer, setCustomer] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/admin', { params: {
        ...(status ? { status } : {}), ...(customer ? { customer } : {}),
        ...(from ? { from } : {}), ...(to ? { to } : {}),
      } });
      setRows(data.data.orders);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Orders could not be loaded.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status, customer, from, to]);

  useEffect(() => { load(); }, [load]);

  return <AdminLayout title="Manage Orders" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Orders' }]}>
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs font-medium text-slate-600">Status
            <select className="input-base w-full" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map(value => <option key={value}>{value}</option>)}</select>
          </label>
          <label className="flex min-w-52 flex-[2] flex-col gap-1 text-xs font-medium text-slate-600">Customer user ID
            <input className="input-base w-full" placeholder="Filter by customer ID" value={customer} onChange={e => setCustomer(e.target.value)} />
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs font-medium text-slate-600">From date
            <input aria-label="From date" className="input-base w-full" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs font-medium text-slate-600">To date
            <input aria-label="To date" className="input-base w-full" type="date" value={to} onChange={e => setTo(e.target.value)} />
          </label>
        </div>
      </section>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Order', 'Customer', 'Items', 'Status', 'Date', ''].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading orders…</td></tr>
              : rows.map(order => <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                <td className="p-3 font-semibold">{order.orderNumber}</td>
                <td className="p-3">{order.user.fullName}<div className="text-xs text-slate-500">{order.user.email}</div></td>
                <td className="p-3">{order.items.length}</td><td className="p-3">{order.status}</td>
                <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-3"><Link className="font-medium text-navy-700 hover:underline" to={`/admin/orders/${order.id}`}>Details</Link></td>
              </tr>)}
            {!loading && rows.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">No matching orders.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  </AdminLayout>;
}

export function OrderAdminDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [total, setTotal] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/admin/${id}`);
      setOrder(data.data.order);
      setStatus('');
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Order unavailable.');
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const update = async () => {
    try {
      await api.patch(`/orders/admin/${id}/status`, { status, note, ...(total ? { confirmedTotal: Number(total) } : {}) });
      setNote(''); setError(''); await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Status update failed.');
    }
  };
  const retry = async log => {
    try { await api.post(`/orders/admin/notifications/${log.id}/retry`); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Notification retry failed.'); }
  };

  return <AdminLayout title={order?.orderNumber || 'Order Details'} breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Orders', href: '/admin/orders' }, { label: 'Details' }]}>
    {!order ? <p role={error ? 'alert' : undefined} className={error ? 'text-red-700' : 'text-slate-500'}>{error || 'Loading order…'}</p> : <div className="space-y-5">
      <Link to="/admin/orders" className="text-sm font-medium text-navy-700 hover:underline">← Manage orders</Link>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="rounded-xl border bg-white p-5"><h2 className="text-xl font-bold">Customer and delivery</h2><p className="mt-2">{order.user.fullName} · {order.user.email} · {order.user.phone || 'No phone'}</p><p>{order.user.profile?.companyName || ''} · {order.status} · {order.estimatedTotal == null ? 'Quote required' : `Estimate ₹${Number(order.estimatedTotal).toLocaleString('en-IN')}`}</p><p className="mt-2 text-sm text-slate-600">Delivery: {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.deliveryState} · {order.shippingAddress.phone}</p></section>
      <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Items and source details</h2>{order.items.map(item => <div key={item.id} className="mt-3 border-t pt-3"><b>{item.snapshotProductName}</b> · {item.snapshotVariantLabel} · {item.snapshotPackaging}<p className="text-sm text-slate-600">Brand: {item.snapshotBrand || '—'} · Manufacturer: {item.snapshotManufacturer || '—'} · Seller: {item.snapshotSeller || '—'}</p><p className="text-xs text-slate-500">Supplier/source: {item.snapshotSource?.supplierName || '—'} ({item.snapshotSource?.sourceType || '—'}) · qty {item.quantity} · unit price {item.snapshotPrice == null ? 'Quote required' : `₹${item.snapshotPrice}`}</p></div>)}</section>
      <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Update status</h2><div className="mt-3 flex flex-wrap items-end gap-3"><label className="flex min-w-44 flex-col gap-1 text-xs text-slate-600">Next status<select className="input-base" value={status} onChange={e => setStatus(e.target.value)}><option value="">Choose next status</option>{statuses.filter(value => value !== order.status).map(value => <option key={value}>{value}</option>)}</select></label><label className="flex min-w-48 flex-col gap-1 text-xs text-slate-600">Confirmed total (if quoted)<input className="input-base" placeholder="Optional total" type="number" min="0" value={total} onChange={e => setTotal(e.target.value)} /></label><label className="flex min-w-56 flex-1 flex-col gap-1 text-xs text-slate-600">Customer note<input className="input-base" placeholder="Optional note" value={note} onChange={e => setNote(e.target.value)} /></label><Button disabled={!status} onClick={update}>Save status</Button></div><div className="mt-5"><h3 className="font-medium">Status history</h3>{order.statusHistory.map(entry => <p key={entry.id} className="mt-2 border-l-2 border-teal-500 pl-3 text-sm"><b>{entry.fromStatus || 'NEW'} → {entry.toStatus}</b> · {new Date(entry.createdAt).toLocaleString()} {entry.note && `· ${entry.note}`}</p>)}</div></section>
      <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Notification log</h2>{order.notificationLogs.map(log => <div key={log.id} className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm"><span>{log.channel} · {log.recipient} · <b>{log.status}</b>{log.error && <span className="block text-red-700">{log.error}</span>}</span>{log.status === 'FAILED' && <Button size="sm" variant="outline" onClick={() => retry(log)}>Retry</Button>}</div>)}</section>
    </div>}
  </AdminLayout>;
}

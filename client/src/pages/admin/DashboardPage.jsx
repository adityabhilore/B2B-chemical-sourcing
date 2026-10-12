// src/pages/admin/DashboardPage.jsx
import AdminLayout from '../../components/layout/AdminLayout';
import { StatCard } from '../../components/ui/Cards';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { formatCurrency, formatDate } from '../../lib/utils';

// lucide-react icons
import { useState } from 'react';

// PLACEHOLDER icons as simple SVG until lucide is confirmed working
const IconBox = ({ d }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
  </svg>
);
const PackageIcon = () => <IconBox d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />;
const CartIcon = () => <IconBox d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />;
const UsersIcon = () => <IconBox d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />;
const TrendIcon = () => <IconBox d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />;

// [PLACEHOLDER] — Replace with real API data
const STATS = [
  { label: 'Total Products', value: '[--]', sub: '[PLACEHOLDER] active in catalogue', icon: PackageIcon },
  { label: 'Orders This Month', value: '[--]', sub: '[PLACEHOLDER] vs last month', icon: CartIcon, trend: '[PLACEHOLDER] +0%', trendUp: true },
  { label: 'Registered Customers', value: '[--]', sub: '[PLACEHOLDER] approved', icon: UsersIcon },
  { label: 'Revenue This Month', value: '[--]', sub: '[PLACEHOLDER] confirmed orders', icon: TrendIcon, trend: '[PLACEHOLDER] +0%', trendUp: true },
];

// [PLACEHOLDER] — Replace with real order data from API
const PLACEHOLDER_ORDERS = [
  { id: 'ORD-001', customerName: '[PLACEHOLDER] Acme Chemicals Pvt Ltd', status: 'PENDING',    items: 3, total: null,   createdAt: new Date().toISOString() },
  { id: 'ORD-002', customerName: '[PLACEHOLDER] Horizon Laboratories',    status: 'CONFIRMED', items: 1, total: 45000,  createdAt: new Date().toISOString() },
  { id: 'ORD-003', customerName: '[PLACEHOLDER] IndoPharma Solutions',    status: 'PROCESSING',items: 5, total: 128000, createdAt: new Date().toISOString() },
  { id: 'ORD-004', customerName: '[PLACEHOLDER] SynTech Industries',      status: 'SHIPPED',   items: 2, total: 67500,  createdAt: new Date().toISOString() },
  { id: 'ORD-005', customerName: '[PLACEHOLDER] Metro Chemical Works',    status: 'DELIVERED', items: 4, total: 95000,  createdAt: new Date().toISOString() },
];

const ORDER_COLUMNS = [
  {
    key: 'id', label: 'Order ID',
    render: v => <span className="font-mono text-xs font-semibold text-navy-700 bg-navy-50 px-2 py-0.5 rounded">{v}</span>,
  },
  { key: 'customerName', label: 'Customer' },
  {
    key: 'items', label: 'Items',
    render: v => <span className="text-slate-500 text-xs">{v} item{v !== 1 ? 's' : ''}</span>,
  },
  {
    key: 'total', label: 'Total',
    render: v => <span className="font-semibold text-slate-800">{formatCurrency(v)}</span>,
  },
  {
    key: 'status', label: 'Status',
    render: v => <Badge status={v} dot />,
  },
  {
    key: 'createdAt', label: 'Date',
    render: v => <span className="text-slate-500 text-xs">{formatDate(v)}</span>,
  },
];

export default function DashboardPage() {
  const [search, setSearch] = useState('');

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
    >
      <div className="flex flex-col gap-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {STATS.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-navy-600 hover:text-navy-700 font-medium no-underline">
              View all →
            </a>
          </div>
          <div className="p-4">
            <DataTable
              columns={ORDER_COLUMNS}
              data={PLACEHOLDER_ORDERS}
              searchValue={search}
              onSearch={setSearch}
              searchPlaceholder="Search orders..."
              rowActions={row => (
                <a
                  href={`/admin/orders/${row.id}`}
                  className="btn btn-ghost btn-xs text-navy-600 no-underline"
                >
                  View
                </a>
              )}
            />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

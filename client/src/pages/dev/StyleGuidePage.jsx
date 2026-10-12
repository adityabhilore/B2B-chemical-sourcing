// src/pages/dev/StyleGuidePage.jsx
// ── DEV ONLY ── visible at /style-guide
// Shows every component for visual review before approval
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import Switch from '../../components/ui/Switch';
import FileUpload from '../../components/ui/FileUpload';
import Badge from '../../components/ui/Badge';
import { Card, StatCard, ProductCard, CategoryCard, BlogCard } from '../../components/ui/Cards';
import FormField from '../../components/ui/FormField';
import FilterSidebar from '../../components/ui/FilterSidebar';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import DataTable from '../../components/ui/DataTable';
import { Skeleton, SkeletonCard, EmptyState, ErrorState } from '../../components/ui/States';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';

// Sample icon component
function BoxIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function Section({ title, anchor, children }) {
  return (
    <section id={anchor} className="flex flex-col gap-6 scroll-mt-8">
      <h2 className="text-xl font-bold font-heading text-slate-900 pb-3 border-b-2 border-slate-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const SAMPLE_PRODUCTS = [
  { id: '1', name: 'Methanol Industrial Grade', slug: 'methanol-industrial', images: [], variants: [{ price: null }], status: 'ACTIVE' },
  { id: '2', name: 'Sodium Hydroxide Pellets', slug: 'sodium-hydroxide', images: [], variants: [{ price: 4200 }], status: 'ACTIVE' },
  { id: '3', name: 'Sulfuric Acid 98%', slug: 'sulfuric-acid', images: [], variants: [{ price: 6800 }], status: 'DRAFT' },
];

const TABLE_COLS = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'status', label: 'Status', render: v => <Badge status={v} dot /> },
  {
    key: 'price', label: 'Price',
    render: (_, r) => r.variants[0].price ? `INR ${r.variants[0].price.toLocaleString()}` : 'Request a Quote',
  },
];

const NAVY_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const TEAL_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export default function StyleGuidePage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 font-body">

      {/* Header */}
      <div className="bg-navy-900 py-10 px-6 sticky top-0 z-sticky">
        <div className="max-w-content mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-teal-400 text-xs font-semibold uppercase tracking-widest mb-1">DEV ONLY</p>
            <h1 className="text-2xl font-bold font-heading text-white">ChemMarket Design System</h1>
          </div>
          <a href="/" className="btn btn-secondary btn-sm no-underline">View Site</a>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-16">

        {/* COLOUR PALETTE */}
        <Section title="Colour Palette" anchor="colours">
          <Row label="Navy (Primary Brand)">
            {NAVY_SHADES.map(s => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-lg border border-slate-200 shadow-xs"
                  style={{ background: `var(--color-navy-${s})` }} />
                <span className="text-[10px] text-slate-500">{s}</span>
              </div>
            ))}
          </Row>
          <Row label="Teal (Accent / CTA)">
            {TEAL_SHADES.map(s => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-lg border border-slate-200 shadow-xs"
                  style={{ background: `var(--color-teal-${s})` }} />
                <span className="text-[10px] text-slate-500">{s}</span>
              </div>
            ))}
          </Row>
          <Row label="Semantic Colours">
            {[
              { cls: 'bg-emerald-500', label: 'Success' },
              { cls: 'bg-amber-500', label: 'Warning' },
              { cls: 'bg-red-500', label: 'Danger' },
              { cls: 'bg-slate-400', label: 'Neutral' },
              { cls: 'bg-slate-100 border border-slate-300', label: 'Surface' },
            ].map(c => (
              <div key={c.label} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-lg ${c.cls}`} />
                <span className="text-[10px] text-slate-500">{c.label}</span>
              </div>
            ))}
          </Row>
        </Section>

        {/* TYPOGRAPHY */}
        <Section title="Typography Scale" anchor="typography">
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">h1</span>
              <h1 className="font-heading">Heading 1 — 48px Extrabold</h1>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">h2</span>
              <h2 className="font-heading">Heading 2 — 36px Bold</h2>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">h3</span>
              <h3 className="font-heading">Heading 3 — 30px Bold</h3>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">h4</span>
              <h4 className="font-heading">Heading 4 — 24px Semibold</h4>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">h5</span>
              <h5 className="font-heading">Heading 5 — 20px Semibold</h5>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">h6</span>
              <h6 className="font-heading">Heading 6 — 18px Semibold</h6>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">body</span>
              <p className="text-base text-slate-700">Body Base — Inter 16px. Used for all body copy.</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">sm</span>
              <p className="text-sm text-slate-600">Body Small — 14px. Labels and secondary text.</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">xs</span>
              <p className="text-xs text-slate-500">Caption — 12px. Metadata, timestamps, helper text.</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-slate-400 w-12 shrink-0">grad</span>
              <p className="text-gradient-navy text-4xl font-extrabold font-heading">Gradient Heading Effect</p>
            </div>
          </div>
        </Section>

        {/* BUTTONS */}
        <Section title="Buttons" anchor="buttons">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row label="Sizes">
            <Button size="xs">XSmall</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">XLarge</Button>
          </Row>
          <Row label="States">
            <Button loading>Loading...</Button>
            <Button disabled>Disabled</Button>
            <Button leftIcon={<BoxIcon />}>With Left Icon</Button>
            <Button rightIcon={<BoxIcon />} variant="outline">With Right Icon</Button>
          </Row>
        </Section>

        {/* BADGES */}
        <Section title="Badges / Status Pills" anchor="badges">
          <Row label="Order Statuses">
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
              <Badge key={s} status={s} dot />
            ))}
          </Row>
          <Row label="Product Statuses">
            {['ACTIVE', 'DRAFT', 'ARCHIVED'].map(s => <Badge key={s} status={s} dot />)}
          </Row>
          <Row label="Stock Statuses">
            {['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'ON_REQUEST'].map(s => <Badge key={s} status={s} />)}
          </Row>
          <Row label="Generic">
            {['info', 'success', 'warning', 'danger', 'navy', 'teal', 'neutral'].map(s => (
              <Badge key={s} status={s} />
            ))}
          </Row>
        </Section>

        {/* FORMS */}
        <Section title="Form Elements" anchor="forms">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <FormField label="Reusable FormField" hint="Composes a label and accessible helper text with any control.">
              {props => <input {...props} className="input-base" placeholder="Field managed by FormField" />}
            </FormField>
            <Input label="Text Input" placeholder="Enter value..." hint="Helper text below" />
            <Input label="Input with Error" placeholder="Enter value..." error="This field is required" />
            <Input label="With Left Addon" leftAddon="CAS" placeholder="e.g. 67-56-1" />
            <Input label="Disabled Input" placeholder="Disabled..." disabled />
            <Textarea label="Textarea" placeholder="Enter description..." rows={3} className="col-span-1 md:col-span-2" />
            <Select
              label="Select Dropdown"
              options={[]}
            />
          </div>
          <Row label="Checkbox and Switch">
            <Checkbox
              label="Accept terms and conditions"
              description="By checking this you agree to our Terms of Service."
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
            />
            <Switch
              label="Enable email notifications"
              description="Receive order updates via email"
              checked={switchOn}
              onChange={setSwitchOn}
            />
          </Row>
          <FileUpload
            label="Document Upload"
            accept=".pdf,.doc,.docx"
            hint="PDF or Word documents accepted"
            maxSizeMB={10}
            onFiles={files => console.log(files)}
          />
        </Section>

        {/* SEARCH BAR */}
        <Section title="SearchBar" anchor="search">
          <div className="max-w-xl flex flex-col gap-4">
            <SearchBar size="sm" value={search} onChange={setSearch} placeholder="Small search..." />
            <SearchBar size="md" value={search} onChange={setSearch} placeholder="Medium (default)..." />
            <SearchBar size="lg" value={search} onChange={setSearch} placeholder="Large hero search..." />
          </div>
        </Section>

        {/* CARDS */}
        <Section title="Cards" anchor="cards">
          <Row label="Stat Cards">
            <StatCard
              label="Total Products"
              value="1,240"
              sub="All active products"
              icon={BoxIcon}
              trend="+12% this month"
              trendUp={true}
              className="w-56"
            />
            <StatCard
              label="Pending Orders"
              value="34"
              sub="Awaiting confirmation"
              icon={BoxIcon}
              trend="-3 from last week"
              trendUp={false}
              className="w-56"
            />
          </Row>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Cards</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SAMPLE_PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <Row label="Category and Blog Cards">
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <CategoryCard category={{ name: '', slug: '', description: '[PLACEHOLDER] Category description' }} />
              <BlogCard post={{ title: '[PLACEHOLDER] Article title', slug: 'placeholder', excerpt: '[PLACEHOLDER] Article summary', authorName: '[PLACEHOLDER Author]', tags: ['Technical'] }} />
            </div>
          </Row>
        </Section>

        {/* DATA TABLE */}
        <Section title="DataTable" anchor="datatable">
          <FilterSidebar title="Example filters" className="max-w-xs"><label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Published only</label></FilterSidebar>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">With Data</p>
          <DataTable
            columns={TABLE_COLS}
            data={SAMPLE_PRODUCTS}
            searchValue={search}
            onSearch={setSearch}
            searchPlaceholder="Search products..."
            sortKey="name"
            sortDir="asc"
            onSort={(k, d) => console.log(k, d)}
            page={1}
            totalPages={3}
            totalItems={30}
            pageSize={10}
            onPageChange={p => console.log(p)}
            rowActions={row => (
              <div className="flex gap-1">
                <Button variant="ghost" size="xs">Edit</Button>
                <Button variant="danger" size="xs">Delete</Button>
              </div>
            )}
          />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-4">Loading State</p>
          <DataTable columns={TABLE_COLS} data={[]} loading={true} />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-4">Empty State</p>
          <DataTable
            columns={TABLE_COLS}
            data={[]}
            emptyTitle="No products yet"
            emptyDescription="Add your first product to get started."
          />
        </Section>

        {/* TABS */}
        <Section title="Tabs" anchor="tabs">
          <Tabs defaultTab="overview">
            <TabList>
              <Tab value="overview">Overview</Tab>
              <Tab value="variants">Variants</Tab>
              <Tab value="documents">Documents</Tab>
              <Tab value="orders">Orders</Tab>
            </TabList>
            <TabPanel value="overview">
              <p className="text-slate-600">Overview tab content goes here.</p>
            </TabPanel>
            <TabPanel value="variants">
              <p className="text-slate-600">Variants tab content goes here.</p>
            </TabPanel>
            <TabPanel value="documents">
              <p className="text-slate-600">Documents tab content goes here.</p>
            </TabPanel>
            <TabPanel value="orders">
              <p className="text-slate-600">Orders tab content goes here.</p>
            </TabPanel>
          </Tabs>
        </Section>

        {/* BREADCRUMBS */}
        <Section title="Breadcrumbs" anchor="breadcrumbs">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Products', href: '/admin/products' },
              { label: 'Sample Product' },
            ]}
          />
        </Section>

        {/* PAGINATION */}
        <Section title="Pagination" anchor="pagination">
          <Pagination
            page={page}
            totalPages={10}
            onPageChange={setPage}
            totalItems={200}
            pageSize={20}
          />
        </Section>

        {/* SKELETONS */}
        <Section title="Skeleton Loaders" anchor="skeletons">
          <Skeleton height={24} className="w-64" />
          <Skeleton lines={3} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </Section>

        {/* SPINNERS */}
        <Section title="Spinners" anchor="spinners">
          <Row label="Sizes — navy">
            <Spinner size="sm" className="text-navy-600" />
            <Spinner size="md" className="text-navy-600" />
            <Spinner size="lg" className="text-navy-600" />
            <Spinner size="xl" className="text-teal-500" />
          </Row>
        </Section>

        {/* EMPTY / ERROR STATES */}
        <Section title="Empty and Error States" anchor="states">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <EmptyState
                title="No products found"
                description="Try adjusting your search or filters to find what you need."
                actionLabel="Add Product"
                action={() => {}}
              />
            </Card>
            <Card>
              <ErrorState
                title="Failed to load data"
                message="Could not connect to the server. Please check your connection and try again."
                onRetry={() => {}}
              />
            </Card>
          </div>
        </Section>

        {/* TOAST */}
        <Section title="Toast Notifications" anchor="toasts">
          <Row label="Trigger Toasts">
            <Button variant="primary" onClick={() => toast.success('Product saved successfully!')}>
              Success
            </Button>
            <Button variant="danger" onClick={() => toast.error('Something went wrong. Please try again.')}>
              Error
            </Button>
            <Button variant="outline" onClick={() => toast.warning('Stock is running low on this item.')}>
              Warning
            </Button>
            <Button variant="ghost" onClick={() => toast.info('Your session will expire in 5 minutes.')}>
              Info
            </Button>
          </Row>
        </Section>

        {/* MODAL */}
        <Section title="Modal and Confirm Dialog" anchor="modals">
          <Row label="Trigger">
            <Button variant="primary" onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open Confirm Dialog</Button>
          </Row>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Product Details" size="md">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                This is the modal body. Compose any content here — forms, detail views, or confirmations.
              </p>
              <Input label="Product Name" placeholder="Enter product name..." />
              <Select label="Category" options={[]} />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setModalOpen(false)}>Save Changes</Button>
              </div>
            </div>
          </Modal>

          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Delete Product?"
            message="This action cannot be undone. The product and all its variants will be permanently deleted from the catalogue."
            confirmLabel="Delete Product"
            variant="danger"
            onConfirm={() => {
              toast.success('Product deleted.');
              setConfirmOpen(false);
            }}
          />
        </Section>

      </div>
    </div>
  );
}

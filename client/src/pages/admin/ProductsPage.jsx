import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export default function ProductsPage(){
 const {toast}=useToast();const toastRef=useRef(toast);const [items,setItems]=useState([]),[meta,setMeta]=useState({page:1,totalPages:1,total:0,limit:20}),[options,setOptions]=useState({categories:[],brands:[]}),[page,setPage]=useState(1),[search,setSearch]=useState(''),[filters,setFilters]=useState({category:'',brand:'',source:'',status:''}),[loading,setLoading]=useState(true),[confirm,setConfirm]=useState(null),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{setLoading(true);try{const {data}=await api.get('/products/admin',{params:{page,limit:20,search,...filters}});setItems(data.data.items);setMeta(data.data.meta);}catch(e){toastRef.current.error(e.response?.data?.message||'Could not load products.');}finally{setLoading(false);}},[page,search,filters]);
 useEffect(()=>{load();},[load]);useEffect(()=>{api.get('/products/admin/options').then(({data})=>setOptions(data.data)).catch(()=>{});},[]);
 const setFilter=(key,value)=>{setFilters(current=>({...current,[key]:value}));setPage(1);};
 const publish=async row=>{try{await api.patch(`/products/admin/${row.id}/status`,{status:row.status==='ACTIVE'?'DRAFT':'ACTIVE'});toast.success(row.status==='ACTIVE'?'Product unpublished.':'Product published.');load();}catch(e){toast.error(e.response?.data?.message||'Could not update publication status.');}};
 const remove=async()=>{setBusy(true);try{await api.delete(`/products/admin/${confirm.id}`);toast.success('Product removed from the catalogue.');setConfirm(null);load();}catch(e){toast.error(e.response?.data?.message||'Could not remove product.');setConfirm(null);}finally{setBusy(false);}};
 const columns=useMemo(()=>[
  {key:'id',label:'ID',render:(_,r)=><span className="font-mono text-xs">{r.id.slice(0,9)}</span>},
  {key:'product',label:'Product',render:(_,r)=><div className="flex items-center gap-3 min-w-48">{r.images?.[0]?.url?<img src={r.images.find(i=>i.isPrimary)?.url||r.images[0].url} alt="" className="h-12 w-12 rounded-lg object-cover"/>:<div className="h-12 w-12 rounded-lg bg-slate-100"/>}<div><p className="font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.slug}</p></div></div>},
  {key:'price',label:'Price',render:(_,r)=>r.pricingMode==='REQUEST_QUOTE'?'Quote':r.basePrice!=null?`₹${Number(r.basePrice).toLocaleString('en-IN')}`:'Quote'},
  {key:'stock',label:'Stock',render:(_,r)=>r.trackStock?(r.stockQuantity??0):'On request'},
  {key:'category',label:'Category',render:(_,r)=>r.category?.name||'—'},
  {key:'brand',label:'Brand / Manufacturer',render:(_,r)=><span>{r.brand?.name||'—'}{(r.manufacturerCompany?.name||r.manufacturer?.name)?` / ${r.manufacturerCompany?.name||r.manufacturer?.name}`:''}</span>},
  {key:'status',label:'Status',render:(_,r)=><Badge status={r.status}/>},
 ],[]);
 const filterControls=<><Select aria-label="Category filter" placeholder="All categories" value={filters.category} onChange={e=>setFilter('category',e.target.value)} options={options.categories.map(c=>({value:c.id,label:c.name}))} className="w-44"/><Select aria-label="Brand filter" placeholder="All brands" value={filters.brand} onChange={e=>setFilter('brand',e.target.value)} options={options.brands.map(b=>({value:b.id,label:b.name}))} className="w-40"/><Select aria-label="Source filter" placeholder="All sources" value={filters.source} onChange={e=>setFilter('source',e.target.value)} options={['OUR_COMPANY','OTHER_COMPANY']} className="w-44"/><Select aria-label="Status filter" placeholder="All statuses" value={filters.status} onChange={e=>setFilter('status',e.target.value)} options={['ACTIVE','DRAFT','ARCHIVED']} className="w-40"/></>;
 return <AdminLayout title="Manage Products" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Products'}]}><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Products</h2><p className="mt-1 text-sm text-slate-500">Maintain catalogue details, pricing, stock, and publication.</p></div><Link to="/admin/products/new" className="btn btn-primary btn-md no-underline">Add Product</Link></div><DataTable columns={columns} data={items} loading={loading} onSearch={value=>{setSearch(value);setPage(1)}} searchValue={search} searchPlaceholder="Search name, slug, or CAS…" filters={filterControls} page={meta.page} totalPages={meta.totalPages} totalItems={meta.total} pageSize={meta.limit} onPageChange={setPage} rowActions={row=><div className="flex justify-end gap-2"><Link to={`/admin/products/${row.id}`} className="btn btn-outline btn-xs no-underline">Edit</Link><Button size="xs" variant="outline" onClick={()=>publish(row)}>{row.status==='ACTIVE'?'Unpublish':'Publish'}</Button><Button size="xs" variant="danger" onClick={()=>setConfirm(row)}>Delete</Button></div>} emptyTitle="No products found"/><ConfirmDialog open={!!confirm} onClose={()=>setConfirm(null)} title="Remove product?" message={`Remove “${confirm?.name}” from the catalogue? Products with order history cannot be deleted; archive them instead.`} confirmLabel="Remove product" loading={busy} onConfirm={remove}/></AdminLayout>;
}

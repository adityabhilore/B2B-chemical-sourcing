import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { api } from '../../lib/api';
import { EmptyState } from '../../components/ui/States';
import { setPageMeta } from '../../lib/seo';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPageMeta({ title: 'Chemical Categories | Chemical Market', description: 'Browse chemical products by category and find the right materials for your business.' });
    let active = true;
    api.get('/catalogue/public/categories/tree')
      .then(({ data }) => { if (active) setCategories(data.data); })
      .catch(e => { if (active) setError(e.response?.data?.message || 'Categories could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <PublicLayout><section className="container-content py-10 sm:py-14">
    <header className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Explore our catalogue</p><h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Product Categories</h1><p className="mt-2 max-w-2xl text-slate-600">Browse the catalogue by chemical category, then open a category to see matching products.</p></header>
    {error ? <EmptyState title="Categories unavailable" description={error} /> : loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}</div> : categories.length === 0 ? <EmptyState title="No categories available" description="Published categories will appear here." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map(category => <article key={category.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md">
      <Link to={`/products?category=${encodeURIComponent(category.slug)}`} className="text-lg font-semibold text-navy-800 no-underline hover:text-teal-700">{category.name}</Link>
      {category.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{category.description}</p>}
      {category.children?.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{category.children.map(child => <li key={child.id}><Link to={`/products?category=${encodeURIComponent(child.slug)}`} className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 no-underline hover:bg-teal-50 hover:text-teal-800">{child.name}</Link></li>)}</ul>}
      <Link to={`/products?category=${encodeURIComponent(category.slug)}`} className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">View products →</Link>
    </article>)}</div>}
  </section></PublicLayout>;
}

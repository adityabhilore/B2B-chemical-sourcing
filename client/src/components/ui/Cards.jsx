// src/components/ui/Cards.jsx — Card, StatCard, ProductCard, CategoryCard, BlogCard
import { cn, formatCurrency, truncate } from '../../lib/utils';
import Badge from './Badge';

/* ─── Base Card ─────────────────────────────────────────────────── */
export function Card({ children, className, hover = false }) {
  return (
    <div className={cn('card', hover && 'card-hover cursor-pointer', className)}>
      {children}
    </div>
  );
}
export function CardBody({ children, className }) {
  return <div className={cn('card-body', className)}>{children}</div>;
}

/* ─── StatCard ──────────────────────────────────────────────────── */
export function StatCard({ label, value, sub, icon: Icon, trend, trendUp, className }) {
  return (
    <div className={cn('card card-body flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className="p-2 bg-navy-50 rounded-lg text-navy-600">
            <Icon className="w-5 h-5" />
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold font-heading text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <p className={cn('text-xs font-medium flex items-center gap-1', trendUp ? 'text-emerald-600' : 'text-red-600')}>
          <span>{trendUp ? '↑' : '↓'}</span>
          {trend}
        </p>
      )}
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────────────── */
export function ProductCard({ product, className }) {
  const { name, slug, images = [], variants = [], status, category } = product;
  const primaryImage = images.find(i => i.isPrimary) || images[0];
  const lowestPrice = variants.reduce((min, v) => {
    if (v.price == null || v.pricingMode === 'REQUEST_QUOTE') return min;
    return min == null ? Number(v.price) : Math.min(min, Number(v.price));
  }, null);

  return (
    <a
      href={`/products/${slug}`}
      className={cn(
        'card card-hover flex flex-col overflow-hidden group no-underline',
        className
      )}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText || name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.32 2.798H4.118c-1.35 0-2.318-1.798-1.319-2.798L4 15.3" />
            </svg>
          </div>
        )}
        {status && status !== 'ACTIVE' && (
          <div className="absolute top-2 left-2">
            <Badge status={status} size="sm" />
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {category && <p className="text-xs text-teal-600 font-medium uppercase tracking-wide">{category.name}</p>}
        <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-navy-700 transition-colors">
          {name}
        </h3>
        {product.brand?.name && <p className="text-xs text-slate-500">{product.brand.name}</p>}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-navy-700">
            {lowestPrice != null ? `From ${formatCurrency(lowestPrice)}` : product.pricingMode === 'FIXED' && product.basePrice != null ? `From ${formatCurrency(product.basePrice)}` : 'Request a Quote'}
          </span>
          {variants.length > 0 && (
            <span className="text-xs text-slate-400">{variants.length} variant{variants.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </a>
  );
}

/* ─── CategoryCard ──────────────────────────────────────────────── */
export function CategoryCard({ category, className }) {
  const { name, slug, imageUrl, description } = category;
  return (
    <a
      href={`/products?category=${slug}`}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white',
        'hover:shadow-navy-md hover:border-navy-200 transition-all duration-200',
        'flex flex-col no-underline',
        className
      )}
    >
      <div className="aspect-video bg-gradient-to-br from-navy-600 to-navy-800 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full bg-grid-pattern opacity-30" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-navy-700 transition-colors">{name}</h3>
        {description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{truncate(description, 80)}</p>}
      </div>
    </a>
  );
}

/* ─── BlogCard ──────────────────────────────────────────────────── */
export function BlogCard({ post, className }) {
  const { title, slug, excerpt, coverImageUrl, publishedAt, authorName, tags = [] } = post;
  return (
    <a
      href={`/blog/${slug}`}
      className={cn(
        'card card-hover flex flex-col overflow-hidden group no-underline',
        className
      )}
    >
      <div className="aspect-video bg-slate-100 overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy-50 to-teal-50" />
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map(t => (
              <Badge key={t} status="teal" size="sm">{t}</Badge>
            ))}
          </div>
        )}
        <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-navy-700 transition-colors line-clamp-2">
          {title}
        </h3>
        {excerpt && <p className="text-sm text-slate-500 line-clamp-2">{excerpt}</p>}
        <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-slate-400">
          {authorName && <span>{authorName}</span>}
          {publishedAt && <span>·</span>}
          {publishedAt && <span>{new Date(publishedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>}
        </div>
      </div>
    </a>
  );
}

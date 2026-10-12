import os

base = r'e:\A\Chemical_Market\client\src'

pages = {
    'pages/public/HomePage.jsx': '''// src/pages/public/HomePage.jsx
// All [PLACEHOLDER] sections are clearly marked. No invented claims or certifications.
import { useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import { ProductCard } from "../../components/ui/Cards";
import SearchBar from "../../components/ui/SearchBar";

const PLACEHOLDER_PRODUCTS = [
  { id:"1", name:"Methanol (Industrial Grade)", slug:"methanol-industrial", casNumber:"67-56-1", images:[], variants:[{price:null}], category:{name:"Solvents"}, status:"ACTIVE" },
  { id:"2", name:"Sodium Hydroxide Pellets", slug:"sodium-hydroxide-pellets", casNumber:"1310-73-2", images:[], variants:[{price:4200}], category:{name:"Alkalis"}, status:"ACTIVE" },
  { id:"3", name:"Sulfuric Acid 98%", slug:"sulfuric-acid-98", casNumber:"7664-93-9", images:[], variants:[{price:6800}], category:{name:"Acids"}, status:"ACTIVE" },
  { id:"4", name:"Acetone LR Grade", slug:"acetone-lr", casNumber:"67-64-1", images:[], variants:[{price:3200},{price:2900}], category:{name:"Solvents"}, status:"ACTIVE" },
  { id:"5", name:"Potassium Permanganate", slug:"potassium-permanganate", casNumber:"7722-64-7", images:[], variants:[{price:null}], category:{name:"Oxidisers"}, status:"ACTIVE" },
  { id:"6", name:"Hydrochloric Acid 35%", slug:"hydrochloric-acid-35", casNumber:"7647-01-0", images:[], variants:[{price:5200}], category:{name:"Acids"}, status:"ACTIVE" },
  { id:"7", name:"Isopropyl Alcohol 99%", slug:"isopropyl-alcohol-99", casNumber:"67-63-0", images:[], variants:[{price:8500}], category:{name:"Solvents"}, status:"ACTIVE" },
  { id:"8", name:"Calcium Chloride Flakes", slug:"calcium-chloride-flakes", casNumber:"10043-52-4", images:[], variants:[{price:1800}], category:{name:"Salts"}, status:"ACTIVE" },
];

const CATEGORIES = [
  { id:"1", name:"Solvents", slug:"solvents", description:"Industrial and laboratory grade solvents" },
  { id:"2", name:"Acids", slug:"acids", description:"Inorganic and organic acids" },
  { id:"3", name:"Alkalis and Bases", slug:"alkalis", description:"Caustic soda, ammonia and more" },
  { id:"4", name:"Oxidising Agents", slug:"oxidisers", description:"Permanganates, peroxides and oxidisers" },
  { id:"5", name:"Salts and Minerals", slug:"salts", description:"Chlorides, sulphates, carbonates" },
  { id:"6", name:"Specialty Chemicals", slug:"specialty", description:"High-purity and application-specific chemicals" },
];

const HOW_IT_WORKS = [
  { step:"01", title:"Browse or Search", desc:"Find chemicals by name, CAS number, category, or application." },
  { step:"02", title:"Request or Order", desc:"Add items to your enquiry. For listed prices, place a direct order." },
  { step:"03", title:"We Confirm and Quote", desc:"Our team reviews your request and confirms pricing and availability." },
  { step:"04", title:"Delivery to Your Door", desc:"We handle packaging, documentation and logistics to your facility." },
];

const BLOG_POSTS = [
  { id:"1", title:"Understanding SDS: A Buyer Guide", slug:"understanding-sds", excerpt:"[PLACEHOLDER] What every procurement manager needs to know before ordering chemicals.", publishedAt:"2026-09-15", authorName:"[PLACEHOLDER Author]", tags:["Safety","Compliance"] },
  { id:"2", title:"Industrial vs Laboratory Grade Chemicals", slug:"industrial-vs-lab-grade", excerpt:"[PLACEHOLDER] How product grade affects purity, pricing, and suitability for your process.", publishedAt:"2026-09-01", authorName:"[PLACEHOLDER Author]", tags:["Technical"] },
  { id:"3", title:"Bulk Packaging Options for Chemical Procurement", slug:"bulk-packaging-options", excerpt:"[PLACEHOLDER] IBC tanks, drums, bags - understanding your packaging choices.", publishedAt:"2026-08-20", authorName:"[PLACEHOLDER Author]", tags:["Logistics"] },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  return (
    <PublicLayout>

      {/* HERO */}
      <section className="relative bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/60 to-navy-900" aria-hidden="true" />
        <div className="relative container-content py-24 lg:py-36 text-center flex flex-col items-center gap-8">
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest">[PLACEHOLDER] Your B2B Chemical Partner</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white text-balance">
            Source Industrial Chemicals<br />
            <span className="text-teal-400">With Confidence</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            [PLACEHOLDER] Browse our catalogue of industrial, specialty and laboratory chemicals.
            Request quotes, view technical documents, and track orders.
          </p>
          <div className="w-full max-w-2xl">
            <SearchBar value={search} onChange={setSearch} size="lg" placeholder="Search by name, CAS number, or category..." className="shadow-2xl" />
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {["Methanol","Sulfuric Acid","Acetone","Sodium Hydroxide"].map(t => (
                <button key={t} type="button" onClick={() => setSearch(t)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition-colors">{t}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/products" className="btn btn-primary btn-lg no-underline">Browse Catalogue</a>
            <a href="/auth/register" className="btn btn-outline btn-lg border-white/30 text-white hover:bg-white/10 no-underline">Create Account</a>
          </div>
        </div>
      </section>

      {/* TRUST STRIP - PLACEHOLDER */}
      <section className="bg-navy-800 border-y border-navy-700">
        <div className="container-content py-6">
          <p className="text-xs text-navy-400 text-center mb-4 uppercase tracking-widest">[PLACEHOLDER - replace with verified stats or remove]</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-navy-700">
            {[{v:"500+",l:"Products in Catalogue"},{v:"30+",l:"Categories"},{v:"50+",l:"Brands"},{v:"Pan-India",l:"Delivery Coverage"}].map(s => (
              <div key={s.l} className="px-6 py-3 text-center">
                <p className="text-3xl font-bold font-heading text-white">{s.v}</p>
                <p className="text-xs text-slate-400 mt-1">[PLACEHOLDER] {s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section-py bg-white">
        <div className="container-content">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-teal-600 text-sm font-semibold uppercase tracking-wider mb-2">Products</p>
              <h2 className="text-3xl font-bold font-heading text-slate-900">Featured Chemicals</h2>
            </div>
            <a href="/products" className="btn btn-outline btn-sm shrink-0 no-underline">View All</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLACEHOLDER_PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="section-py bg-slate-50">
        <div className="container-content">
          <div className="text-center mb-10">
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-wider mb-2">Catalogue</p>
            <h2 className="text-3xl font-bold font-heading text-slate-900">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map(cat => (
              <a key={cat.id} href={"/products?category=" + cat.slug}
                className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-navy-300 hover:shadow-navy-md transition-all no-underline">
                <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-600 shrink-0 group-hover:bg-navy-600 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-navy-700 transition-colors">{cat.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
                <svg className="w-4 h-4 text-slate-300 ml-auto shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-py bg-white">
        <div className="container-content">
          <div className="text-center mb-12">
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-wider mb-2">Simple Process</p>
            <h2 className="text-3xl font-bold font-heading text-slate-900">How Ordering Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy-600 flex items-center justify-center text-white font-bold font-heading text-sm">{s.step}</div>
                <div>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS STRIP - PLACEHOLDER */}
      <section className="bg-slate-50 border-y border-slate-200 py-10">
        <div className="container-content">
          <p className="text-center text-xs text-slate-400 uppercase tracking-widest mb-6">[PLACEHOLDER - add real brand logos]</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {["Brand A","Brand B","Brand C","Brand D","Brand E","Brand F"].map(b => (
              <div key={b} className="h-8 px-5 bg-slate-300 rounded flex items-center justify-center text-xs font-semibold text-slate-600">{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST BLOG */}
      <section className="section-py bg-white">
        <div className="container-content">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-teal-600 text-sm font-semibold uppercase tracking-wider mb-2">Knowledge Base</p>
              <h2 className="text-3xl font-bold font-heading text-slate-900">Latest Articles</h2>
            </div>
            <a href="/blog" className="btn btn-outline btn-sm shrink-0 no-underline">View All</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map(post => (
              <a key={post.id} href={"/blog/" + post.slug} className="group card card-hover flex flex-col overflow-hidden no-underline">
                <div className="h-44 bg-gradient-to-br from-navy-50 to-teal-50 flex items-center justify-center text-slate-200">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex flex-wrap gap-1">{post.tags.map(t => <span key={t} className="badge bg-teal-50 text-teal-700 border border-teal-100 text-xs">{t}</span>)}</div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-navy-700 transition-colors leading-snug">{post.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
                  <p className="text-xs text-slate-400 mt-auto pt-2">{post.authorName}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="section-py bg-navy-600">
        <div className="container-content text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold font-heading text-white">Cannot find what you need?</h2>
          <p className="text-navy-200 max-w-xl mx-auto">[PLACEHOLDER] Our team can source specialty and custom-specification chemicals. Get in touch for a personalised quote.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/contact" className="btn btn-secondary btn-lg no-underline">Send an Enquiry</a>
            <a href="/products" className="btn btn-outline btn-lg border-white/30 text-white hover:bg-white/10 no-underline">Browse Catalogue</a>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
''',
}

for relpath, content in pages.items():
    full = os.path.join(base, relpath.replace('/', os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Written: {relpath}')

print('Done')

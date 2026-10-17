import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Factory, FileCheck2, Handshake } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import { api } from '../../lib/api';
import { setPageMeta } from '../../lib/seo';

const copy = {
  story: 'Chemical Market helps business buyers discover chemical products and send quote or order requests through one catalogue.',
  capabilities: 'Browse product information, compare available packaging, and contact our team to confirm availability and commercial details.',
  sourcing: 'Sourcing and availability can vary by product. Our team can discuss your requirements and confirm the source before an order is accepted.',
  manufacturing: 'Manufacturer information is shown on product pages when it is available. Contact us if you need confirmation for a specific product.',
  quality: 'Review the product page for available specifications and safety documents. Contact our team if you need a current document or additional product information.',
};

const sections = [
  { key: 'aboutSourcing', title: 'Sourcing and availability', icon: Handshake },
  { key: 'aboutManufacturing', title: 'Manufacturing information', icon: Factory },
  { key: 'aboutQuality', title: 'Specifications and documents', icon: FileCheck2 },
];

export default function AboutPage() {
  const [site, setSite] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/content/public/homepage')
      .then(({ data }) => { if (active) setSite(data.data.site || {}); })
      .catch(() => { if (active) setError('Company details could not be loaded. You can still contact our team for help.'); });
    setPageMeta({ title: 'About Us | Chemical Market', description: 'Learn how Chemical Market helps business buyers find chemical products and contact our team.' });
    return () => { active = false; };
  }, []);

  return <PublicLayout settings={site}>
    <section className="bg-navy-900 text-white">
      <div className="container-content section-py">
        <p className="eyebrow text-teal-300">About {site.name || 'Chemical Market'}</p>
        <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">A clearer way to source chemical products</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">{site.aboutStory || copy.story}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/products" className="btn btn-primary no-underline">Explore products <ArrowRight size={16} /></Link>
          <Link to="/contact" className="btn btn-outline border-white/40 text-white no-underline">Talk to our team</Link>
        </div>
      </div>
    </section>

    <main className="container-content section-py">
      {error && <p role="status" className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
      <section className="mx-auto max-w-3xl text-center">
        <BadgeCheck className="mx-auto text-teal-700" size={32} aria-hidden="true" />
        <h2 className="mt-4 text-3xl font-semibold">Built around the buyer’s next step</h2>
        <p className="mt-4 whitespace-pre-line text-lg leading-8 text-slate-600">{site.aboutCapabilities || copy.capabilities}</p>
      </section>

      <section className="mt-14 grid gap-5 sm:grid-cols-2">
        {sections.map(({ key, title, icon: Icon }) => <article key={key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Icon className="text-teal-700" size={26} aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{site[key] || copy[key.replace('about', '').replace(/^./, c => c.toLowerCase())]}</p>
        </article>)}
      </section>

      <section className="mt-14 rounded-2xl bg-slate-50 p-7 text-center sm:p-10">
        <h2 className="text-2xl font-semibold">Have a product or documentation question?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">Share the product name, grade, packaging, and destination you need. Our team can follow up with the information available.</p>
        <Link to="/contact" className="btn btn-secondary mt-6 no-underline">Contact {site.name || 'Chemical Market'}</Link>
      </section>
    </main>
  </PublicLayout>;
}

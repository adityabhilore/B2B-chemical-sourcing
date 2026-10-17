import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { api } from '../../lib/api';
import { setPageMeta } from '../../lib/seo';

const pages = {
  '/terms': {
    title: 'Terms of Use',
    description: 'Terms for using the Chemical Market catalogue and enquiry services.',
    sections: [
      ['Catalogue and enquiries', 'Product descriptions, packaging, availability, prices, taxes, and delivery estimates are informational and may change. Submitting an enquiry or order request does not by itself create an accepted order or a binding offer. Our team must confirm the product, quantity, price, availability, and delivery terms in writing.'],
      ['Product information and safety', 'Review the current Safety Data Sheet and applicable product documentation before purchase, transport, storage, or use. Follow the supplier instructions and all applicable laws. Website descriptions do not replace product-specific safety documents or professional advice.'],
      ['Shipping and payment', 'Shipping amounts shown on this website are estimates. Chemical transport requirements and final charges depend on the product, packaging, route, carrier, and quantity, and are confirmed separately. Payment terms are confirmed with the accepted order.'],
      ['Your use of the site', 'Provide accurate business and delivery details, keep account credentials secure, and use the catalogue and enquiry services lawfully. Do not rely on the site for emergency response or time-sensitive safety instructions.'],
      ['Questions', 'Contact us to discuss these terms or a product enquiry. These terms are a general website notice and require review for the business and jurisdictions where the service operates.'],
    ],
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'How information submitted through Chemical Market is used to respond to business enquiries.',
    sections: [
      ['Information you submit', 'When you register, submit an order request, or contact us, the site may collect the contact, business, account, delivery, and enquiry details you provide, along with information needed to operate and protect the service. Do not submit sensitive personal information unless it is needed for your request.'],
      ['How information is used', 'Information is used to administer accounts, respond to enquiries, review business requests, coordinate product and delivery details, and operate and protect the website. Information may be shared with service providers or business partners only as needed to support these activities and the requested transaction.'],
      ['Your choices', 'Contact us to ask about access, correction, or deletion of information associated with your account or enquiry. Some records may need to be retained to complete a request, meet legal requirements, or resolve disputes.'],
      ['Contact and review', 'Use the contact details published on this site for privacy questions. This notice must be checked against the actual service providers, retention practices, and applicable privacy laws before production publication.'],
    ],
  },
  '/safety': {
    title: 'Chemical Safety and Shipping',
    description: 'Important safety and shipping information for chemical product enquiries.',
    sections: [
      ['Read current product documentation', 'Before ordering, transporting, storing, or using a chemical, obtain and review the current Safety Data Sheet and any applicable technical or compliance documents for the specific product, grade, and package. Ask our team if a document is not available on the product page.'],
      ['Use qualified procedures', 'Only trained and authorized personnel should handle chemical products. Follow the supplier documentation, workplace procedures, protective equipment requirements, and all applicable laws. Do not use catalogue content as emergency or medical advice.'],
      ['Transport and availability', 'Product availability, packaging, and transport options depend on the product and destination. An order request and shipping estimate are not confirmation that a product can legally or safely be shipped. Our team will confirm the applicable arrangements before accepting an order.'],
    ],
  },
};

export default function PolicyPage() {
  const { pathname } = useLocation();
  const page = pages[pathname] || pages['/terms'];
  const [site, setSite] = useState({});
  useEffect(() => { api.get('/content/public/homepage').then(({ data }) => setSite(data.data.site || {})).catch(() => {}); }, []);
  useEffect(() => { setPageMeta({ title: `${page.title} | ${site.name || 'Chemical Market'}`, description: page.description }); }, [page, site.name]);
  return <PublicLayout settings={site}><section className="container-content max-w-4xl section-py"><p className="eyebrow">Information</p><h1>{page.title}</h1><p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Please contact the business team if you need clarification. Terms and privacy language should be reviewed against the business’s actual practices before production use.</p><div className="mt-8 space-y-8">{page.sections.map(([heading, body]) => <section key={heading}><h2 className="text-xl font-semibold">{heading}</h2><p className="mt-3 leading-7 text-slate-700">{body}</p></section>)}</div><p className="mt-10 border-t pt-5 text-sm text-slate-600">{site.email && <>Email <a href={`mailto:${site.email}`}>{site.email}</a>. </>}<Link to="/contact">Contact our team</Link></p></section></PublicLayout>;
}

const canonicalUrl = (url) => {
  const parsed = new URL(url || window.location.pathname, window.location.origin);
  return `${parsed.origin}${parsed.pathname}`;
};

export function setPageMeta({ title, description = '', image = '', url = '', type = 'website', structuredData }) {
  const pageTitle = title || 'Chemical Market';
  const canonical = canonicalUrl(url);
  document.title = pageTitle;
  const setMeta = (name, content, property = false) => {
    const attr = property ? 'property' : 'name';
    let element = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!element) { element = document.createElement('meta'); element.setAttribute(attr, name); document.head.appendChild(element); }
    element.content = content || '';
  };
  setMeta('description', description);
  setMeta('og:title', pageTitle, true);
  setMeta('og:description', description, true);
  setMeta('og:image', image, true);
  setMeta('og:url', canonical, true);
  setMeta('og:type', type, true);
  setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = canonical;
  let script = document.head.querySelector('#page-structured-data');
  const path = new URL(canonical).pathname;
  const pageData = structuredData || (/^\/blog\/[^/]+$/.test(path) ? {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: pageTitle,
    description: description || undefined, image: image || undefined, mainEntityOfPage: canonical,
  } : null);
  if (pageData) {
    if (!script) { script = document.createElement('script'); script.id = 'page-structured-data'; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(pageData).replace(/</g, '\\u003c');
  } else script?.remove();
}

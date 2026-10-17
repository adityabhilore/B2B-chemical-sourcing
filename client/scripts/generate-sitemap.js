import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteUrl = process.env.VITE_SITE_URL?.replace(/\/$/, '');
const dist = resolve('dist');
if (!siteUrl || !/^https?:\/\//.test(siteUrl)) {
  console.warn('[seo] Set VITE_SITE_URL to the public production origin to generate sitemap.xml and add its robots.txt reference.');
  process.exit(0);
}

const urls = new Set(['/', '/products', '/blog', '/about', '/contact', '/terms', '/privacy', '/safety'].map(path => `${siteUrl}${path}`));
const apiUrl = process.env.VITE_API_URL?.replace(/\/$/, '');
if (apiUrl) {
  for (const [path, prefix] of [['/api/products/public', '/products/'], ['/api/content/public/blog', '/blog/']]) {
    try {
      let pages = 1;
      for (let page = 1; page <= Math.min(pages, 100); page += 1) {
        const response = await fetch(`${apiUrl}${path}?limit=100&page=${page}`, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) break;
        const body = await response.json();
        for (const item of body.data?.items || []) if (item.slug) urls.add(`${siteUrl}${prefix}${encodeURIComponent(item.slug)}`);
        pages = Number(body.data?.meta?.totalPages || 1);
      }
    } catch (error) {
      console.warn(`[seo] Could not load dynamic sitemap URLs from ${path}: ${error.message}`);
    }
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map(url => `  <url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve(dist, 'sitemap.xml'), xml, 'utf8');
await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /auth\nSitemap: ${siteUrl}/sitemap.xml\n`, 'utf8');
console.info(`[seo] Generated sitemap.xml with ${urls.size} public URLs.`);

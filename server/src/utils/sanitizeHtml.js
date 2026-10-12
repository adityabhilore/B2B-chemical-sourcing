const ALLOWED = new Set(['p','br','strong','b','em','i','u','ul','ol','li','h2','h3','h4','blockquote','a']);
const VOID = new Set(['br']);
const escapeText = (value) => value.replace(/&(?!(?:#\d+|#x[\da-f]+|[a-z][\da-z]+);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Strict allowlist sanitizer. Only formatting tags and safe http(s)/mailto links survive.
export function sanitizeHtml(input = '') {
  const tokens = String(input).match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+|</g) || [];
  const output = [];
  const stack = [];
  for (const token of tokens) {
    if (token.startsWith('<!--')) continue;
    const match = token.match(/^<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*)>$/);
    if (!match) { output.push(escapeText(token)); continue; }
    const [, closing, rawTag, rawAttrs] = match;
    const tag = rawTag.toLowerCase();
    if (!ALLOWED.has(tag)) continue;
    if (closing) {
      if (VOID.has(tag)) continue;
      const index = stack.lastIndexOf(tag);
      if (index >= 0) { for (let i = stack.length - 1; i >= index; i--) output.push(`</${stack.pop()}>`); }
      continue;
    }
    let attrs = '';
    if (tag === 'a') {
      const href = rawAttrs.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] || rawAttrs.match(/\bhref\s*=\s*([^\s>]+)/i)?.[1] || '';
      const safeHref = href.trim();
      if (/^(https?:|mailto:)/i.test(safeHref)) attrs = ` href="${safeHref.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" rel="nofollow noopener noreferrer"`;
    }
    output.push(`<${tag}${attrs}>`);
    if (!VOID.has(tag)) stack.push(tag);
  }
  while (stack.length) output.push(`</${stack.pop()}>`);
  return output.join('');
}

/**
 * Writes the prerendered site into dist/ after the client build (`vite build`)
 * and the SSR build (`vite build --ssr`, in dist-server/). `npm run build` runs
 * all three steps.
 *
 * For every public route it writes the page's real HTML and its <head> (title,
 * description, canonical URL, Open Graph, JSON-LD), plus a small script that
 * marks the page for a fresh client render when the browser's URL is not the
 * one that was rendered (a query string, or the 404 page). It also writes
 * 404.html and, for builds served from the site root (the canonical Vercel
 * deployment), sitemap.xml and robots.txt. See docs/SEO_AND_DEPLOYMENT.md.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const server = await import(pathToFileURL(path.join(root, 'dist-server', 'entry-server.js')).href);
const {
  render,
  pageMeta,
  NOT_FOUND_META,
  PRERENDER_PATHS,
  sitemapPaths,
  structuredData,
  headTags,
  SITE_URL,
  BASE_URL,
} = server;

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>'))
  throw new Error('dist/index.html is already prerendered: run `npm run build` from the start.');

/** Runs before the body is parsed, so a mismatching page never flashes. */
const clientRenderMarker = (renderedPath) =>
  `<script>(function(){var b=${JSON.stringify(BASE_URL)},r=${JSON.stringify(renderedPath)},p=location.pathname;` +
  `if(p.indexOf(b)===0)p="/"+p.slice(b.length);p=p.replace(/\\/+$/,"")||"/";` +
  `if(location.search||p!==r)document.documentElement.setAttribute("data-client-render","")})()</script>`;

function pageHtml(meta, appHtml, renderedPath) {
  return template
    .replace(/\s*<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, '')
    .replace(
      '</head>',
      `    ${headTags(meta, structuredData(meta))}\n    ${clientRenderMarker(renderedPath)}\n  </head>`,
    )
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

function write(relative, content) {
  const file = path.join(dist, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

for (const routePath of PRERENDER_PATHS) {
  const { html } = await render(routePath);
  const file = routePath === '/' ? 'index.html' : `${routePath.slice(1)}/index.html`;
  write(file, pageHtml(pageMeta(routePath), html, routePath));
}
const notFound = await render('/404');
write('404.html', pageHtml(NOT_FOUND_META, notFound.html, '/404'));

const rootBuild = BASE_URL === '/';
if (rootBuild) {
  const lastmod = lastCommitDate() ?? new Date().toISOString().slice(0, 10);
  const urls = sitemapPaths()
    .map(
      (p) => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
    .join('\n');
  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  write('robots.txt', robots());
}

console.log(
  `prerendered ${PRERENDER_PATHS.length} pages and 404.html for base ${BASE_URL}` +
    (rootBuild ? ', with sitemap.xml and robots.txt' : ' (mirror build: no sitemap or robots.txt)'),
);

/** The date of the last commit: when the site's content last changed. */
function lastCommitDate() {
  try {
    const date = execSync('git log -1 --format=%cs', {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Search engines and AI search crawlers may index the site. Crawlers that
 * collect training data for AI models are not allowed: that is the project
 * owner's decision to change (docs/SEO_AND_DEPLOYMENT.md).
 */
function robots() {
  return `# JVM Atlas: ${SITE_URL}/
# Search engines may crawl everything.
User-agent: *
Allow: /

# AI search and answer engines, which link to the pages they cite.
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# Model-training crawlers: not allowed until the project owner decides otherwise.
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

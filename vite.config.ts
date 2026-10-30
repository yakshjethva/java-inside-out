import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { STATIC_ROUTES } from './src/app/routePaths.ts';

const root = path.dirname(fileURLToPath(import.meta.url));

/** Normalises BASE_PATH to the "/segment/" form Vite expects. */
function resolveBase(raw: string | undefined): string {
  if (!raw || raw === '/') return '/';
  const trimmed = raw.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

/** Fonts subsets precached for offline use; other subsets are cached when first used. */
const PRECACHED_FONT = /-latin-[a-z]+-normal-[\w-]+\.woff2$/;

/**
 * GitHub Pages has no rewrite rules. After the build we write:
 *  - 404.html: unknown paths still boot the single-page app;
 *  - <route>/index.html: known routes answer with HTTP 200 and their own <title>;
 *  - sw.js: the service worker, prefixed with the list of files to precache.
 */
function githubPagesOutput(): Plugin {
  let outDir = path.join(root, 'dist');
  return {
    name: 'inside-java:github-pages-output',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const indexFile = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexFile)) return;
      const html = fs.readFileSync(indexFile, 'utf8');
      fs.writeFileSync(path.join(outDir, '404.html'), html);
      for (const route of STATIC_ROUTES) {
        const dir = path.join(outDir, route.path);
        fs.mkdirSync(dir, { recursive: true });
        const titled = html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${route.title} · Inside Java</title>`,
        );
        fs.writeFileSync(path.join(dir, 'index.html'), titled);
      }

      const assets = fs
        .readdirSync(path.join(outDir, 'assets'))
        .filter((file) => /\.(js|css)$/.test(file) || PRECACHED_FONT.test(file))
        .sort()
        .map((file) => `assets/${file}`);
      const precache = ['./', 'favicon.svg', ...assets];
      const version = createHash('sha256')
        .update(html)
        .update(precache.join('\n'))
        .digest('hex')
        .slice(0, 12);
      const worker = fs.readFileSync(path.join(root, 'src/sw/service-worker.js'), 'utf8');
      fs.writeFileSync(
        path.join(outDir, 'sw.js'),
        `const VERSION = '${version}';\nconst PRECACHE = ${JSON.stringify(precache)};\n${worker}`,
      );
    },
  };
}

export default defineConfig({
  base: resolveBase(process.env.BASE_PATH),
  plugins: [react(), tailwindcss(), githubPagesOutput()],
  resolve: {
    alias: { '@': path.join(root, 'src') },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit/setup.ts'],
    css: false,
  },
});

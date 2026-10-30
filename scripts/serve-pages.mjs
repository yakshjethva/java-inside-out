#!/usr/bin/env node
/**
 * Serves the production build the way GitHub Pages serves a project site, so
 * the Playwright tests exercise the real deployment conditions:
 *
 *  - every file lives under the base path (for example /java-inside-out/);
 *  - a directory requested without a trailing slash is redirected (301) to the
 *    slash form, keeping the query string;
 *  - a directory answers with its index.html;
 *  - anything else answers with 404.html and HTTP status 404.
 *
 * Usage: node scripts/serve-pages.mjs [--dir dist] [--base /java-inside-out/] [--port 4173]
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    dir: { type: 'string', default: 'dist' },
    base: { type: 'string', default: process.env.BASE_PATH ?? '/java-inside-out/' },
    port: { type: 'string', default: '4173' },
  },
});

const root = path.resolve(values.dir);
const trimmed = values.base.replace(/^\/+|\/+$/g, '');
const base = trimmed ? `/${trimmed}/` : '/';
const port = Number(values.port);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
};

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error(`No build found in ${root}. Run "npm run build" first.`);
  process.exit(1);
}

function sendFile(res, status, file, method) {
  res.writeHead(status, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  if (method === 'HEAD') res.end();
  else fs.createReadStream(file).pipe(res);
}

function notFound(res, method) {
  const page = path.join(root, '404.html');
  if (fs.existsSync(page)) sendFile(res, 404, page, method);
  else res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
}

const server = http.createServer((req, res) => {
  const method = req.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' }).end();
    return;
  }
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (`${url.pathname}/` === base) {
    res.writeHead(301, { location: `${base}${url.search}` }).end();
    return;
  }
  if (!url.pathname.startsWith(base)) {
    notFound(res, method);
    return;
  }

  let relative;
  try {
    relative = decodeURIComponent(url.pathname.slice(base.length));
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  const target = path.join(root, relative);
  if (path.relative(root, target).startsWith('..')) {
    notFound(res, method);
    return;
  }

  const stat = fs.statSync(target, { throwIfNoEntry: false });
  if (stat?.isFile()) {
    sendFile(res, 200, target, method);
    return;
  }
  if (stat?.isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      res.writeHead(301, { location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    const index = path.join(target, 'index.html');
    if (fs.existsSync(index)) {
      sendFile(res, 200, index, method);
      return;
    }
  }
  notFound(res, method);
});

server.listen(port, '127.0.0.1', () => {
  console.log(
    `Serving ${path.relative(process.cwd(), root) || '.'} at http://localhost:${port}${base}`,
  );
});

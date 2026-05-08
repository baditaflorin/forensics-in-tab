import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT ?? process.argv[2] ?? 4173);
const root = normalize(join(process.cwd(), 'docs'));
const base = '/forensics-in-tab';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
  const pathname = url.pathname === base ? `${base}/` : url.pathname;

  if (!pathname.startsWith(`${base}/`)) {
    response.writeHead(302, { Location: `${base}/` });
    response.end();
    return;
  }

  const relative = pathname.slice(base.length + 1) || 'index.html';
  const candidate = normalize(join(root, relative));
  const path =
    candidate.startsWith(root) && existsSync(candidate) ? candidate : join(root, 'index.html');
  const finalPath = statSync(path).isDirectory() ? join(path, 'index.html') : path;
  const type = contentTypes[extname(finalPath)] ?? 'application/octet-stream';

  response.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });
  createReadStream(finalPath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Pages preview: http://127.0.0.1:${port}${base}/`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

import { existsSync, readFileSync } from 'node:fs';

const indexPath = 'docs/index.html';

if (!existsSync(indexPath)) {
  throw new Error('docs/index.html was not produced');
}

const html = readFileSync(indexPath, 'utf8');

if (!html.includes('<div id="root"></div>')) {
  throw new Error('docs/index.html does not look like the Vite app shell');
}

if (!html.includes('/forensics-in-tab/assets/')) {
  throw new Error('docs/index.html assets are not using the GitHub Pages base path');
}

if (!existsSync('docs/404.html')) {
  throw new Error('docs/404.html SPA fallback was not produced');
}

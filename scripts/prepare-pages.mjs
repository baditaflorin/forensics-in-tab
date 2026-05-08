import { rmSync } from 'node:fs';

const generated = [
  'docs/assets',
  'docs/index.html',
  'docs/404.html',
  'docs/manifest.webmanifest',
  'docs/build-info.json',
  'docs/sw.js',
  'docs/robots.txt'
];

for (const path of generated) {
  rmSync(path, { recursive: true, force: true });
}

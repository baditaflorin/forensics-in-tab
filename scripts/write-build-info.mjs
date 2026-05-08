import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function run(command, fallback) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return fallback;
  }
}

const info = {
  name: pkg.name,
  version: pkg.version,
  commit: run('git rev-parse --short HEAD', 'dev'),
  fullCommit: run('git rev-parse HEAD', 'dev'),
  builtAt: new Date().toISOString(),
  repository: 'https://github.com/baditaflorin/forensics-in-tab',
  paypal: 'https://www.paypal.com/paypalme/florinbadita'
};

writeFileSync(
  new URL('../public/build-info.json', import.meta.url),
  `${JSON.stringify(info, null, 2)}\n`
);

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('static contract', () => {
  it('documents Mode A Pages deployment', () => {
    const adr = readFileSync('docs/adr/0001-deployment-mode.md', 'utf8');
    expect(adr).toContain('Mode A');
    expect(adr).toContain('Pure GitHub Pages');
  });
});

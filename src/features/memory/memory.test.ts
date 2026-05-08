import { describe, expect, it } from 'vitest';
import { analyzeMemory } from './memory';

describe('memory analysis', () => {
  it('extracts IOC-shaped strings and PE hints', () => {
    const text = 'cmd.exe http://example.test/payload 10.0.0.5 VirtualAlloc';
    const bytes = new Uint8Array(512);
    bytes.set(new TextEncoder().encode(text), 32);
    bytes[200] = 0x4d;
    bytes[201] = 0x5a;

    const analysis = analyzeMemory(bytes);

    expect(analysis.iocs.map((ioc) => ioc.type)).toContain('url');
    expect(analysis.iocs.map((ioc) => ioc.type)).toContain('ip');
    expect(analysis.iocs.map((ioc) => ioc.type)).toContain('api');
    expect(analysis.peFindings[0]?.offset).toBe(200);
  });
});

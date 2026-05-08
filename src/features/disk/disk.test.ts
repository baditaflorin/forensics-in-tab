import { describe, expect, it } from 'vitest';
import { analyzeDiskImage, parseMbrPartitions } from './disk';

describe('disk analysis', () => {
  it('parses MBR partition entries', () => {
    const bytes = new Uint8Array(512);
    bytes[510] = 0x55;
    bytes[511] = 0xaa;
    bytes[446] = 0x80;
    bytes[450] = 0x83;
    bytes[454] = 0x20;
    bytes[458] = 0x10;

    const partitions = parseMbrPartitions(bytes);

    expect(partitions).toHaveLength(1);
    expect(partitions[0]).toMatchObject({
      bootable: true,
      type: 'Linux filesystem',
      lbaStart: 32,
      sectors: 16
    });
  });

  it('carves files by known signatures', () => {
    const pdf = new TextEncoder().encode('%PDF-1.7 body %%EOF');
    const bytes = new Uint8Array(1024);
    bytes.set(pdf, 128);

    const analysis = analyzeDiskImage(bytes);

    expect(analysis.artifacts.some((artifact) => artifact.kind === 'PDF document')).toBe(true);
  });
});

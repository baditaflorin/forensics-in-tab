import { describe, expect, it } from 'vitest';
import { detectEvidenceKind, parsePastedEvidence } from './evidence';

describe('evidence helpers', () => {
  it('detects a disk image from an MBR signature', () => {
    const bytes = new Uint8Array(1024);
    bytes[510] = 0x55;
    bytes[511] = 0xaa;

    expect(
      detectEvidenceKind({
        name: 'unknown.bin',
        bytes
      })
    ).toBe('disk-image');
  });

  it('parses hex paste input', () => {
    expect(Array.from(parsePastedEvidence('4d 5a 90 00', 'hex'))).toEqual([0x4d, 0x5a, 0x90, 0x00]);
  });

  it('falls back to text encoding for plain pasted notes', () => {
    expect(Array.from(parsePastedEvidence('cmd.exe', 'auto'))).toEqual(
      Array.from(new TextEncoder().encode('cmd.exe'))
    );
  });
});

import { describe, expect, it } from 'vitest';
import { disassemble } from './disasm';

describe('disassembly', () => {
  it('returns instructions for common x86 bytes', async () => {
    const bytes = new Uint8Array([0x55, 0x48, 0x89, 0xe5, 0x90, 0xc3]);
    const result = await disassemble(bytes, {
      architecture: 'x86-64',
      offset: 0,
      length: bytes.length,
      address: 0x401000
    });

    expect(result.instructions.length).toBeGreaterThan(0);
    expect(result.instructions.map((instruction) => instruction.mnemonic)).toContain('ret');
  });
});
